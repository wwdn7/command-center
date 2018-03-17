angular
	.module('PVision')
	.controller('scrLimitor', ['$scope', '$window', 'swal', scrLimitor]);
	
function scrLimitor($scope, $window, swal) {
	var w = angular.element($window);
	$scope.getWindowDimensions = function (){
		return {
			'height': w.height(),
			'width': w.width()
		};
	}
	
	$scope.$watch($scope.getWindowDimensions, function(val) {
		if(val.width < 1300) {
			//console.log(swal.isVisible());
			if(swal.isVisible() == false) {
				swal({
					title: "Screen Limitation",
					text: "The Screen Width should be at least 1200px",
					type: "warning",
					confirmButtonColor: '#d33',
					confirmButtonText: 'Yes, I will set screen width correctly!'
				});
			}
		} else if(val.width >= 1300) {
			swal.close();
		}
	}, true);
}
