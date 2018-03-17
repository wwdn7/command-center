angular
	.module('PVision')
	.directive('queryVehicle', ['swal', '$stateParams', '$rootScope', '$window', 'allDevIDs', '$localStorage',
		function(swal, $stateParams, $rootScope, $window, allDevIDs, $localStorage) {
			return {
				restrict: 'E', //Element Type
				//Define template
				templateUrl: 'templates/element/queryVehicle.html',
				//			template: '<div uib-timepicker ng-model="endTime" hour-step="hstep" minute-step="mstep" second-step="sstep" show-seconds="true" show-meridian="ismeridian"></div>',
				//		    template:'<div><div><h4>Select vehicle</h4><select  ng-model="vehicle_id" ng-options="vehicle.idno as vehicle.userAccount.name for vehicle in vehiList" style="color: #555;"></select></div><div class="form-group"><h4>From</h4><adm-dtp ng-model="startDate" full-data="startDate_detail" maxdate="{{endDate_detail.unix}}"></adm-dtp><h4>To</h4><adm-dtp ng-model="endDate" options="endDate_options" full-data="startDate_detail" maxdate="{{endDate_detail.unix}}"></adm-dtp></div><div class="jourey-search-btn row"><div class="col-md-3"><button class="btn btn-info" ng-click="queries()" style="position: relative; margin-top:60%; padding:10px; font-size: large">Search</button></div></div></div>',
				replace: true, //Allowing replacing
				link: function($scope, $element, $attribute) {
					//				angular.element('.uib-timepicker').bind('scroll', function(a){
					//					console.log(a);
					//				})

					var start = moment().set({
						'hour': 0,
						'minute': 0,
						'second': 0
					});

					var end = moment().set({
						'hour': 23,
						'minute': 59,
						'second': 59
					});

					function rangeSet(start, end) {
						//						console.log("New date range selected: ", start.format('DD/MM/YYYY HH:mm:ss') + ' - ' + end.format('DD/MM/YYYY HH:mm:ss'));
						angular.element('.datetime-rangepicker span').html(start.format('DD/MM/YYYY HH:mm:ss') + ' - ' + end.format('DD/MM/YYYY HH:mm:ss'));
						$scope.startTime = start;
						$scope.endTime = end;
					}

					angular.element('.datetime-rangepicker').daterangepicker({
						"timePicker": true,
						"timePicker24Hour": true,
						"timePickerIncrement": 1,
						"ranges": {
							"Today": [start, end],
							"Yesterday": [moment().subtract(1, 'days').set({
								'hour': 0,
								'minute': 0,
								'second': 0
							}), moment().subtract(1, 'days').set({
								'hour': 23,
								'minute': 59,
								'second': 59
							})],
							"Last 7 Days": [moment().subtract(6, 'days').set({
								'hour': 0,
								'minute': 0,
								'second': 0
							}), moment().set({
								'hour': 23,
								'minute': 59,
								'second': 59
							})],
							"Last 30 Days": [moment().subtract(29, 'days').set({
								'hour': 0,
								'minute': 0,
								'second': 0
							}), moment().set({
								'hour': 23,
								'minute': 59,
								'second': 59
							})],
							"This Month": [moment().startOf('month'), moment().endOf('month')],
							"Last Month": [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
						},
						"dateLimit": {
							"days": 31
						},
						"locale": {
							"format": "DD/MM/YYYY HH:mm:ss",
							"separator": " - ",
							"applyLabel": "Apply",
							"cancelLabel": "Cancel",
							"fromLabel": "From",
							"toLabel": "To",
							"customRangeLabel": "Custom",
							"firstDay": 1
						},
						"alwaysShowCalendars": true,
						"startDate": start,
						"endDate": end,
						"maxDate": end,
						"opens": "left"
					}, rangeSet);

					rangeSet(start, end);

					var threeDays = 1000 * 60 * 60 * 24 * 3;

					//					//Time Picker
					//					$scope.hstep = 1;
					//					$scope.mstep = 1;
					//					$scope.sstep = 1;
					//					$scope.ismeridian = false;
					//					$scope.endTime = new Date();
					//
					//					var time = new Date();
					//					time.setHours(0);
					//					time.setMinutes(0);
					//					time.setSeconds(0);
					//					$scope.beginTime = time;
					//
					//					//Date Picker
					//					$scope.dateOptions = {
					//						//					formatYear: 'yy',
					//						maxDate: new Date(),
					//						minDate: new Date(2014, 0, 1),
					//						startingDay: 1
					//					};
					//
					//					$scope.format = 'dd/MMM/yyyy';
					//
					//					$scope.startDate = new Date();
					//					$scope.endDate = new Date();
					//
					//					$scope.open1 = function() {
					//						$scope.popup1.opened = true;
					//					};
					//
					//					$scope.popup1 = {
					//						opened: false
					//					};
					//
					//					$scope.open2 = function() {
					//						$scope.popup2.opened = true;
					//					};
					//
					//					$scope.popup2 = {
					//						opened: false
					//					};

					$scope.vehiclelist = [];
					if($localStorage.allDevID) {
						var vechiles = $localStorage.allDevID.split(',');
						vechiles.map(function(vehicle) {
							$scope.vehiclelist.push({
								idno: vehicle,
								name: allDevIDs.deviceMap.get(vehicle)
							});
						});
					}

					//				console.log($scope.vehiclelist);

					if($stateParams.id && allDevIDs.deviceMap) {
						$scope.device = {
							idno: $stateParams.id,
							name: allDevIDs.deviceMap.get($stateParams.id)
						};
					}

					if($stateParams.start && allDevIDs.deviceMap) {
						//					angular.element(document).ready(function() {
						$scope.device = {
							idno: $stateParams.id,
							name: allDevIDs.deviceMap.get($stateParams.id)
						};
						//						$scope.beginTime = new Date($stateParams.start);
						//						$scope.endTime = new Date($stateParams.end);
						$scope.startTime = new Date($stateParams.start);
						$scope.endTime = new Date($stateParams.end);
						//					});
					}

					function getDate(day) {
						var fullDate = day.toISOString();
						return fullDate.split('T')[0];
					}

					function returnDeviceID() {
						var id;
						if(Number($scope.device)) {
							id = $scope.device;
						} else {
							id = $scope.device.idno;
						}
						return id;
					}

					$scope.queries = function() {

						//						var start = getDate($scope.startDate) + " " + $scope.beginTime.toTimeString().split(' ')[0];
						//						var end = getDate($scope.endDate) + " " + $scope.endTime.toTimeString().split(' ')[0];
						var start = $scope.startTime.format("YYYY-MM-DD HH:mm:ss");
						var end = $scope.endTime.format("YYYY-MM-DD HH:mm:ss");

						var startTime = new Date(start);
						var endTime = new Date(end);
						var timeGap = endTime.getTime() - startTime.getTime();

						//					 console.log(startTime, endTime);
						if(end == start) {
							swal({
								title: "Please Try Again",
								text: "Start and End time must be different!",
								type: "info",
								confirmButtonColor: '#d33',
								confirmButtonText: 'OK'
							});
						} else if(timeGap > threeDays) {
							swal({
								title: "Hold On!",
								text: "It might take some time, do you want to continue?",
								type: "info",
								showCancelButton: true,
								confirmButtonColor: '#d33',
								confirmButtonText: 'Continue',
								cancelButtonText: 'Cancel',
							}).then(function() {
								var id = returnDeviceID();

								var query = {
									id: id,
									start: start,
									end: end
								};
								$rootScope.$broadcast('trackBeforeLoading');
								$scope.$emit('QueryVehicle', query);
							});
						} else {
							var id = returnDeviceID();

							var query = {
								id: id,
								start: start,
								end: end
							};

							$rootScope.$broadcast('trackBeforeLoading');
							$scope.$emit('QueryVehicle', query);
						}
					};

					//			function covertDateString(date) {
					//				var temp = date.split(' ');
					//				var dateArr = temp[0].split('/');
					//				//		console.log("debug ", dateArr, temp)
					//				return (dateArr[2]+ "-" + dateArr[1]+ "-" + dateArr[0]+ " " + temp[1]);
					//			}
				}
			}
		}
	])