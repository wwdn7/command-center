/**
 * Disable Links, buttons for future features
 */

angular
	.module('PVision')
	.directive('disableElement', ['menuService', 'SIDEMENU', '$compile',
		function(menuService, SIDEMENU, $compile) {
			return {
				restrict: 'A',
				link: function($scope, $ele, $attr) {
					var links = $ele.find('a, button');
//					console.log(links);
					links.addClass('disabled');
					links.bind('click', function(e){
//						console.log(e);
						e.preventDefault();
						e.stopImmediatePropagation();
						return false;
					});
					links.attr('title', 'coming soon...');
				}
			};
		}
	]);