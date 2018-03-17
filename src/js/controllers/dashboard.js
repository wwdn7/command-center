/**
 *Tacho Controller 
 */

angular
	.module('PVision')
	.controller('tachoCtrl', ['$scope', "$location", "vehicleInfoServices", "$rootScope", "$timeout", tachoCtrl]);

function tachoCtrl($scope, $location, vehicleInfoServices, $rootScope, $timeout) {
	//	//Loading Script

	//	  	$rootScope.$on('onlineRecords', function(event, data){
	//	  		$scope.Loading = event;
	//	  	});
	vehicleInfoServices.vehiInfo().then(function(response) {
		if(response) {
			$scope.Loading = true;
		}
	});

}