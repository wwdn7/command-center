var list = angular.module('PVision');
list.constant('keywordsG', ['Harsh Braking', 'Speed Bump', 'Harsh Steering']);
list.constant('keywordsA', ['Lane Departure', 'Looking around', 'Yawning', 'On the phone', 'Eye closed']);
list.directive('updateAddress', ['$rootScope', '$q', '$animateCss', 'vehicleInfoServices', '$timeout', updateAddress]);
list.controller('alertList', ["$scope", "$compile", "valTransfer", "vehiStatus", "$q", "$state", "pouchdbCtrl", "$rootScope", "swal", "$localStorage", "$stateParams", 'utility', '$sessionStorage', 'filterService', 'keywordsG', 'keywordsA','exportService', '$timeout',
	function($scope, $compile, valTransfer, vehiStatus, $q, $state, pouchdbCtrl, $rootScope, swal, $localStorage, $stateParams, utility, $sessionStorage, filterService, keywordsG, keywordsA, exportService, $timeout) {
//		console.log($stateParams);
		var apiKey = 'AIzaSyDANsEavAQS9nwX9baymNwCxnWmjZh4gHQ';
		
		var excelOption = {
			formats: ['xlsx'],
			headers: true,
			exportButtons: false,
			ignoreCols: [0, 5],
			filename: 'alert list',
			bootstrap: true
		};
		
		exportService.setOption(excelOption);
		
		if($stateParams.type) {
			switch($stateParams.type) {
				case 3:
					var keywords = keywordsG;
					break;
				case 49:
					var keywords = keywordsA;
					break;
				default:
					var keywords = "";
					break;
			};
			$localStorage.alertType = $stateParams.type;
		} else if($localStorage.alertType == 3) {
			var keywords = keywordsG;
		} else {
			var keywords = keywordsA;
		};
		filterService.config({
			initKeywords: keywords,
		});

		$scope.alerts = [];

		if(!$stateParams.type) {
			//If user refresh the page, the record would stay last search
			$scope.alerts = $localStorage.alertCache;
		} else {
			updateAlerts($stateParams.records, $stateParams.type, $stateParams.lastWeek);
			if($stateParams.records !== 0) {
				angular.element(document).ready(function() {
					$scope.$broadcast('alertBeforeLoading');
				});
			}
		};

		//		$scope.getAnime = function(index){
		//			if(index < 10){
		//				return "alert-list";
		//			}
		//		}

		//Clear search data
		$scope.$on('$locationChangeSuccess', function() {
			$rootScope.data.filterTable = '';
		});

		function compareDate(recordTime) {
			var lastWeek = pouchdbCtrl.findLastSunday();
//			console.log(recordTime, lastWeek);
			//current time is larger than last week
			return recordTime >= lastWeek;
		};

		function updateAlerts(records, type, isLastWeek) {
			var t = new Date();
			var recordTime = t.getTime();
			//run last week database
			if(isLastWeek) {
				$rootScope.lastWeekDB.get("alarms_" + type).then(function(details) {
//						console.log(details, details.data.length, records);
						if(details.data.length !== records) { //if last record time is behind the end of last week, call api
							//exists, need to update
							callAlertAPI().then(function(result) {
								//								console.log(result);
								$scope.alerts = result;
								//								var armTime = result[result.length - 1].armTime;
								console.log('alerts number updated: ', result.length);
								return $rootScope.lastWeekDB.put({
									_id: "alarms_" + type,
									_rev: details._rev,
									data: $scope.alerts,
									//									armTime: armTime,
									recordTime: recordTime,
									geoCount: details.geoCount
								});
							});
						} else {
							$scope.alerts = details.data;
							//														console.log('loaded?', $scope.alerts);
							//							$scope.$apply();
						};

					})
					.catch(function(err) {
						console.log(err);
						callAlertAPI().then(function(result) {
							$scope.alerts = result;
							//							var armTime = result[result.length - 1].armTime;
							//							console.log(armTime, type, recordTime);
							return $rootScope.lastWeekDB.put({
								_id: "alarms_" + type,
								data: result,
								//								armTime: armTime,
								recordTime: recordTime
							});
						});
						return;
					});
			} else {
				//run this week database
				$rootScope.thisWeekDB.get("alarms_" + type).then(function(details) {
						console.log('this week database:', details);
						if($sessionStorage['ThisWeek_' + $stateParams.type] && $stateParams.records == $sessionStorage['ThisWeek_' + $stateParams.type]) {
							$scope.alerts = angular.copy(details.data);
						} else {
							//exists, need to update
							var startTime = new Date(details.armTime + 1000);
							startTime = startTime.toISOString().split('T')[0] + ' ' + startTime.toTimeString().split(' ')[0];
							callAlertAPI(startTime).then(function(result) {
								$scope.alerts = angular.copy(details.data.concat(result));
								var armTime = result[result.length - 1].armTime;
								console.log('alerts updated from: ', startTime, 'alerts number: ', result.length);
								return $rootScope.thisWeekDB.put({
									_id: "alarms_" + type,
									_rev: details._rev,
									data: $scope.alerts,
									armTime: armTime,
									recordTime: recordTime,
									geoCount: details.geoCount
								});
							});
						};
					})
					.catch(function(err) {
						console.log(err);
						callAlertAPI().then(function(result) {
							//							console.log(result);
							$scope.alerts = result;
							var armTime = result[result.length - 1].armTime;
							//							console.log(armTime, type, recordTime);
							return $rootScope.thisWeekDB.put({
								_id: "alarms_" + type,
								data: result,
								armTime: armTime,
								recordTime: recordTime
							});
						});
						return;
					});
			};
		};

		//call api to get all alerts
		function callAlertAPI(startTime) {
			var deferred = $q.defer();

			pouchdbCtrl.alert($localStorage.allDevID, $stateParams.type, $stateParams.records, $stateParams.lastWeek, startTime).then(function(result) {
//				console.log(result);
				if(result.data.result > 0) {
					swal({
						title: "No Result Found",
						text: "Please try again",
						type: "info",
						confirmButtonColor: "#DD6B55",
						confirmButtonText: "OK",
					});
				};
				var alerts = result.data.infos;
//				console.log(alerts);
				if(alerts[0]) {
					alerts.map(function(val, i) {
						$rootScope.items.some(function(item, j) {
							if(item.devStatus.devIdno == val.devIdno) {
								return alerts[i].devName = item.devInfo.userAccount.name;
							}
						});

						//ACC State
						alerts[i].acc = vehiStatus.acc(val.status1);

						//Distance
						// alerts[i].miles = vehiStatus.distance(val.liCheng);
						alerts[i].miles = utility.getLicheng(val.liCheng);

						//Speed
						// alerts[i].sudu = vehiStatus.speed(val.speed);
						alerts[i].sudu = utility.getSpeed(val.speed);

						alerts[i].armCnt = vehiStatus.getAlarmContent(val.armType, val.armInfo, val.devIdno);

						alerts[i].coordinate = gpsGetPosition(val.weiDu, val.jingDu);
						alerts[i].local = val.coordinate.lat + ", " + val.coordinate.lng;
//						alerts[i].g = {
//							x: val.param1
//						}
					});
				}

				if(alerts) {
					deferred.resolve(alerts);
				} else {
					deferred.reject(alerts);
				}
			});
			return deferred.promise;
		};

		function gpsGetPosition(weiDu, jingDu) {
			return {
				lat: weiDu / 1000000,
				lng: jingDu / 1000000
			};
		};

		$scope.showVehicle = function(alert) {
			// console.log(alert);
			valTransfer.setter(alert.coordinate);
			swal({
				// html: true,
				// confirmButtonText: "Close"
				html: true,
				width: 800,
				padding: 15,
				confirmButtonText: "Close"
			});
			var html = "<alert-map id='alert-map'></alert-map>" + "<p class='alert-map-info'>Speed: " + alert.sudu + " Mileage: " + alert.miles + "</br> Location: " + alert.local + "<p>";
			// var html = "<div style='width: 55%; height: 100%;float:left'><alert-map id='alert-map'></alert-map></div>" +
			// "<div style='width: 40%; height: 100%;float:right'><p class='alert-map-info'><b><h3>" + alert.armCnt + "</h3></b><br /><b>Speed:</b> " + alert.sudu + "<br /><b>Mileage: </b>" + alert.miles + "</br><b>Location: </b>" + alert.local + "<p>" +
			// "<alert-map id='alert-street'></alert-map></div>" +
			// "</div>";
			var target = document.getElementById('swal2-content');
			// console.log(target);
			target.innerHTML = html;
			$compile(target)($scope);
			//		$compile(angular.element(document.getElementById('swal2-content')).append($compile("<alert-map id='alert-map'></alert-map>")($scope)))($scope);
		};

		//store data if refresh the page
		var unbind = $scope.$watch('alerts', function(val) {
			if(val[0]) {
				//																console.log('cached?', val);
				$localStorage.alertCache = val;
				filterService.config({
					initData: val
				});
				$scope.$broadcast('afterLoading');
				if(!$stateParams.lastWeek && $stateParams.type) {
					//					console.log('hitted', $sessionStorage['ThisWeek_' + $stateParams.type], $stateParams.records);
					$sessionStorage['ThisWeek_' + $stateParams.type] = $stateParams.records;
				};
				$scope.$on('filterThis', function(event, arr) {
					$scope.alerts = filterService.filterThis(arr);
				});
				unbind();
			};
		});

		/**
		 * Show Picture of adas alert------ TODO
		 **/
		$scope.showPicture = function(alert) {

		}

		/**
		 * Show video of gsensor alert------TODO
		 **/
		$scope.showVideo = function(alert) {
//			console.log(alert);
//			console.log(alert.armTimeStr);
			var s = new Date(alert.armTimeStr).getTime() - 10000;
			var e = new Date(alert.armTimeStr).getTime() + 30000;
			var dat = alert.armTimeStr.split(' ')[0];
			var obj = {
				id: alert.devIdno,
				date: dat,
				start: valTransfer.covertTimeString(new Date(alert.armTimeStr)) - 20,
				end: valTransfer.covertTimeString(new Date(alert.armTimeStr)) + 20,
				timeBegin: new Date(s),
				timeEnd: new Date(e)
			}
			$state.go('record', obj);
			$timeout(function() {
				$rootScope.$broadcast('videoBeforeLoading');
			}, 100);
		}

	}
]);

