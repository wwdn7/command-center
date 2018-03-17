angular
	.module('PVision')
	.controller('trackResult', ['$scope', '$stateParams', '$interval', 'vehicleInfoServices', '$rootScope', '$state', 'valTransfer', '$timeout', 'utility', '$q', '$localStorage', 'Host', 'trackService', 'allDevIDs', 'exportService', trackResult])
	.directive('addressFade', ['$animateCss', addressFade]);

function trackResult($scope, $stateParams, $interval, vehicleInfoServices, $rootScope, $state, valTransfer, $timeout, utility, $q, $localStorage, Host, trackService, allDevIDs, exportService) {
	var apiKey = 'AIzaSyDANsEavAQS9nwX9baymNwCxnWmjZh4gHQ';
	var apiLimits = 500;
	$scope.active = 0;
	$scope.rowClicked = null;
	$scope.gAlerts = [];
	$scope.adasAlerts = [];
	$scope.allEvents = [];
	$scope.scrConfig = {
		autoHideScrollbar: true,
		theme: 'minimal-dark',
		//	  	setHeight: 400,
		//	  	scrollInertia: 0
	};

	function getStartZuobiao(coors) {
		var index = 0;
		coors.some(function(coor, i) {
			if(coor.jingDu) {
				index = i;
				return coor.jingDu != 0;
			}
		});
		return index;
	}

	function getEndZuobiao(coors) {
		var index = coors.length - 1;
		for(var i = coors.length - 1; i >= 0; i--) {
			//			console.log(coors[i]);
			if(coors[i].jingDu && coors[i].jingDu != 0) {
				index = i;
				return index;
			}
		}
	}

	function getCoorParams(zuobiao) {
		return zuobiao.reduce(function(result, coor, i) {
			if(i == 0) {
				return result;
			}
			var lat = result.lat + "," + coor.lat;
			var lng = result.lng + "," + coor.lng;
			return {
				lat: lat,
				lng: lng
			};
		}, zuobiao[0]);
	}

	if($stateParams.start) {
//		console.log($stateParams);
		calltrackAPI($stateParams);
	}

	if($stateParams.armInfo != 0) {
		//		console.log($stateParams.armInfo);
		angular.element(document).ready(function() {
			//			var navBar = angular.element('.nav-tabs');
			//			console.log(navBar);
			if($stateParams.armInfo.armType == 53) {
				$scope.active = 3;
				//					var activedTab = navBar.find(".active");
				//					var activateTab = navBar.find("[heading='Driving Events']");
				//				console.log(activedTab);
				//				console.log(activateTab);
				//					activedTab.removeClass("active");
				//					activateTab.addClass("active");
				$scope.$watch('gAlerts', function(alarms) {
					//						console.log(alarms);
					if(alarms) {
						//							console.log(alarms);
						if(alarms.length == 1) {
							$scope.rowClicked = alarms[0];
							$scope.$on('TrackResult', function(event, trips) {
								if(trips) {
									$timeout(function() {
										$scope.$broadcast('showGSensor', alarms[0]);
										$stateParams = undefined;
										//											console.log($stateParams);
									}, 200);
								}
							});
						} else {
							var index = alarms.findIndex(function(alarm) {
								return $stateParams.armInfo.armTime == alarm.armTime;
							});
							console.log(index);
							$scope.rowClicked = alarms[index];
							$scope.$on('TrackResult', function(event, trips) {
								if(trips) {
									$timeout(function() {
										$scope.$broadcast('showGSensor', alarms[index]);
										$stateParams = undefined;
										//											console.log($stateParams);
									}, 200);
								}
							});
						}
					}
				})
			} else if($stateParams.armInfo.armType == 49) {
				$scope.active = 2;
				$scope.$watch('adasAlerts', function(alarms) {
					if(alarms) {
						console.log(alarms);
						if(alarms.length == 1) {
							$scope.rowClicked = alarms[0];
							$timeout(function() {
								$scope.$broadcast('showAdas', alarms[0]);
								$stateParams = undefined;
							}, 0);
						} else {
							var index = alarms.findIndex(function(alarm) {
								return $stateParams.armInfo.armTime == alarm.armTime;
							});
							console.log(index);
							$scope.rowClicked = alarms[index];
							$timeout(function() {
								$scope.$broadcast('showAdas', alarms[index]);
								$stateParams = undefined;
							}, 0);
						}
					}
				})
			}
		});
	}

	$scope.$on('QueryVehicle', function(event, b) {
		$scope.afterLoading = false;
		$scope.adasAlertsAfterLoading = false;
		$scope.gAlertsAfterLoading = false;
		$scope.speedingAlertsAfterLoading = false;
		calltrackAPI(b);
	});

	//if track specific alarm and not exist yet, pop up alert
	function tryAgain(type) {

		var context;

		switch(type) {
			case 53:
				var context = "G-sensor alarm not ready yet!";
				break;
			case 49:
				var context = "ADAS alarm not ready yet!";
				break;
		};

		swal({
			title: "Please come back later",
			text: context,
			type: "info",
			confirmButtonColor: '#d33',
			confirmButtonText: 'OK'
		});
	}

	function getCoorPrm(zuobiao) {
		return zuobiao.reduce(function(result, coor, i) {
			if(i == 0) {
				return result;
			}
			var lat = result.lat + "," + coor.lat;
			var lng = result.lng + "," + coor.lng;
			return {
				lat: lat,
				lng: lng
			};
		}, zuobiao[0]);
	}

	function calltrackAPI(passVal) {

		exportService.setOption(passVal);
//											console.log(passVal);
		// $rootScope.items.some(function(item) {
		//   if(item.devInfo.idno == passVal.id) {
		//     //	          			console.log(item.devInfo.idno ,passVal);
		//     $scope.devicename = item.devInfo.userAccount.name;
		//   }
		// })
		vehicleInfoServices.track(passVal.id, passVal.start, passVal.end).then(function(response) {
			$scope.speedAlerts = [];
			$scope.trips = [];
			$scope.devicename = "";
			var coorReqs = [];
			if(response.data.result > 0) {
				$rootScope.$broadcast('afterLoading');
				$scope.afterLoading = true;
				$scope.speedingAlertsAfterLoading = true;
				angular.element(document).find('button.btn.btn-primary').prop('disabled', false);
			}

			vehicleInfoServices.checkResult(response.data.result);
			//					var pageArray = vehicleInfoServices.createPageArray(response.data.pagination);
			var totalRecords = response.data.pagination.totalRecords;
			vehicleInfoServices.track(passVal.id, passVal.start, passVal.end, totalRecords).then(function(data) {
				// $rootScope.$broadcast('afterLoading');
				$scope.afterLoading = true;
				//  console.log("track: " ,data);

				$scope.devicename = allDevIDs.deviceMap.get(passVal.id);

				// enable the search button
				angular.element(document).find('button.btn.btn-primary').prop('disabled', false);
				var vehicles = data.data.infos;
				if(totalRecords < 2) {
					$rootScope.$broadcast('afterLoading');
					$scope.afterLoading = true;
					$scope.speedingAlertsAfterLoading = true;
					swal({
						title: "No Result Found",
						text: "Please try again later",
						type: "info",
						confirmButtonColor: '#d33',
						confirmButtonText: 'OK'
					});
					$scope.trips = [];
				};
				/*
        * Testing accoff to define journey
        *
        * 							$scope.vehicles.map(function(val, i) {


        //Status
        var status1 = val.status1;

        if(vehiStatus.acc(status1) === "OFF"){
        console.log("ACC OFF" ,$scope.vehicles[i]);
      }

    });*/
				console.log('原始结果记录条数：', vehicles.length);
				var startpoint = []; //初始化 分割点数组
				$scope.trips = []; //初始化最后结果
				var filterIndex = [];

				/*
				 * 过滤无效数据
				 */
				//				vehicles.reduce(function(oldVal, newVal, i) {
				//					//					console.log(oldVal);
				//					var acc = (newVal.status1 >> 1) & 1;
				//					var timeGap = newVal.trackTime - oldVal.trackTime;
				//					if(acc == 0 && newVal.parkTime > 180) { //如果ACC状态为OFF并且停车时常超过3分钟，过滤当前记录
				//						console.log(i, 'parkTime: ' + newVal.parkTime);
				//						remNum++;
				//						filterIndex.push(i);
				//						vehicles.splice(i - remNum, 1);
				//					} else if(timeGap < 2000) { //如果相邻两条记录相隔时间小于2秒，过滤当前记录
				//						console.log(i, "timeGap: " + timeGap / 1000 + "秒");
				//						filterIndex.push(i);
				//						vehicles.splice(i, 1);
				//						remNum++;
				//					}
				//					return newVal;
				//				}, []);

				$scope.vehicles = vehicles.filter(function(val, i) {
					var acc = (val.status1 >> 1) & 1;
					if(acc == 0 && val.parkTime > 180) { //如果ACC状态为OFF并且停车时常超过3分钟，过滤当前记录
						//							console.log(i, 'parkTime: ' + val.parkTime);
						filterIndex.push(i);
						return false;
					}

					if(i > 0) {
						var timeGap = val.trackTime - vehicles[i - 1].trackTime;
						if(timeGap < 2000) { //如果相邻两条记录相隔时间小于2秒，过滤当前记录
							//							console.log(i, "timeGap: " + timeGap / 1000 + "秒");
							filterIndex.push(i);
							return false;
						}
					}

					return true;
				});

				/*
				 获取超速报警信息 TODO
				 * */
				trackService.getSpeedAlerts($scope.vehicles).then(function(result) {
					console.log('speed alert result: ', result.length, result);

					$scope.speedAlerts = result;

					var promises = [];
					$scope.speedAlerts.map(function(elem, i) {
						//loop element to find first available coordinate
						var a = getStartZuobiao(elem);
						elem.startZuobiao = {
							lat: elem[a].jingDu,
							lng: elem[a].weiDu
						}

						//loop element to find last available coordinate
						var b = getEndZuobiao(elem);
						elem.endZuobiao = {
							lat: elem[b].jingDu,
							lng: elem[b].weiDu
						};

						elem.startL = elem[a].mapWeiDu + ", " + elem[a].mapJingDu;
						elem.endL = elem[b].mapWeiDu + ", " + elem[b].mapJingDu;
						// elem.start = elem[0].gpsTime;
						elem.start = elem[a].trackTime;
						elem.startTime = elem[a].gpsTime;
						// elem.end = elem[elem.length - 1].gpsTime;
						elem.end = elem[b].trackTime;
						elem.endTime = elem[b].gpsTime;
						// elem.topSpeed = Math.max.apply(Math, elem.map(function(item){return item.speed})) / 10 + ' Km/h';
						// elem.speedLimit = elem[0].speedLimit + ' km/h';
						elem.ts = Math.max.apply(Math, elem.map(function(item) {
							return item.speed;
						}));
						elem.topSpeed = utility.getSpeed(Math.max.apply(Math, elem.map(function(item) {
							return item.speed;
						})));
						elem.sl = elem[a].speedLimit;
						elem.speedLimit = utility.getSpeedLimit(elem[a].speedLimit);
						elem.os = elem.ts / 10 - elem.sl;
						elem.overSpeed = utility.getOverSpeed(Math.max.apply(Math, elem.map(function(item) {
							return item.speed;
						})), elem[a].speedLimit);
						elem.d = elem[b].trackTime - elem[a].trackTime;
						elem.duration = utility.calculateDuration(elem[a].gpsTime, elem[b].gpsTime);

						//得到API所有参数
						if(elem[a].position && elem[b].position) {
							elem.startL = elem[a].position;
							elem.endL = elem[b].position;
						} else if($scope.speedAlerts.length < apiLimits) {

							/*
							 Call Google API geocoding service
							 * */
							vehicleInfoServices.getLocation([elem.startZuobiao, elem.endZuobiao]).then(function(result) {
								if(result.data.result == 0) {
									if(result.data.location[0]) {
										elem.startL = result.data.location[0];
									}
									if(result.data.location[1]) {
										elem.endL = result.data.location[1];
									}
									elem.isLocated = true;
								}
								//						console.log(result);
							});
						} else {
							var coor = getCoorPrm([elem.startZuobiao, elem.endZuobiao]);
							var param = {
								jsession: $localStorage.currentUser.token,
								lat: coor.lat,
								lng: coor.lng,
								arrInd: i,
								ignoreLoadingBar: true
							}

							promises.push(param);
						}
					});

					//TODO Make promise chain for location
					var url = Host + "/VehicleApiAction_getLocation.action";
					promises.reduce(function(p, val, i) {
						// The initial promise object
						if(p.then === undefined) {
							p.resolve();
							p = p.promise;
						}
						return p.then(function() {
							return vehicleInfoServices.returnHttp(url, val).then(function(result) {

								if(result.data.result == 0) {
									var index = result.config.params.arrInd;
									if(result.data.location[0]) {
										$scope.speedAlerts[index].startL = result.data.location[0];
									}
									if(result.data.location[1]) {
										$scope.speedAlerts[index].endL = result.data.location[1];
									}
									$scope.speedAlerts[index].isLocated = true;
								}
								return true;
							});
						});
					}, $q.when(true));
				})

				//				console.log(filterIndex);

				console.log('过滤后的结果：', $scope.vehicles.length, 'removed element count: ', filterIndex.length);
				/*
				 * 判断分割点
				 */
				$scope.vehicles.map(function(val, i) {
					if(i > 0) {
						if((val.trackTime - $scope.vehicles[i - 1].trackTime) > 600000) {
							startpoint.push(i);
							// console.log('time passed', i);
						}
					}
				});

				/*
				 * 分割过滤后的结果为每段旅程
				 */
				if(startpoint[0]) {
					startpoint.map(function(val, i) {
						if(i == 0) {
							$scope.trips.push($scope.vehicles.slice(0, val));
							if(startpoint.length == 1) {
								$scope.trips.push($scope.vehicles.slice(val, $scope.vehicles.length - 1));
							}
						} else if(i == startpoint.length - 1) {
							$scope.trips.push($scope.vehicles.slice(startpoint[i - 1], val));
							$scope.trips.push($scope.vehicles.slice(val, $scope.vehicles.length - 1));
						} else {
							$scope.trips.push($scope.vehicles.slice(startpoint[i - 1], val));
						}

					})
				} else {
					$scope.trips = [$scope.vehicles];
				}

				$scope.$broadcast('TrackResult', $scope.vehicles);

				//如果单段旅程只有一条记录，删除该记录
				$scope.trips = $scope.trips.filter(function(elem) {
					return elem.length > 1;
				});

				if($scope.trips[0] && $scope.trips[0].length > 0) {

					//初始化 地理位置API array
					var params = [];
					var total_duration = 0;

					$scope.trips.map(function(val, i) {

						var a = getStartZuobiao(val);
						var b = getEndZuobiao(val);

						$scope.trips[i].startZuobiao = {
							lat: val[a].jingDu,
							lng: val[a].weiDu
						};

						$scope.trips[i].endZuobiao = {
							lat: val[b].jingDu,
							lng: val[b].weiDu
						}

						$scope.trips[i].beginWeizhi = val[a].mapWeiDu + ", " + val[a].mapJingDu;
						$scope.trips[i].endWeizhi = val[b].mapWeiDu + ", " + val[b].mapJingDu;
						//						  		console.log(startZuobiao);

						//得到API所有参数
						if(val[a].position && val[b].position) {
							val.beginWeizhi = val[a].position;
							val.endWeizhi = val[b].position;
						} else if($scope.trips.length < apiLimits) {
							/*
							 Call Google API geocoding service
							 * */
							vehicleInfoServices.getLocation([$scope.trips[i].startZuobiao, $scope.trips[i].endZuobiao]).then(function(result) {
								if(result.data.result == 0) {
									if(result.data.location[0]) {
										$scope.trips[i].beginWeizhi = result.data.location[0];
									}
									if(result.data.location[1]) {
										$scope.trips[i].endWeizhi = result.data.location[1];
									}
									$scope.trips[i].isLocated = true;
								}
								//							console.log(result);
							});
						} else {
							var coor = getCoorPrm([$scope.trips[i].startZuobiao, $scope.trips[i].endZuobiao]);
							var param = {
								jsession: $localStorage.currentUser.token,
								lat: coor.lat,
								lng: coor.lng,
								arrInd: i,
								ignoreLoadingBar: true
							}

							params.push(param);
						}

						//						var coorParams = getCoorParams([val.startZuobiao, val.endZuobiao]);

						var qidian = val[a].liCheng;
						var zhongdian = val[b].liCheng;

						//									console.log(zhongdian, qidian);

						// $scope.trips[i].lucheng = ((zhongdian - qidian) / 1000).toFixed(3) + "km";
						$scope.trips[i].lucheng = utility.getLucheng(qidian, zhongdian);
						$scope.trips[i].lc = zhongdian - qidian;

						//						$scope.trips[i].endZuobiao = val[val.length - 1].position;
						//						if(val[0].position) {
						//							$scope.trips[i].startZuobiao = val[0].position;
						//						} else {
						//							utility.location(startZuobiao, function(result) {
						//								$scope.trips[i].startZuobiao = result;
						//							});
						//						}
						//						if(val[val.length - 1].position) {
						//							$scope.trips[i].endZuobiao = val[val.length - 1].position;
						//						} else {
						//							utility.location(endZuobiao, function(result) {
						//								$scope.trips[i].endZuobiao = result;
						//							});
						//						}
						$scope.trips[i].startTime = val[a].gpsTime;
						$scope.trips[i].start = val[a].trackTime;

						$scope.trips[i].endTime = val[b].gpsTime;
						$scope.trips[i].end = val[b].trackTime;

						$scope.trips[i].sc = val[b].trackTime - val[a].trackTime;
						$scope.trips[i].shiChang = utility.calculateDuration(val[a].gpsTime, val[b].gpsTime);
						total_duration = total_duration + utility.returnDuration(val[a].gpsTime, val[b].gpsTime);

						//						var time = 0;
						//						$scope.trips[i].map(function(elem, index) {
						//							if(elem.parkTime != 0) {
						//								if($scope.trips[i][index + 1]) {
						//									if($scope.trips[i][index + 1].parkTime == 0) {
						//										time += elem.parkTime;
						//									}
						//								}
						//							}
						//						});
						//						$scope.trips[i].parkingShiChang = utility.calculate(time);

						/**
						 * Temp speeding alert for track
						 **/
						//						speeding($scope.trips[i]);
					});
					
					exportService.setDuration(utility.calculate(total_duration));
					
					//Make promise chain for location
					var url = Host + "/VehicleApiAction_getLocation.action";

					params.reduce(function(p, val, i) {
						// The initial promise object
						if(p.then === undefined) {
							p.resolve();
							p = p.promise;
						}
						return p.then(function() {
							return vehicleInfoServices.returnHttp(url, val).then(function(result) {
								//								console.log(result);

								if(result.data.result == 0) {
									var index = result.config.params.arrInd;
									if(result.data.location[0]) {
										$scope.trips[index].beginWeizhi = result.data.location[0];
									}
									if(result.data.location[1]) {
										$scope.trips[index].endWeizhi = result.data.location[1];
									}
									$scope.trips[index].isLocated = true;
								}
								return response;
							});
						});
					}, $q.when(true));

				} else {
					swal({
						title: "No Result Found",
						text: "Please try again later",
						type: "info",
						confirmButtonColor: '#d33',
						confirmButtonText: 'OK'
					});
					$scope.trips = [];
				}

				$rootScope.$broadcast('afterLoading');
				$scope.afterLoading = true;
				$timeout(function() {
					$scope.speedingAlertsAfterLoading = true;
				}, 500);
			});
		});

		vehicleInfoServices.trackAlerts(passVal.id, passVal.start, passVal.end, 53).then(function(response) {
			// console.log("Driving---------------------");
			//			 console.log(response.data.infos);
			if(response.data.infos) {
				//				console.log(response.data.infos, typeof response.data.infos, response.data.infos.length, $stateParams.armInfo.valueOf().armType);
				if(response.data.infos.length == 0 && $stateParams.armInfo.valueOf().armType == 53) {
					//						console.log('open swal', $stateParams.armInfo.armType);
					tryAgain(53);
				};
				$scope.gAlerts = response.data.infos;
				$scope.gAlerts.map(function(val, i) {
					$scope.gAlerts[i].dateTimeStr = val.armTimeStr;
					$scope.gAlerts[i].dateTime = val.armTime;
					$scope.gAlerts[i].event = utility.getGSensorAlarmContent(passVal.id, val.armInfo);
					// $scope.gAlerts[i].speed = val.speed / 10 + ' km/h';
					$scope.gAlerts[i].s = val.speed;
					$scope.gAlerts[i].speed = utility.getSpeed(val.speed);
					$scope.gAlerts[i].location = val.position;
					//						if(val.position) {
					//							$scope.gAlerts[i].location = val.position;
					//						} else {
					//							utility.location(utility.getGPS(val.weiDu, val.jingDu), function(result) {
					//								$scope.gAlerts[i].location = result;
					//							});
					//						}
				});
			}

			// $scope.$broadcast('gAlerts', $scope.gAlerts);
			$scope.gAlertsAfterLoading = true;

			vehicleInfoServices.trackAlerts(passVal.id, passVal.start, passVal.end, 49).then(function(response) {
				//				 console.log("ADAS ---------------------");
				// console.log(response.data.infos);
				if(response.data.infos) {
					if(!response.data.infos[0] && $stateParams.armInfo.valueOf().armType == 49) {
						tryAgain(49);
					}
					$scope.adasAlerts = response.data.infos;
					$scope.adasAlerts.map(function(val, i) {
						$scope.adasAlerts[i].dateTimeStr = val.armTimeStr;
						$scope.adasAlerts[i].dateTime = val.armTime;
						$scope.adasAlerts[i].event = utility.getAdasAlarmContent(val.armInfo);
						// $scope.adasAlerts[i].speed = val.speed / 10 + ' km/h';
						$scope.adasAlerts[i].s = val.speed;
						$scope.adasAlerts[i].speed = utility.getSpeed(val.speed);
						if(val.position) {
							$scope.adasAlerts[i].location = val.position;
						} else {
							utility.location(utility.getGPS(val.weiDu, val.jingDu), function(result) {
								$scope.adasAlerts[i].location = result;
							});
						}
					});
				}
				// $scope.$broadcast('adasAlerts', $scope.adasAlerts);
				$scope.adasAlertsAfterLoading = true;
				vehicleInfoServices.trackAlerts(passVal.id, passVal.start, passVal.end, 24).then(function(response) {
					console.log("Events ---------------------");
					// console.log(response.data.infos);
					var items = $rootScope.items;
					var event;
					$rootScope.items.map(function(val){
						if(val.devInfo.idno = passVal){
							event = val.devInfo.ioInName.split(',')[5];
						}
					});
					console.log("IO name: ", event);

					if(response.data.infos) {
						if(!response.data.infos[0] && $stateParams.armInfo.valueOf().armType == 24) {
							tryAgain(49);
						}
						$scope.allEvents = response.data.infos;
						$scope.allEvents.map(function(val, i) {
							$scope.allEvents[i].dateTimeStr = val.armTimeStr;
							$scope.allEvents[i].dateTime = val.armTime;
/*todo*/
							$scope.allEvents[i].event = event;
/*todo*/
							// $scope.adasAlerts[i].speed = val.speed / 10 + ' km/h';
							$scope.allEvents[i].s = val.speed;
							// $scope.allEvents[i].speed = utility.getSpeed(val.speed);
							if(val.position) {
								$scope.allEvents[i].location = val.position;
							} else {
								utility.location(utility.getGPS(val.weiDu, val.jingDu), function(result) {
									$scope.allEvents[i].location = result;
								});
							}
						});
					}
					// $scope.$broadcast('adasAlerts', $scope.adasAlerts);
					$scope.allEventssAfterLoading = true;
				});
			});
		});
		// $scope.afterLoading = true;
		// $scope.adasAlertsAfterLoading = true;
		// $scope.gAlertsAfterLoading = true;
		// $scope.speedingAlertsAfterLoading = true;
	};

	/**
	 * Temp speeding alert for track
	 **/
/*	function speeding(routes) {

		var routes = routes.filter(function(e) {
			return(e.mapWeiDu && e.mapJingDu);
		});
		var pathValues = [];
		if(routes.length < 100 && routes.length > 1) {
			for(var i = 0; i < routes.length; i++) {
				pathValues.push([routes[i].mapWeiDu, routes[i].mapJingDu]);
			}
			var v = pathValues.join('|');
			$.get('https://roads.googleapis.com/v1/speedLimits', {
				key: apiKey,
				path: v
			}, function(data) {
				var speedingPoints = [];
				data.snappedPoints.map(function(elem) {
					for(var i = 0; i < data.speedLimits.length; i++) {
						if(data.speedLimits[i].placeId === elem.placeId) {
							elem.speedLimit = data.speedLimits[i].speedLimit;
							break;
						} else {
							elem.speedLimit = data.speedLimits[i].speedLimit;
						}
					}
				});

				routes.map(function(elem, index) {
					for(var i = 0; i < data.snappedPoints.length; i++) {
						if(index == data.snappedPoints[i].originalIndex) {
							if((elem.speed / 10) > data.snappedPoints[i].speedLimit) {
								elem.speeding = true;
								elem.speedLimit = data.snappedPoints[i].speedLimit;
								elem.overSpeed = (elem.speed / 10) - elem.speedLimit;
							} else {
								elem.speeding = false;
							}
						}
					}
				});
				var info = [];
				routes.map(function(e, i) {
					if(e.speeding) {
						info.push(routes[i]);
						if(routes[i + 1]) {
							info.push(routes[i + 1]);
						}
					} else {
						if(info.length > 1) {
							$scope.speedAlerts.push(info);
						}
						info = [];
					}
				});

				var lat = [];
				var lng = [];
				var promises = [];

				$scope.speedAlerts.map(function(elem, i) {

					//loop element to find first available coordinate
					var a = getStartZuobiao(elem);
					elem.startZuobiao = {
						lat: elem[a].jingDu,
						lng: elem[a].weiDu
					}

					//loop element to find last available coordinate
					var b = getEndZuobiao(elem);
					elem.endZuobiao = {
						lat: elem[b].jingDu,
						lng: elem[b].weiDu
					}

					elem.startL = elem[a].mapWeiDu + ", " + elem[a].mapJingDu;
					elem.endL = elem[b].mapWeiDu + ", " + elem[b].mapJingDu;
					//						  		console.log(startZuobiao);

					//得到API所有参数
					if(elem[a].position && elem[b].position) {
						elem.startL = elem[a].position;
						elem.endL = elem[b].position;
					} else if($scope.speedAlerts.length < apiLimits) {

						/*
						 Call Google API geocoding service
						 * */
/*						vehicleInfoServices.getLocation([elem.startZuobiao, elem.endZuobiao]).then(function(result) {
							if(result.data.result == 0) {
								if(result.data.location[0]) {
									elem.startL = result.data.location[0];
								}
								if(result.data.location[1]) {
									elem.endL = result.data.location[1];
								}
								elem.isLocated = true;
							}
							//						console.log(result);
						});
					} else {
						var coor = getCoorPrm([elem.startZuobiao, elem.endZuobiao]);
						var param = {
							jsession: $localStorage.currentUser.token,
							lat: coor.lat,
							lng: coor.lng,
							arrInd: i,
							ignoreLoadingBar: true
						}

						promises.push(param);
					}

					// elem.start = elem[0].gpsTime;
					elem.start = elem[a].trackTime;
					//					elem.startL = elem[0].position;
					// elem.end = elem[elem.length - 1].gpsTime;
					elem.end = elem[b].trackTime;
					//					elem.endL = elem[elem.length - 1].position;
					// elem.topSpeed = Math.max.apply(Math, elem.map(function(item){return item.speed})) / 10 + ' Km/h';
					// elem.speedLimit = elem[0].speedLimit + ' km/h';
					elem.ts = Math.max.apply(Math, elem.map(function(item) {
						return item.speed
					}));
					elem.topSpeed = utility.getSpeed(Math.max.apply(Math, elem.map(function(item) {
						return item.speed
					})));
					elem.sl = elem[a].speedLimit;
					elem.speedLimit = utility.getSpeedLimit(elem[a].speedLimit);
					elem.d = elem[b].trackTime - elem[a].trackTime;
					elem.duration = utility.calculateDuration(elem[a].gpsTime, elem[b].gpsTime);
				});

				//TODO Make promise chain for location
				var url = Host + "/VehicleApiAction_getLocation.action";
				promises.reduce(function(p, val, i) {
					// The initial promise object
					if(p.then === undefined) {
						p.resolve();
						p = p.promise;
					}
					return p.then(function() {
						return vehicleInfoServices.returnHttp(url, val).then(function(result) {
							if(result.data.result == 0) {
								var index = result.config.params.arrInd;
								if(result.data.location[0]) {
									$scope.speedAlerts[index].startL = result.data.location[0];
								}
								if(result.data.location[1]) {
									$scope.speedAlerts[index].endL = result.data.location[1];
								}
								$scope.speedAlerts[index].isLocated = true;
							}
							return true;
						});
					});
				}, $q.when(true));
			});
		} else {
			var promises = [];
			var i, j, temparray = [],
				chunk = 100;
			for(i = 0, j = routes.length; i < j; i += chunk) {
				temparray.push(routes.slice(i, i + chunk));
			}
			var path = [];
			temparray.map(function(e) {
				var pathValues = [];
				for(var i = 0; i < e.length; i++) {
					pathValues.push([e[i].mapWeiDu, e[i].mapJingDu]);
				}
				path.push(pathValues);
			});
			var promise = [];
			path.map(function(e) {
				var v = e.join('|');
				var p = $.get('https://roads.googleapis.com/v1/speedLimits', {
					key: apiKey,
					path: v
				}, function(data) {});
				promise.push(p);
			});

			$q.all(promise).then(function(results) {
				results.map(function(elem, index) {
					elem.snappedPoints.map(function(e) {
						for(var i = 0; i < elem.speedLimits.length; i++) {
							if(elem.speedLimits[i].placeId === e.placeId) {
								e.speedLimit = elem.speedLimits[i].speedLimit;
								break;
							} else {
								if(i > 1) {
									e.speedLimit = elem.speedLimits[i - 1].speedLimit;
								}
							}
						}
					});

					temparray.map(function(e, ind) {
						if(ind == index) {
							temparray[ind].map(function(el, pos) {
								for(var i = 0; i < elem.snappedPoints.length; i++) {
									if(pos == elem.snappedPoints[i].originalIndex) {
										if((el.speed / 10) > elem.snappedPoints[i].speedLimit) {
											el.speeding = true;
											el.speedLimit = elem.snappedPoints[i].speedLimit;
											el.overSpeed = (el.speed / 10) - el.speedLimit;
										} else {
											el.speeding = false;
										}
									}
								}
							});
						}
					});
				});
				var info = [];
				temparray.map(function(elem, index) {
					elem.map(function(e, i) {
						if(e.speeding) {
							info.push(e);
							if(elem[i + 1]) {
								info.push(elem[i + 1]);
							}
						} else {
							if(info.length > 1) {
								$scope.speedAlerts.push(info);
							}
							info = [];
						}
					});
				});

				$scope.speedAlerts.map(function(elem, i) {
					//loop element to find first available coordinate
					var a = getStartZuobiao(elem);
					elem.startZuobiao = {
						lat: elem[a].jingDu,
						lng: elem[a].weiDu
					}

					//loop element to find last available coordinate
					var b = getEndZuobiao(elem);
					elem.endZuobiao = {
						lat: elem[b].jingDu,
						lng: elem[b].weiDu
					};

					elem.startL = elem[a].mapWeiDu + ", " + elem[a].mapJingDu;
					elem.endL = elem[b].mapWeiDu + ", " + elem[b].mapJingDu;
					// elem.start = elem[0].gpsTime;
					elem.start = elem[a].trackTime;
					// elem.end = elem[elem.length - 1].gpsTime;
					elem.end = elem[b].trackTime;
					// elem.topSpeed = Math.max.apply(Math, elem.map(function(item){return item.speed})) / 10 + ' Km/h';
					// elem.speedLimit = elem[0].speedLimit + ' km/h';
					elem.ts = Math.max.apply(Math, elem.map(function(item) {
						return item.speed
					}));
					elem.topSpeed = utility.getSpeed(Math.max.apply(Math, elem.map(function(item) {
						return item.speed
					})));
					elem.sl = elem[a].speedLimit;
					elem.speedLimit = utility.getSpeedLimit(elem[a].speedLimit);
					elem.d = elem[b].trackTime - elem[a].trackTime;
					elem.duration = utility.calculateDuration(elem[a].gpsTime, elem[b].gpsTime);

					//得到API所有参数
					if(elem[a].position && elem[b].position) {
						elem.startL = elem[a].position;
						elem.endL = elem[b].position;
					} else if($scope.speedAlerts.length < apiLimits) {

						/*
						 Call Google API geocoding service
						 * */
/*						vehicleInfoServices.getLocation([elem.startZuobiao, elem.endZuobiao]).then(function(result) {
							if(result.data.result == 0) {
								if(result.data.location[0]) {
									elem.startL = result.data.location[0];
								}
								if(result.data.location[1]) {
									elem.endL = result.data.location[1];
								}
								elem.isLocated = true;
							}
							//						console.log(result);
						});
					} else {
						var coor = getCoorPrm([elem.startZuobiao, elem.endZuobiao]);
						var param = {
							jsession: $localStorage.currentUser.token,
							lat: coor.lat,
							lng: coor.lng,
							arrInd: i,
							ignoreLoadingBar: true
						}

						promises.push(param);
					}
				});

				//TODO Make promise chain for location
				var url = Host + "/VehicleApiAction_getLocation.action";
				promises.reduce(function(p, val, i) {
					// The initial promise object
					if(p.then === undefined) {
						p.resolve();
						p = p.promise;
					}
					return p.then(function() {
						return vehicleInfoServices.returnHttp(url, val).then(function(result) {

							if(result.data.result == 0) {
								var index = result.config.params.arrInd;
								if(result.data.location[0]) {
									$scope.speedAlerts[index].startL = result.data.location[0];
								}
								if(result.data.location[1]) {
									$scope.speedAlerts[index].endL = result.data.location[1];
								}
								$scope.speedAlerts[index].isLocated = true;
							}
							return true;
						});
					});
				}, $q.when(true));
			});
		}
	}
*/
	$scope.highlight = function(overSpeed){
		if(overSpeed > 20){
			return "highlight-red";
		}else if(overSpeed > 10){
			return "highlight-orange";
		}else{
			return "highlight-green";
		}
	}

	$scope.playRoutes = function(data) {
		$scope.rowClicked = data;
		$scope.$broadcast('playRoutes', data);
	}

	$scope.playVideo = function(id, start, end) {
		console.log(id, start, end);
		var dat = start.split(' ')[0];
		var obj = {
			id: id,
			date: dat,
			start: valTransfer.covertTimeString(new Date(start)), //TODO time start not include in result
			end: valTransfer.covertTimeString(new Date(end)),
			timeBegin: start,
			timeEnd: end
		}
		$state.go('record', obj);
		$timeout(function() {
			$rootScope.$broadcast('videoBeforeLoading');
		}, 100);
	}

	$scope.playGVideo = function(id, start) {
		var s = new Date(start).getTime() - 20000;
		var e = new Date(start).getTime() + 20000;
		var dat = start.split(' ')[0];
		var obj = {
			id: id,
			date: dat,
			start: valTransfer.covertTimeString(new Date(start)) - 20,
			end: valTransfer.covertTimeString(new Date(start)) + 20,
			timeBegin: new Date(s),
			timeEnd: new Date(e)
		}
		$state.go('record', obj);
		$timeout(function() {
			$rootScope.$broadcast('videoBeforeLoading');
		}, 100);
	}

	$scope.showRoute = function(data) {
		console.log(data);
		$scope.rowClicked = data;
		$scope.$broadcast('showRoutes', data);
	}

	$scope.showSpeeding = function(data) {
		$scope.rowClicked = data;
		$scope.$broadcast('showSpeeding', data);
	}

	$scope.showAdas = function(data) {
		console.log(data);
		$scope.rowClicked = data;
		$scope.$broadcast('showAdas', data);
	}

	$scope.showGSensor = function(data) {
		console.log(data);
		$scope.rowClicked = data;
		$scope.$broadcast('showGSensor', data);
	}

	$scope.showAllEvents = function(data) {
		console.log(data);
		$scope.rowClicked = data;
		$scope.$broadcast('showAllEvents', data);
	}


	$scope.showPicture = function(a) {
		console.log(a);
	}
};

function addressFade($animateCss) {
	return {
		link: function(scope, element) {
			//			console.log(scope);

			var unbind = scope.$watch('trip.isLocated', function(val) {
				if(val) {
					$animateCss(element, {
						keyframeStyle: '1s fadeIn'
					}).start();
					unbind();
				}
			});

			var unbindSpeed = scope.$watch('speedAlert.isLocated', function(val) {
				if(val) {
					$animateCss(element, {
						keyframeStyle: '1s fadeIn'
					}).start();
					unbindSpeed();
				}
			});
		},
	}
}
