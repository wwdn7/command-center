angular
	.module('PVision')
	.controller('hardwareCtrl', ['$scope', '$localStorage', '$state', '$compile', '$timeout', function($scope, $localStorage, $state, $compile, $timeout) {

		//Add animate to hardware chart
		angular.element('.hardware-container').ready(function() {
			angular.element('.hardware-container').addClass('animated zoomIn');
		});

		function getCount() {
			return $localStorage.statusCount;
		};

		$scope.$watch(getCount, function(val) {
			//			console.log(val);
			//		(val == 0) ? $scope.index = "OK" : $scope.index = val;
			if(val) {
				if(angular.isNumber(val.hardwareRecords)) {
					$scope.index = val.hardwareRecords;
				} else {
					$scope.index = "OK";
				}
			}
		});

		$scope.numToText = function(item) {
			//			console.log(item);
			if(angular.isNumber(item)) {
				return "hardware-chart";
			} else if(item === "OK") {
				return "hardware-chart-ok";
			}
		};

		$scope.toList = function() {
			$state.go('hardware-issue');
		};

		$timeout(function() {
			$compile($('#hardware-chart-number'))($scope);
		}, 1000);

		//	$scope.$on('$destroy', function () { $interval.cancel(stopHardwarealert); });
	}])

	.controller('alertCtrl', ['$scope', 'pouchdbCtrl', '$location', '$rootScope', 'vehicleInfoServices', '$state', '$localStorage', '$interval', 'Privilege',
		function($scope, pouchdbCtrl, $location, $rootScope, vehicleInfoServices, $state, $localStorage, $interval, Privilege) {

			//	  $scope.labels = ['Speeding', 'ADAS', 'Events'];
			$scope.labels = ['ADAS', 'Events'];
			$scope.series = ['#Last Week', '#Current Week'];
			//	  $scope.data = [[0,0,0],[0,0,0]];
			$scope.data = [
				[0, 0],
				[0, 0]
			];

			function getDevID() {
				return $localStorage.allDevID;
			};

			//			var user = $localStorage.currentUser.username;
			if($localStorage.currentUser.valueOf().roleName !== Privilege.PeaceOfMind) {
				$scope.$watch(getDevID, function(newVal) {
					if(newVal) {
						if($rootScope.thisWeekDB) {
							$rootScope.thisWeekDB.get("ADAS").then(function(curAdas) {
								$scope.data[1][0] = curAdas.records;
								$rootScope.thisWeekDB.get("Gsensor").then(function(curGss) {
									$scope.data[1][1] = curGss.records;
								});
								//get last week records 
								$rootScope.lastWeekDB.get("Gsensor").then(function(gsensor) {
									$scope.data[0][1] = gsensor.records;
								});
								$rootScope.lastWeekDB.get("ADAS").then(function(adas) {
									$scope.data[0][0] = adas.records;
								});
								if(vehicleInfoServices.loadTimeout()) {
									//update current week data what's so ever 
									vehicleInfoServices.alertSuoyou(newVal).then(function(result) {
										result.map(function(val) {
											switch(true) {
												case(val.leiXing == "ADAS" && val.week == "thisWeek"):
													$scope.data[1][0] = val.totalRecords;
													pouchdbCtrl.createDatabase(val.totalRecords, val.leiXing);
													break;
												case(val.leiXing == "Gsensor" && val.week == "thisWeek"):
													$scope.data[1][1] = val.totalRecords;
													pouchdbCtrl.createDatabase(val.totalRecords, val.leiXing);
													break;
											}
										});
									});
								}
							}).catch(function(err) {
								//if no records in database for THIS WEEK, create new db 
								vehicleInfoServices.alertSuoyou(newVal, true).then(function(result) {
									console.log('database records updated');
									result.map(function(val) {
										switch(true) {
											case(val.leiXing == "ADAS" && val.week == "thisWeek"):
												$scope.data[1][0] = val.totalRecords;
												pouchdbCtrl.createDatabase(val.totalRecords, val.leiXing);
												break;
											case(val.leiXing == "ADAS" && val.week == "lastWeek"):
												$scope.data[0][0] = val.totalRecords;
												pouchdbCtrl.createDatabase(val.totalRecords, val.leiXing, true);
												break;
											case(val.leiXing == "Gsensor" && val.week == "thisWeek"):
												$scope.data[1][1] = val.totalRecords;
												pouchdbCtrl.createDatabase(val.totalRecords, val.leiXing);
												break;
											case(val.leiXing == "Gsensor" && val.week == "lastWeek"):
												$scope.data[0][1] = val.totalRecords;
												pouchdbCtrl.createDatabase(val.totalRecords, val.leiXing, true);
												break;
										}
									});
								});
							});
						}
					}
				});
			}

			$scope.options = {
				scales: {
					yAxes: [{
						ticks: {
							beginAtZero: true
						}
					}]
				},
				legend: {
					display: true,
					position: 'top',
					labels: {
						display: true,
					}
				}
			};

			$scope.clickToList = function(a, b, point) {
				var bol = undefined;
				var num = "";
				//				console.log("record: ", $scope.data[point._datasetIndex][point._index]);
				if(point) {
					switch(point._index) {
						case 0:
							num = 49; //"ADAS";
							break;
						case 1:
							num = 3; //"Driving Events";
							break;
						default:
							num = "";
							break;
					};

					switch(point._datasetIndex) {
						case 0:
							bol = true; //"last week";
							break;
						case 1:
							bol = false; //"current week";
							break;
						default:
							break;
					};

					var qryObj = {
						records: $scope.data[point._datasetIndex][point._index],
						type: num,
						lastWeek: bol
					};

					$state.go('alert-list', qryObj);
				};
			}
		}
	])

	.controller('tacho-alert', ['$scope', '$interval', '$rootScope', function($scope, $interval, $rootScope) {
		$scope.series = ['#Total', '#Average Alert'];
		$scope.labels = [''];
		$scope.data = [
			[0],
			[0]
		];
		$scope.options = {
			legend: {
				display: true,
				position: 'top',
				labels: {
					display: true,
				}
			}
		};
	}])

	//Fleet Status
	.controller('donut', ['$scope', 'valTransfer', '$rootScope', '$localStorage', '$state', 'Privilege', function($scope, valTransfer, $rootScope, $localStorage, $state, Privilege) {
		//		$scope.series = ['#Total', '#Average Alert'];
		$scope.options = {
			scales: {
				yAxes: [{
					ticks: {
						beginAtZero: true
					}
				}]
			}
		};

		$scope.labels = ['Online', 'Offline', 'Idling', 'Ignition Off'];
		$scope.data = [0, 0, 0, 0];
		$scope.datasetOverride = {
			backgroundColor: ["rgb(24,163,27)", "rgb(130,130,130)", "rgb(239, 239, 215)", "rgba(152,142,40,1)", "rgb(59,84,168)"],
			borderColor: 'rgba(0,0,0,0)',
			hoverBackgroundColor: ['rgba(24,163,27,0.75)', 'rgba(130,130,130,0.75)', 'rgba(239, 239, 215,0.75)', 'rgba(152,142,40,0.75)', 'rgba(59,84,168,0.75)'],
			hoverBorderColor: ['rgb(24,163,27)', 'rgb(130,130,130)', 'rgb(178, 191, 220)', 'rgb(152,142,40)', 'rgb(59,84,168)']
		};

		function getCount() {
			return $localStorage.statusCount;
		}

		if($localStorage.currentUser.valueOf().roleName !== Privilege.PeaceOfMind) {
			$scope.$watch(getCount, function(newVal) {
				if(newVal) {
					$scope.data[0] = newVal.onlineRecords;
					$scope.data[1] = newVal.offlineRecords;
					$scope.data[2] = newVal.IdlingCount;
					$scope.data[3] = newVal.accOffCount;
					//				$scope.activeRecords = $localStorage.record - newVal.inactiveRecords;
					$scope.activeRecords = $localStorage.record;
					$scope.inactiveRecords = newVal.inactiveRecords;
					//				console.log($scope.inactiveRecords, $scope.activeRecords);
				};
			});
		}

		$scope.clickToList = function(points, evt) {
			var str = "";
			if(!points[0]) {
				str = "";
			} else {
				switch(points[0]._index) {
					case 0:
						str = "online";
						break;
					case 1:
						str = "offline";
						break;
					case 2:
						str = "idling";
						break;
					case 3:
						str = "accoff";
						break;
					default:
						str = "";
						break;
				};
			}

			//				console.log(str);
			valTransfer.setter(str);
			$state.go('list');
		}

		//		var ctx = document.getElementById("barOne").getContext("2d");
		//		ctx.canvas.height = "10vh";

	}])