angular
	.module('PVision')
	.controller('redirectCtl', ['$scope', '$location', redirectCtl])

function redirectCtl($scope, $location) {
	if($location.search().client_id) {
		$scope.clientId = $location.search().client_id;
	}
	console.log("redirect", $location.search().client_id);
}