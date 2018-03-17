angular
	.module('PVision')
	.directive('repeatAnimation', ['$timeout', '$animateCss', function($timeout, $animateCss) {

		return {
			link: function(scope, element) {
				if(element.index() < 10) {
//					console.log('stopped?', element);
					//					element.addClass('alert-list');
					//					$timeout(function(){
					//						element.removeClass('alert-list');
					//					},1);
					$animateCss(element, {
						transitionStyle: '1s linear all',
						//						keyframeStyle: "1s zoomIn linear",
						//						duration: 2,
						from: {
							opacity: 0
						},
						to: {
							opacity: 1
						},
						stagger: 0.2,
						//						staggerIndex: 0.1,
					}).start();
					var unbind = scope.$watch('data.currentPage', function(val) {
						if(val > 1) {
							console.log('stopped?', val);
							//							element.removeClass('notransition');
							//							element.addClass('notransition');
							//element.css('transition', 'none !important');
							$animateCss(element).end();
//							$animateCss(element, {
//								transitionStyle: 'none',
//							}).start();
							unbind();
						}
					});
				};
			},
		}
	}]);