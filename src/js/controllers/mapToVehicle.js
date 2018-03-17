angular
	.module('PVision')
	.controller('map-to-vehicle', ["$rootScope", "$scope", "$timeout", "$state", function($rootScope, $scope, $timeout, $state) {

		$scope.viewVehicle = function(id) {
			$state.go('detail', {
				id: id
			});
			var devId = id;
		}

		$scope.trackDetail = function(id) {
			$state.go('track', {
				id: id
			});
		}

		$scope.playRecord = function(id) {
			$state.go('record', {
				id: id
			});
		}
	}])

	.controller("trafficBtn", ["$scope", function($scope) {
		$scope.reverseTraffic = function() {
			$scope.setBold = !$scope.setBold;
			
			if($scope.setBold) {
				angular.element('.traffic-btn').css('font-weight', 'bold');
			} else {
				angular.element('.traffic-btn').css('font-weight', 'unset');
			}

			$scope.$emit("setTraffic");
		}

	}]);