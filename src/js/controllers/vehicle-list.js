var list = angular.module('PVision');
list.constant('keywordS', ['Missing Hard Drive', 'No GPS Data', 'Lost Connection', 'Camera Not Recording', 'No Events', 'Device Not Found', 'Parking']);
list.directive('updateLocation', ['vehicleInfoServices', '$animateCss', updateLocation]);
list.controller('statusListCtrl', ["$scope", "$filter", "valTransfer", "vehicleInfoServices", "$rootScope", "$state", "$timeout", "filterService", "keywordS", "exportService",
	function($scope, $filter, valTransfer, vehicleInfoServices, $rootScope, $state, $timeout, filterService, keywordS, exportService) {

		var excelOption = {
			formats: ['xlsx'],
			headers: true,
			exportButtons: false,
			ignoreCols: [0, 1, 10],
			filename: 'vehicle status',
			bootstrap: true
		};

		exportService.setOption(excelOption);

		$scope.$on('$destroy', function() {
			$rootScope.data.filterTable = '';
			//			console.log('filter data: ', $rootScope.data.filterTable);
		});

		$scope.vehicles = [];
		filterService.config({
			initKeywords: keywordS
		});

		var unbind = $scope.$watch('items', function(newVal) {
			if(newVal) {
				//				console.log(newVal);
				newVal.map(function(item) {
					if(!item.isLocated) {
						item.location = item.devStatus.weiDuEx + ', ' + item.devStatus.jingDuEx;
						if(!item.devStatus.weiDuEx || item.devStatus.weiDuEx == 0) {
							item.location = "Not Available";
							item.isLocated = true;
						}
					}
				});
				
				$scope.vehicles = newVal;
				filterService.config({
					initData: newVal
				});
				$scope.$on('filterThis', function(event, arr) {
					$scope.vehicles = filterService.filterThis(arr);
				});
				unbind();
			};
		});

		$scope.getWarn = function(status) {
			if(status[0]) {
				return "warning";
			}
			//			var disk1Status = (status>>8)&3;
			//			var disk2Status = (status>>29)&3;
			//			if(online !== null){
			//				if(disk2Status == 0 && disk1Status == 0){
			//					return "warning";
			//				}
			//				if (disk2Status == 1 && disk1Status == 0 || disk2Status == 0 && disk1Status == 1) {
			//					if(type == 1){
			//						return "warning";
			//					}
			//				}else if (disk2Status == 2){
			//					return "warning";
			//				} else if (disk1Status == 2){
			//					return "warning";
			//				}
			//			}
		}

		$scope.getFleetClass = function(status) {
			var circle = "fa-circle";

			switch(status) {
				case 1:
					return circle + " text-online";
				case 4:
					return circle + " text-offline";
				case 3:
					return circle + " text-idling";
					//			case 3: return circle + " text-parking";
				case 2:
					return circle + " text-ignition";
			}
		}
		/*		$scope.$on('listFilter', function(event, val) {
		//			console.log(val, "before:", $scope.data.filterTable);
					//		angular.element(document).ready(function(){

					switch(val) {
						case "hardware":
							$scope.data.filterTable = "hardware issue";
							break;
							//				default:
							//					$scope.data.filterTable = "";
							//					break;
					}
		//			console.log("after: ", $scope.data.filterTable);

					//		});

				});*/

		var passVal = valTransfer.getter();
		if(passVal) {
			switch(passVal) {
				case "online":
					$rootScope.data.filterTable = "online";
					break;
				case "offline":
					$rootScope.data.filterTable = "offline";
					break;
				case "idling":
					$rootScope.data.filterTable = "idling";
					break;
				case "accoff":
					$rootScope.data.filterTable = "ACC OFF";
					break;
			};
		};

		$scope.showVehicle = function(id) {
			$state.go('detail', {
				id: id
			});
			console.log(id);
			//		$timeout(function(){$rootScope.$broadcast('deviceChange', id);},100);
		};

		$scope.trackVehicle = function(id) {
			$state.go('track', {
				id: id
			});
			console.log(id);
			//		$timeout(function(){$rootScope.$broadcast('deviceChange', id);},100);
		};

		$scope.playVehicle = function(id) {
			$state.go('record', {
				id: id
			});
			console.log(id);
			//		$timeout(function(){$rootScope.$broadcast('deviceChange', id);},100);
		};

	}
]);

function updateLocation(vehicleInfoServices, $animateCss) {
	return {
		restrict: 'A',
		link: function($scope, $ele) {
			//			console.log($scope);
			/*
		 Call Google Geocoding Service API
		 * */
			function getLocation(item, element) {
				if(!item.isLocated) {

					vehicleInfoServices.getLocation([{
						lat: item.devStatus.jingDu,
						lng: item.devStatus.weiDu
					}]).then(function(result) {
						if(result.data.result == 0) {
							if(result.data.location[0]) {
								item.location = result.data.location[0];
								$animateCss(element, {
									keyframeStyle: '1s fadeIn'
								}).start();
							}
						}
						//							console.log(result);
						item.isLocated = true;
					});
				}
				return item;
			};

			$scope.$watch('vehicles', function(val) {
				if(val) {
					//					console.log(val);
					$ele.ready(function() {
						var items = $ele.find('tr.ng-scope');
						//						console.log(items);
						items.map(function(i) {
							if(!items[i].classList.contains('ng-hide')) {
								//								console.log(angular.element(items[i]).scope().v);
								//								console.log(items[i].cells[4]);
								//								angular.element(items[i].cells[4]).addClass('animated fadeIn');
								angular.element(items[i]).scope().v = getLocation(angular.element(items[i]).scope().v, angular.element(items[i].cells[4]));
								//								$scope.vehicles[items[i].sectionRowIndex] = getLocation($scope.vehicles[items[i].sectionRowIndex]);
							}
						});
					})
				}
			});

			$scope.$watch('data.currentPage', function(val) {
				//				console.log(val, $scope.vehicles);
				if(val > 1) {
					$ele.ready(function() {
						var items = $ele.find('tr.ng-scope');
						//						console.log(items);
						items.map(function(i) {
							if(!items[i].classList.contains('ng-hide')) {
								//								console.log(items[i].rowIndex);
								//								angular.element(items[i].cells[4]).addClass('animated fadeIn');
								angular.element(items[i]).scope().v = getLocation(angular.element(items[i]).scope().v, angular.element(items[i].cells[4]));
								//								$scope.vehicles[items[i].rowIndex - 1] = getLocation($scope.vehicles[items[i].rowIndex - 1]);
							}
						});
					})
				}
			});

		}
	};
}