angular
	.module('PVision')
	.directive('recordQuery', ['swal', 'vehicleInfoServices', 'valTransfer', '$rootScope', '$stateParams', 'allDevIDs', '$localStorage',
		function(swal, vehicleInfoServices, valTransfer, $rootScope, $stateParams, allDevIDs, $localStorage) {
			return {
				restrict: 'E', // Element Type
				// Define template
				templateUrl: 'templates/element/recordQuery.html',
				//		    template:'<div><div><h4>Select vehicle</h4><select  ng-model="vehicle_id" ng-options="vehicle.idno as vehicle.userAccount.name for vehicle in vehiList" style="color: #555;"></select></div><div class="form-group"><h4>From</h4><adm-dtp ng-model="startDate" full-data="startDate_detail" maxdate="{{endDate_detail.unix}}"></adm-dtp><h4>To</h4><adm-dtp ng-model="endDate" options="endDate_options" full-data="startDate_detail" maxdate="{{endDate_detail.unix}}"></adm-dtp></div><div class="jourey-search-btn row"><div class="col-md-3"><button class="btn btn-info" ng-click="queries()" style="position: relative; margin-top:60%; padding:10px; font-size: large">Search</button></div></div></div>',
				replace: true, // Allowing replacing
				link: function($scope, $element, $attribute) {
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
						var fullDate = $scope.dt.toISOString();
						var date = fullDate.split('T')[0];
						var start = valTransfer.covertTimeString($scope.beginTime);
						var end = valTransfer.covertTimeString($scope.endTime);

						if($scope.beginTime == $scope.endTime) {
							swal({
								title: 'Please Try Again',
								text: 'Start and End time must be different!',
								type: 'info',
								confirmButtonColor: '#d33',
								confirmButtonText: 'OK'
							});
						} else if(!$scope.device) {
							swal({
								title: 'No Vehicle Selected',
								text: 'Please select vehicle!',
								type: 'info',
								confirmButtonColor: '#d33',
								confirmButtonText: 'OK'
							});
						} else {
							var query = {
								id: returnDeviceID(),
								date: date,
								start: start,
								end: end
							};
							//					console.log(query);
							$rootScope.$broadcast('videoBeforeLoading');
							$scope.$emit('RecordQuery', query);
						}
					};

					// Date Picker
					$scope.dateOptions = {
						maxDate: new Date(),
						minDate: new Date(2014, 0, 1),
						startingDay: 1
					};

					$scope.format = 'dd/MMM/yyyy';

					$scope.dt = new Date();

					$scope.open1 = function() {
						$scope.popup1.opened = true;
					};

					$scope.popup1 = {
						opened: false
					};

					// Time Picker
					$scope.endTime = new Date();

					var time = new Date();
					time.setHours(0);
					time.setMinutes(0);
					time.setSeconds(0);
					$scope.beginTime = time;

					$scope.hstep = 1;
					$scope.mstep = 1;
					$scope.sstep = 1;
					$scope.ismeridian = false;

					if($stateParams.id && allDevIDs.deviceMap) {
						$scope.device = {
							idno: $stateParams.id,
							name: allDevIDs.deviceMap.get($stateParams.id)
						};
					}

					if($stateParams.date && allDevIDs.deviceMap) {
						//					console.log('obj', $stateParams);
						$scope.device = {
							idno: $stateParams.id,
							name: allDevIDs.deviceMap.get($stateParams.id)
						};
						$scope.dt = new Date($stateParams.date);
						$scope.beginTime = new Date($stateParams.timeBegin);
						$scope.endTime = new Date($stateParams.timeEnd);
					}
				}
			};
		}
	]);