function updateAddress($rootScope, $q, $animateCss, vehicleInfoServices, $timeout) {
	return {
		link: function($scope, $element) {
			//			console.log($scope);
			var armType = "";
			var armTime = undefined;
			/*
		 Call Google Geocoding Service API
		 * */
			function getLocation(item, elem) {
				if(!item.isGeocoded) {
					if(!item.jingDu || item.jingDu == 0) {
						item.local = "Not Available";
						item.isGeocoded = true;
					} else {
						vehicleInfoServices.getLocation([{
							lat: item.jingDu,
							lng: item.weiDu
						}]).then(function(result) {
//														console.log(result);
							if(result.data.result == 0) {
								if(result.data.location[0]) {
									item.local = result.data.location[0];
									$animateCss(elem, {
										keyframeStyle: '1s fadeIn'
									}).start();
									console.log('new address added');
									item.isGeocoded = true;
								}else {
									console.log('geocoding no result?', result.data);
								}
							}
							//							console.log(result);
						});
					}
				}
				return item;
			};

			function getArmWeek(armTime) {
				//find monday unix time number
				var t = new Date(vehicleInfoServices.findDate().monday());
				return armTime >= t.getTime();
			}

			//TODO
			function asyncGeocodeAll() {
				if($scope.alerts[0]) {
					var promises = [];

					$scope.alerts.map(function(item, i) {
						var deferred = $q.defer();
						if(!item.isGeocoded) {
							if(!item.jingDu || item.jingDu == 0) {
								item.local = "Not Available";
								item.isGeocoded = true;
//								console.log('no address: ', i);
								deferred.resolve(item);
							} else {
								vehicleInfoServices.getLocation([{
									lat: item.jingDu,
									lng: item.weiDu
								}]).then(function(result) {
									if(result.data.result == 0) {
										if(result.data.location[0]) {
											item.local = result.data.location[0];
											item.isGeocoded = true;
//											console.log('new address: ', i);
											deferred.resolve(item);
										} else {
											deferred.reject();
										}
									} else {
										deferred.reject();
									}
									//							console.log(result);
								}, function(error) {
									deferred.reject(error);
								});
							}
						} else {
							deferred.resolve(item);
						}
						promises.push(deferred.promise);
					});

					return $q.all(promises);
				}
			};

			function storeGeocodeResult() {
				var geoCount = 0;
				$scope.alerts.map(function(alert) {
					if(alert.isGeocoded) {
						geoCount++;
					}
				});
				//				console.log(geoCount);TODO
				if(armType == 49) { //判断报警类型是否为ADAS
					if(armTime == true) { //是否为本周ADAS记录
//						console.log('alerts records: ' + $scope.alerts.length, 'geocoded alerts:' + geoCount);
						$rootScope.thisWeekDB.get('alarms_49').then(function(doc) {
//								console.log(doc.geoCount, geoCount);
								if(geoCount !== doc.geoCount) { //反编译记录是否更新
									console.log('ThisWeek Database Updated due to Geocoding, original record:', doc.geoCount);

									return $rootScope.thisWeekDB.put({ //存储地址反编译结果到数据库
										_id: "alarms_49",
										_rev: doc._rev,
										data: $scope.alerts,
										armTime: doc.armTime,
										recordTime: doc.recordTime,
										geoCount: geoCount
									});
								};
							})
							.catch(function(err) {
								console.log(err);
								return;
							});
					} else {
//						console.log('alerts records: ' + $scope.alerts.length, 'geocoded alerts:' + geoCount);
						if(armTime == false) { //是否为上周ADAS记录
							$rootScope.lastWeekDB.get('alarms_49').then(function(doc) {
									if(geoCount != doc.geoCount) { //反编译记录是否更新
//										console.log('Database Updated due to Geocoding, original record:', doc.geoCount);

										return $rootScope.lastWeekDB.put({ //存储地址反编译结果到数据库
											_id: "alarms_49",
											_rev: doc._rev,
											data: $scope.alerts,
											recordTime: doc.recordTime,
											geoCount: geoCount
										});
									}
								})
								.catch(function(err) {
									console.log(err);
									return;
								});
						}
					}
				} else if(armType == 3) { //判断报警类型是否为Gsensor

					if(armTime == true) { //是否为本周Gsensor记录
//						console.log('alerts records: ' + $scope.alerts.length, 'geocoded alerts:' + geoCount);
						$rootScope.thisWeekDB.get('alarms_3').then(function(doc) {
								if(geoCount != doc.geoCount) { //反编译记录是否更新
									console.log('ThisWeek Database Updated due to Geocoding, original record:', doc.geoCount);

									return $rootScope.thisWeekDB.put({ //存储地址反编译结果到数据库
										_id: "alarms_3",
										_rev: doc._rev,
										data: $scope.alerts,
										armTime: doc.armTime,
										recordTime: doc.recordTime,
										geoCount: geoCount
									});
								}
							})
							.catch(function(err) {
								console.log(err);
								return;
							});
					} else {

						if(armTime == false) { //是否为上周Gsensor记录
//							console.log('alerts records: ' + $scope.alerts.length, 'geocoded alerts:' + geoCount);
							$rootScope.lastWeekDB.get('alarms_3').then(function(doc) {
									if(geoCount != doc.geoCount) { //反编译记录是否更新
//										console.log('Database Updated due to Geocoding, original record:', doc.geoCount);

										return $rootScope.lastWeekDB.put({ //存储地址反编译结果到数据库
											_id: "alarms_" + 3,
											_rev: doc._rev,
											data: $scope.alerts,
											recordTime: doc.recordTime,
											geoCount: geoCount
										});
									}
								})
								.catch(function(err) {
									console.log(err);
									return;
								});
						}
					}
				};
			};

			$scope.$watch('alerts', function(val) {
				if(val[0]) {

					//保存当前报警表格类型
					armType = val[0].armType;
					//保存当前报警周目
					//					armTime = val[0].armTime;
					armTime = getArmWeek(val[0].armTime);

					$element.ready(function() {
						var items = $element.find('tr.ng-scope');
						items.map(function(i) {
							if(!items[i].classList.contains('ng-hide')) {
								//								console.log(angular.element(items[i]).scope().a);
								//								console.log(items[i].cells[4]);
								angular.element(items[i]).scope().a = getLocation(angular.element(items[i]).scope().a, angular.element(items[i].cells[4]));
							}
						});
					});
//					$timeout(function(){storeGeocodeResult()},3000);
				};
			});

			$scope.$watch('data.currentPage', function(val) {
				//				console.log(val, $scope.vehicles);
				if(val > 1) {
					$element.ready(function() {
						var items = $element.find('tr.ng-scope');
						items.map(function(i) {
							if(!items[i].classList.contains('ng-hide')) {
								angular.element(items[i]).scope().a = getLocation(angular.element(items[i]).scope().a, angular.element(items[i].cells[4]));
							}
						});
					})
					$timeout(function(){storeGeocodeResult()},3000);
				}
			});

			$scope.geocodeAll = function() {
				asyncGeocodeAll().then(function(result) {
//					console.log(result);
					$scope.alerts = result;
					storeGeocodeResult();
				}, function(err) {
					console.log(err);
				});
			};

			/*用户跳转页面时存储更新的反编译地理位置结果到数据库，下次打开该页面时不需再更新*/
			$scope.$on('$destroy', function() {
				//				console.log('destroied', $scope.alerts);
				storeGeocodeResult();
			});
		},
	}
}
