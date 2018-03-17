angular
	.module('PVision')
	.controller('resetPWCtroller', ['$scope', '$location', 'AuthenticationService', resetPWCtroller]);

function resetPWCtroller($scope, $location, AuthenticationService) {
	var rp = this;

	rp.resetPW = resetPW;
	
	function resetPW() {
		
		rp.loading = true;
	};
}