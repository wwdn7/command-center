angular
	.module('PVision')
	.filter("filterVideo", function() {
		return function(array) {
			if(!angular.isArray(array)) return;
			var result = array.filter(function(item) {
				if(item !== "x") {
					return item;
				}
			})
			return result;
		}
	})
	.filter('reverse', function() {
		return function(items) {
			console.log(items);
			return items.reverse();
		};
	})
	.directive('videoLoading', ['$compile', '$parse', videoLoading]);

function videoLoading($compile, $parse) {

	var loadingSpinner = '<div class="video-spinner"><div class="rect1"></div><div class="rect2"></div><div class="rect3"></div><div class="rect4"></div><div class="rect5"></div></div>';

	var directive = {
		restrict: 'AE',
		link: function(scope, element, attrs) {
			var originalContent = '<div ng-if="removeX(chn)" class="video-flash-player" ng-repeat="chn in chns track by $index "><div ng-attr-id="{{chn}}-{{$index}}" ><a href="http://www.adobe.com/go/getflashplayer"><img src="http://www.adobe.com/images/shared/download_buttons/get_flash_player.gif" alt="Get Adobe Flash player" /></a></div></div>';
			element.html(loadingSpinner);
			scope.$watch('chns', function(val) {
				if(angular.isArray(val)) {
					element.html(originalContent);
					element.append($compile(element.contents())(scope));
					scope.$emit('videoLoaded');
				} else {
					element.html(loadingSpinner);
				}
			});
			scope.removeX = function(chn) {
				if(chn.toLowerCase() === 'x') {
					return false;
				} else {
					return true;
				};
			}
		}
		//template: '<div class="loading"><div class="double-bounce1"></div><div class="double-bounce2"></div></div>'
	};
	return directive;
};