/**
 * Loading Directive
 * @see http://tobiasahlin.com/spinkit/
 */

angular
    .module('PVision')
    .directive('rdLoading', ['$compile', '$parse', rdLoading]);

function rdLoading($compile, $parse) {
	
	var loadingSpinner = '<div class="loading"><div class="double-bounce1"></div><div class="double-bounce2"></div></div>';
	
    var directive = {
        restrict: 'AE',
		link: function(scope, element, attrs) {
			var originalContent = element.html();
			element.html(loadingSpinner);
			scope.$watch(attrs.promise, function(val) {
                if(val) {
                    element.html(originalContent);
                    element.append($compile(element.contents())(scope));
                } else {
                    element.html(loadingSpinner);
                }
			});
		}
        //template: '<div class="loading"><div class="double-bounce1"></div><div class="double-bounce2"></div></div>'
    };
    return directive;
};