angular
	.module('PVision')
	.directive('sidebarCollapse', ['$window', function($window) {

		return {
			restrict: 'A',

			link: function(scope, elem, attrs) {

				function getBottom() {
					var winHeight = $window.innerHeight;
					var headerHeight = angular.element('.header-wrapper').height();
					//			console.log(winHeight, headerHeight, elem.height());
					elem.css('top', winHeight - headerHeight - elem.height() + 'px');
				};

				angular.element(document).ready(getBottom);

				angular.element(window).on('resize', function(e) {
					getBottom();
				});

				//				angular.element(window).keyup(function(e) {
				//					if(e.keyCode === 122) {
				//						getBottom();
				//					}
				//				});

				//				angular.element(document)[0].addEventListener('keyup', function(e) {
				//					console.log(e);
				//					if(e.key === "F11") {
				//						getBottom();
				//					}
				//				});

				angular.element(document).keyup(function(e) {
					if(e.keyCode === 122) {
						getBottom();
					}
				});
			}
		};
	}]);