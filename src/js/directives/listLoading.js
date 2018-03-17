angular
	.module('PVision')
	.directive('listLoading', ['$compile', '$parse', '$timeout', listLoading]);

	function listLoading($compile, $parse, $timeout) {

		// var loadingSpinner =  '<div class="list-loading"><div class="sk-folding-cube">' +
		// 					  '<div class="sk-cube1 sk-cube"></div>' +
		// 					  '<div class="sk-cube2 sk-cube"></div>' +
		// 					  '<div class="sk-cube4 sk-cube"></div>' +
		// 					  '<div class="sk-cube3 sk-cube"></div>' +
		// 					  '</div></div>';
		// var loadingSpinner = '<div class="list-loading"><img src="img/loading_spinner.gif">' +
													// '<br /><p style="text-align:center"><font size="5" color="#1d3f72">Searching</font><p><div>';
	    var directive = {
	        restrict: 'AE',
			link: function(scope, element, attrs) {
				var originalContent = element.html();
//				attrs.$observe('record', function(val){
//					console.log(val);
//					if(angular.isArray(val)){
//	                    element.html(originalContent);
//	                    element.append($compile(element.contents())(scope));
//					};
//				});

				scope.$on('afterLoading', function(){
//					console.log('after');
					element.html(originalContent);
//					$compile(element.contents())(scope);
				});

				scope.$on('beforeLoading', function(){
//					console.log('before');
					var loadingSpinner = '<div class="list-loading"><img src="img/loading_spinner.gif">' +
											'<br /><p style="text-align:center"><font size="5" color="#1d3f72">Searching</font><p><div>';
					element.html(loadingSpinner);
//					element.append($compile(element.contents())(scope));
				});
//				element.html(loadingSpinner);

				scope.$on('trackBeforeLoading', function(){
					var loadingSpinner = '<div class="list-track-loading"><img src="img/earth.gif">' +
																'<br /><p style="text-align:center"><font size="5" color="#1d3f72">Searching</font><p><div>';
					element.html(loadingSpinner);
				});

				scope.$on('alertBeforeLoading', function(){
					var loadingSpinner = '<div class="list-loading"><img src="img/alerts.gif">' +
																'<br /><p style="text-align:center"><font size="5" color="#1d3f72">Searching</font><p><div>';
					element.html(loadingSpinner);
				});

				scope.$on('videoBeforeLoading', function(){
					var loadingSpinner = '<div class="list-video-loading"><img src="img/play.gif">' +
																'<br /><p style="text-align:center"><font size="5" color="#1d3f72">Searching</font><p><div>';
					element.html(loadingSpinner);
				});
			}
	    };
	    return directive;
	};
