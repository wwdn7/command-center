angular
	.module('PVision')
	.constant("Privilege", {
		PeaceOfMind: "PeaceOfMind",
		Mornitoring: "Mornitoring",
		Streaming: "Streaming",
		LiveManagement: "LiveManagement"
	})
	.run(["$rootScope", "$indexedDB", "$localStorage", "$filter", "$http", "$location", "toastr", "vehiStatus", "$timeout", "swal", "$state", "$transitions", "Privilege", "$window",
		function($rootScope, $indexedDB, $localStorage, $filter, $http, $location, toastr, vehiStatus, $timeout, swal, $state, $transitions, Privilege, $window) {

			$transitions.onBefore({}, function(transition) {
				if($localStorage.currentUser) {
					if($localStorage.currentUser.valueOf().roleName === Privilege.PeaceOfMind) {
						//				console.log(transition.from().name, 'and', transition.to().name);
						if(transition.to().name === "detail" || transition.to().name === "list" || transition.to().name === "alert-list") {
							if(transition.from().name === "") {
								return transition.router.stateService.target('index');
							} else { //阻止用户级别为最低的跳转detail页面
								return false;
							}
						}
					}
				}
			});

			$transitions.onBefore({
				to: 'detail'
			}, function(transition) {
				if(transition.params().id) {

					if($localStorage.allDevID) {
						var ids = $localStorage.allDevID.split(',');

						if(ids.indexOf(transition.params().id) === -1) {
							//does not exists
							console.log('device not exists/ready: ', transition.params().id);
							return transition.router.stateService.target('index');
						} else {
							$localStorage.currentDevID = transition.params().id;
						}
					} else {
						return false;
					}

					//					console.log('transition.params().id', $localStorage.allDevID.split(','));
					//					var unbind = $rootScope.$watch('items', function(val) {
					//						if(val) {
					//							unbind();
					//							var ifDevExist = val.some(function(item, i) {
					//								if(item.devStatus.devIdno == transition.params().id) {
					//									if(item.devStatus.online == null) {
					//										console.log('device not connected!');
					//										swal({
					//											title: "Device Not Available",
					//											text: "Device not connected!",
					//											type: "error",
					//											confirmButtonColor: "#DD6B55",
					//											confirmButtonText: "OK",
					//										});
					//										return $state.go('index');
					//									} else {
					//										$localStorage.currentDevID = transition.params().id; //if item exist, store id to localStorage
					////										console.log('device id stored', $localStorage.currentDevID);
					//									}
					//								}
					//								return item.devStatus.devIdno == transition.params().id;
					//							});
					//
					//							if(!ifDevExist) {
					//								console.log('device not ready!', transition.params().id);
					//								//								return false;
					//								return $state.go('index');
					//							}
					//						}
					//					});
					//
					//					return true;
				}
			});
			
			//get user language setting
			//			$rootScope.languageSetting = navigator.language;
			//$indexedDB.databaseInfo().then(function(val){
			//	console.log(navigator);
			//})
			//how to get localStorage value
			//			console.log(typeof window.localStorage.getItem("ngStorage-currentUser"));
			//			console.log($localStorage.currentUser);

			//redirect to login page if not logged in and trying to access a restricted page
			$rootScope.$on('$locationChangeStart', function(event, next, current) {
				var publicPages = ['auth/'];
				var redirectPages = ['redirecting/'];
				var restrictedPage = publicPages.indexOf($location.path()) === -1;
				var redirectPage = redirectPages.indexOf($location.path()) === -1;
				
				if(!redirectPage) {
					if($location.search()) {
						console.log($location.search().client_id);
					}else {
						//TODO
						$location.path('auth/');
					}
				}else if($localStorage.currentUser) {
					if(restrictedPage && !$localStorage.currentUser.valueOf().token) {
						console.log("token has been deleted or expired!");
						$location.path('auth/');
					};
				} else {
					$location.path('auth/');
				}
			});
			
			function compareDate(armTime) {
				var t = new Date();
				var today = t.getDate();

				var lastWeek = new Date();
				lastWeek.setDate(today - 7);
				lastWeek = lastWeek.getTime();

				//				console.log(lastWeek);
				return armTime >= lastWeek;
			};

			function isToday(armTime) {
				var today = new Date();
				today.setHours(0);
				today.setMinutes(0);
				today.setSeconds(0);

				today = today.getTime();
				//								console.log(today);
				return armTime >= today;
			};

			function openSwal(val, armTime) {
				var event = vehiStatus.getAlarmType(val.devStatus.alarmType);
				var t = new Date(val.devStatus.alarmTime);
				time = t.toLocaleString();
				toastr.warning(event + '</br>Triggered @ ' + time, val.devInfo.userAccount.name, {
					onTap: function() {
						var item = angular.copy(val.devStatus.devIdno);
						//						console.log(item);
						$state.go('detail', {
							id: item
						});
						//						$timeout(function(){$rootScope.$broadcast('deviceChange', item);},100);
					},
					progressBar: true,
					timeOut: 10000
				});
			};

			/*Store alert in Database*/
			$rootScope.$watch('items', function(newVal) {
				if(newVal) {
					var set = new Set();

					//				console.log(newVal);
					newVal.map(function(val) {
						set.add(val.devInfo.devGroupId);
						//					if(val.devStatus.alarmType > 0 && val.devStatus.alarmTime !== oldVal[i].devStatus.alarmTime)
						if(val.devStatus.alarmType == 53 || val.devStatus.alarmType == 49) {
							//														console.log(val);
							if(isToday(val.devStatus.alarmTime) && $localStorage.currentUser.valueOf().roleName !== Privilege.PeaceOfMind) { //TODO 用户级别为最低时不报警
								$indexedDB.openStore('alerts', function(store) {
									store.insert({
										"armTime": val.devStatus.alarmTime,
										"devIdno": val.devStatus.devIdno,
										"armType": val.devStatus.alarmType,
										"armInfo": val.devStatus.alarmInfo,
										"devName": val.devInfo.userAccount.name,
										"mileage": val.devStatus.liCheng,
										"coordinates": {
											lat: val.devStatus.weiDuEx,
											lng: val.devStatus.jingDuEx
										},
										"speed": {
											speed: val.devStatus.speed,
											parkTime: val.devStatus.parkTime,
											fangXiang: val.devStatus.hangXiang
										},
										"checked": true
									}).then(function(e) {
										//do something?
										//										console.log("alert stored in database, ID: ", e);
										$rootScope.$broadcast('NotifyUpdated');
										openSwal(val, e);
									});

								});
							}
						}
					});
					var groupID = Array.from(set);
					groupID.sort();
					if($localStorage.devGroup) {
						if(JSON.stringify($localStorage.devGroup) !== JSON.stringify(groupID)) {
							$localStorage.devGroup = groupID;
							//				 			console.log("vehicle group set updated", $localStorage.devGroup);
						}
					} else {
						$localStorage.devGroup = groupID;
						//			 			console.log("vehicle group set created", $localStorage.devGroup);
					}
				};
			});

			function storeAlert() {
				$indexedDB.openStore('alerts', function(store) {
					store.getAll().then(function(result) {
						result.map(function(val) {
							if(!compareDate(val.armTime)) {
								store.delete(val.armTime).then(function() {
									console.log("expired data deleted, device name: ", val.devName);
								})
							}
						});

						var currentAlerts = result.filter(function(val) {
							return val.checked == true;
						});
						$rootScope.currentAlerts = $filter('orderBy')(currentAlerts, '-armTime');
						$rootScope.currentAlerts.map(function(val, i) {
							$rootScope.currentAlerts[i].type = vehiStatus.getAlarmType(val.armType);
							$rootScope.currentAlerts[i].info = vehiStatus.getAlarmContent(val.armType, val.armInfo);
						});
						//						 console.log("current notifications: ", $rootScope.currentAlerts.length);
					});

				});
			};

			storeAlert();

			$rootScope.$on('NotifyUpdated', function() {
				storeAlert();
				console.log("Notification Updated!");
			});

			/*Store all active device in rootScope after refresh the page*/
			$rootScope.$watch('items', function(newVal, oldVal) {
				var ids = [];
				if(angular.isDefined(newVal)) {
					//				console.log(newVal);
					newVal.map(function(val, i) {
						if(val.online) {
							ids.push(newVal[i].devStatus.devIdno);
						}
					});

					if(angular.isDefined($localStorage.allDevID)) {
						var oldDevs = $localStorage.allDevID.split(',');
						if(ids.length !== oldDevs.length) {
							$localStorage.allDevID = ids.join();
							//TODO new toaster?
							var addedDevice = vehiStatus.compareUpdate(ids, oldDevs);

							if(addedDevice[0]) {
								console.log("Device Activated. ID: ", addedDevice);
								toastr.info('Device ' + addedDevice.join() + ' Activated', 'Device Update', {
									onTap: function() {
										$state.go('detail', {
											id: addedDevice[0]
										});
									},
									autoDismiss: false,
									timeOut: 0
								});

								var t = new Date();

								$indexedDB.openStore('alerts', function(store) {
									store.insert({
										"armTime": t.getTime(),
										"devIdno": addedDevice.join(),
										"armType": 'activate',
										"armInfo": 'Device Activated',
										"devName": 'Device',
										"mileage": null,
										"coordinates": null,
										"speed": {
											speed: null,
											parkTime: null,
											fangXiang: null
										},
										"checked": true
									}).then(function(e) {
										//do something?
										console.log('device notification stored in database.', e);
										$rootScope.$broadcast('NotifyUpdated');
									});
								});
							}
						}
					} else {
						$localStorage.allDevID = ids.join();
						console.log("Active Devices loaded.", $localStorage.allDevID);
					}
					//				$rootScope.allDevID = ids.join();

				}
			});

		}
	]);