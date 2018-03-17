angular
	.module('PVision')
	.constant('vehicleType', [{
			id: 1,
			type: 'car'
		},
		{
			id: 2,
			type: 'truck'
		},
		{
			id: 3,
			type: 'van'
		},
		{
			id: 4,
			type: 'coach'
		}
	])
	.controller('vehiDetail', ["$rootScope", "$scope", "$localStorage", "vehicleInfoServices", "$filter", "vehiStatus", "swal", "$state", "$timeout", "$indexedDB", "$uibModal", "$stateParams", "IPAddr", "$interval", "$compile", "vehicleType",
		function($rootScope, $scope, $localStorage, vehicleInfoServices, $filter, vehiStatus, swal, $state, $timeout, $indexedDB, $uibModal, $stateParams, IPAddr, $interval, $compile, vehicleType) {

			function findVehicle(data) {
				$scope.vehiData = undefined;
				$scope.chns = undefined;
				$scope.isAllowed = $localStorage.currentUser.valueOf().video;
				//				console.log($scope.isAllowed);

				//				function getID(){
				//					return $stateParams.id;
				//				};

				//				if($stateParams.id){
				//					if($localStorage.currentDevID !== $stateParams.id){
				//						console.log('device changed!');
				//						$scope.$broadcast('deviceChange');
				//					};
				//				};

				//				$scope.$watch(getID, function(event, data){
				//					if(data){
				//					console.log('sasasasasa', data);
				//					}
				//				})

				var unbind = $scope.$watch('items', function(newVal, oldVal) {
					//					$scope.$on('deviceChange', function(event, data) {
					//						unbind();
					//					});
					if(newVal) {
						newVal.some(function(item, i) {
							if(item.devStatus.devIdno == data) {
								//load channel names
								if(!$scope.chns) {
									$scope.chns = item.devInfo.chnName.split(',');
									$scope.chns.reverse();
									//									console.log($scope.chns);
								}
								//Init vehicle data
								$scope.vehiData = item;

								//Location
								var coordinate = {
									lat: $scope.vehiData.devStatus.weiDuEx,
									lng: $scope.vehiData.devStatus.jingDuEx
								};

								vehiStatus.location(coordinate, function(result) {
									return newVal[i].location = result;
								});

//								console.log($scope.vehiData);
								return item.devStatus.devIdno == data;
							}
						});
					}
				});
			};

			const serverIp = IPAddr;
			var serverPort = 6604; //Default is 6601
			var closeSecond = 60;
			var stopIndex = 0;

			//			var videoId = ['flash04', 'flash01', 'flash02', 'flash03', 'flash00'];

			function initFlash(obid, i) {
				//				console.log(obid, i);
				var player = swfobject.getObjectById(obid);
				if(player == null ||
					typeof player.setWindowNum == "undefined") {
					$timeout(initFlash, 50, true, obid, i);
				} else {
					//Language english:	swfobject.getObjectById(videoId).setLanguage("en.xml");
					player.setLanguage("en.xml");
					//Windows:  1, 4, 9
					//					player.setWindowNum(36);
					player.setWindowNum(1);
					//					player.setVideoInfo(0, "wahahahaha");
					//Server: defaut port is 6601
					player.setVideoInfo(0, obid.split('-')[0]);
					player.setServerInfo(serverIp, serverPort);
					//Start Video Previewindex	number	是	无	窗口下标（从0开始）
					/*jsession	string	是	无	用户登录返回的会话号
					devIdno	string	是	无	设备号
					channel	number	是	无	设备通道（从0开始）
					stream	number	是	无	视频码流
					1表示子码流，0表示主码流。*/
					player.startVideo(0, "", $localStorage.currentDevID, i, 1, true);
					player.setBufferTime(0, 2);
					player.stopVideo(0);

					//TODO close video after certain time
					angular.element(player).ready(function() {
						console.log(obid + ' initiated');
						//						console.log(player, swfobject);

						angular.element(player).mousemove(function(e) {
							//							console.log("vidoe started", e.target.id);
							//							timer = $timeout(closeVideo, 0, true, obid, true);
							$scope["stop" + i] = closeSecond;
							if($scope[obid]) {
								$interval.cancel($scope[obid]);
							}
							$scope[obid] = $interval(closeVideo, 1000, 61, true, obid, i);
						});
					});
					//					$timeout(closeVideo, 1000, true, obid);
				}
			};

			function closeVideo(obid, i) {
				//				console.log('Channel ' + obid, "close in: ", $scope["stop" + i]);
				if($scope["stop" + i] > 0) {
					$scope["stop" + i]--;
					//					$("#spanCloseSecond").text(closeSecond);
					//					$timeout(closeVideo, 1000, true, obid);
				} else {
					//					$("#closeTip").hide();
					swfobject.getObjectById(obid).stopVideo(0);
					$interval.cancel($scope[obid]);
					//					closeSecond = 600;
				}
			}

			$scope.$on('videoLoaded', function(event) {
				var params = {
					allowFullscreen: "true",
					allowScriptAccess: "always",
					//					play: "false",
					bgcolor: "#FFFFFF",
					//					menu: "false"
				};
				//			$("#spanCloseSecond").text(closeSecond);
				try {
					$timeout(function() {
						for(var i = 0; i < $scope.chns.length; i++) {
							if($scope.chns[i].toLowerCase() !== 'x') {
								swfobject.embedSWF("ttxplayer150725.swf", $scope.chns[i] + "-" + i, "320", "240", "11.0.0", null, null, params, null);
								$timeout(initFlash($scope.chns[i] + "-" + i, $scope.chns.length - 1 - i), 50);
							}
						}
					}, 100);
				} catch(e) {
					//TODO handle the exception
					console.log(e);
				}

			});

			//			$scope.$on('deviceChange', function(event, id) {
			//				findVehicle(id);
			//				$localStorage.currentDevID = id;
			//			});

			if($stateParams.id) {
				findVehicle($stateParams.id);
				//				$localStorage.currentDevID = $stateParams.id;
			} else if($localStorage.currentDevID) {
				$state.go('detail', {
					id: $localStorage.currentDevID
				});
			}

			//TODO
			$scope.editdevice = function() {
				$scope.vehicle = {
					idno: $scope.vehiData.devInfo.idno,
					vehicleCard: $scope.vehiData.devInfo.userAccount.name,
					icon: $scope.vehiData.devInfo.icon,
					chnCount: $scope.vehiData.devInfo.chnCount,
					chnName: getName($scope.vehiData.devInfo.chnName),
					ioInCount: $scope.vehiData.devInfo.ioInCount,
					ioInName: getName($scope.vehiData.devInfo.ioInName)
				};

				$scope.types = vehicleType;
				//				$scope.names = $scope.vehicle.chnName.split(',');

				swal.setDefaults({
					showCancelButton: true,
					animation: false,
					progressSteps: ['1', '2', '3']
				});

				$scope.getNumber = function(num) {
					return new Array(num);
				}

				function getName(name) {
					return name.toString().split(',');
				}

				function convertName(num, arr) {
					if(num !== arr.length) {
						var res = arr.slice(0, num);
						return res.join(',');
					} else {
						return arr.join(',');
					}
				}

				var count = 0;

				var steps = [{
						title: 'Vehicle Details',
						confirmButtonText: 'Next →',
						html: '<div class="col-sm-9 swal-input-container" data-fittext=".9"><label for="vehicleCard" style="margin-top:4px">Vehicle Name</label>' +
							'<input type="text" class="form-control" name="vehicleCard" ng-model="vehicle.vehicleCard" minlength="6" required /></div>' +
							'<div class="col-sm-9 swal-input-container" data-fittext=".9"><label for="icon">Vehicle Type</label>' +
							'<span ng-repeat="choice in types" ng-init="types=vehicle.icon"><input class="vehi-radio" type="radio" name="icon" ng-model="vehicle.icon" ng-value="choice.id">&nbsp;{{choice.type}}<br></span>'
					},
					{
						title: 'Vehicle Cameras Setting',
						confirmButtonText: 'Next →',
						html: '<form name="updateVehi">' +
							'<div class="col-sm-9 swal-input-container" data-fittext=".9"><label for="chnCount" style="margin-top:1.5%">Channel Number</label>' +
							'<input type="number" class="swal-input-number form-control" name="chnCount" ng-model="vehicle.chnCount" min="0" max="8"  required/></div>' +
							'<div ng-repeat="choice in getNumber(vehicle.chnCount) track by $index" class="col-sm-9 swal-input-container" data-fittext=".9"><label for="chnName">Channel {{$index+1}}</label>' +
							'<input type="text" class="form-control" name="chnName{{$index}}" ng-model="vehicle.chnName[$index]" minlength="1" required />' +
							'<div class="help-block pull-right" ng-messages="updateVehi[\'chnName\'+$index].$error">' +
							'<div ng-message="required">Please enter a valid value for this field.</div>' +
							'<div ng-message="minlength">The name you entered is too short.</div>' +
							'</div></div></form>'
					},
					{
						title: 'Vehicle I/O Setting',
						confirmButtonText: 'Sumit',
						html: '<form name="updateVehi">' +
							'<div class="col-sm-9 swal-input-container" data-fittext=".9"><label for="ioInCount" style="margin-top:1.5%">Channel Number</label>' +
							'<input type="number" class="swal-input-number form-control" name="ioInCount" ng-model="vehicle.ioInCount" min="0" max="8"  required/></div>' +
							'<div ng-repeat="choice in getNumber(vehicle.ioInCount) track by $index" class="col-sm-9 swal-input-container" data-fittext=".9"><label for="ioInName">Channel {{$index+1}}</label>' +
							'<input type="text" class="form-control" name="ioInName{{$index}}" ng-model="vehicle.ioInName[$index]" minlength="3" required />' +
							'<div class="help-block pull-right" ng-messages="updateVehi[\'ioInName\'+$index].$error">' +
							'<div ng-message="required">Please enter a valid value for this field.</div>' +
							'<div ng-message="minlength">The name you entered is too short.</div>' +
							'</div></div></form>'
					}
				];

				swal.queue(steps).then(function(result) {
					swal.resetDefaults();

					$scope.vehicle.chnName = convertName($scope.vehicle.chnCount, $scope.vehicle.chnName);
					$scope.vehicle.ioInName = convertName($scope.vehicle.ioInCount, $scope.vehicle.ioInName);

					vehicleInfoServices.updateVehiInfo($scope.vehicle).then(function(result) {
						if(result.data.result == 0) {
							swal({
								title: 'Done',
								type: 'success',
								text: 'Vehicle ' + $scope.vehiData.devInfo.idno + ' has been updated!',
								showCancelButton: false
							});
						} else {
//							console.log($scope.vehicle);
							swal('Failed!', 'Please try again later. ', 'error');
						}
					});
				}, function(err) {
					swal.resetDefaults();
//					console.log($scope.vehicle);
					console.log("error: ", err);
				});

				var target = document.getElementById('swal2-content');
				$compile(target)($scope);

				angular.element('.swal2-confirm').on('click', function(e) {
					var target = document.getElementById('swal2-content');
					$compile(target)($scope);

					//					angular.element('.swal-input-number').bind("mousedown", function() {
					//						console.log('clicked', $scope.chnCount);
					//						$scope.$apply();
					//					});

					angular.element('.swal2-confirm').on('click', function(e) {
						var target = document.getElementById('swal2-content');
						$compile(target)($scope);
					});
				});

			}

			$scope.trackDetail = function(id) {
				$state.go('track', {
					id: id
				});
				console.log(id);
				//				$timeout(function() {
				//					$rootScope.$broadcast('deviceChange', id);
				//				}, 100);
			}

			$scope.playRecord = function(id) {
				$state.go('record', {
					id: id
				});
				console.log(id);
				//				$timeout(function() {
				//					$rootScope.$broadcast('deviceChange', id);
				//				}, 100);
			};

			$scope.viewAlarmIssue = function(id) {
				//		console.log(id);
				$scope.notifications = [];
				$indexedDB.openStore('alerts', function(store) {
					// build query search by device id
					var find = store.query();
					find = find.$eq(id);
					find = find.$index("time_idx");

					//find alerts under id
					store.eachWhere(find).then(function(e) {
						$scope.notifications = e;
						//	    		console.log($scope.notifications);
						var modalInstance = $uibModal.open({
							animation: true,
							ariaLabelledBy: 'modal-title',
							ariaDescribedBy: 'modal-body',
							templateUrl: 'myModalContent.html',
							controller: 'ModalInstanceCtrl',
							controllerAs: 'vm',
							size: 'lg',
							resolve: {
								notifications: function() {
									var notifications = $filter('orderBy')($scope.notifications, '-armTime');
									notifications.map(function(val, i) {
										notifications[i].type = vehiStatus.getAlarmType(val.armType);
										notifications[i].info = vehiStatus.getAlarmContent(val.armType, val.armInfo, val.devIdno);
									});
									return notifications;
								}
							}
						});
					});
				});
			};

			$scope.ifAlarm = function(id) {
				if($rootScope.currentAlerts) {
					$scope.isNotified = $rootScope.currentAlerts.some(function(value) {
						return value.devIdno === id;
					});
					//			console.log($scope.isNotified);
					return !$scope.isNotified;
				};
			};

			$scope.ifRecord = function() {
				if($scope.vehiData) {
					if($scope.vehiData.devStatus.online !== 1) {
						return true;
					};
				}
			};

			$scope.recTitle = function() {
				if($scope.ifRecord()) {
					return "Device OFFLINE";
				}
			}

			$scope.notiTitle = function() {
				if(!$scope.isNotified) {
					return "checked";
				}
			};

		}
	]);