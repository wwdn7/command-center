angular
	.module('PVision')
	.directive('sidebar', ['$window', function($window) {

		return {
			restrict: 'A',

			link: function(scope, elem, attrs) {

				function getTop() {
					var headerHeight = angular.element('.header-wrapper').height();
					var collapseHeight = angular.element('.sidebar-collapse').height();
					elem.css('margin-bottom', headerHeight + collapseHeight + 'px');
				};

				angular.element(document).ready(function() {
					getTop();
				});

//				elem[0].onresize = function() {
//					getTop();
//				};

			}
		};
	}]);