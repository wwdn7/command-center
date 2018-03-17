/**
 * Widget Body Directive
 */

angular
	.module('PVision')
	.directive('rdWidgetBody', ['$animateCss', '$timeout', rdWidgetBody]);

function rdWidgetBody($animateCss, $timeout) {
	var directive = {
		requires: '^rdWidget',
		scope: {
			loading: '=?',
			classes: '@?'
		},
		transclude: true,
		template: '<div class="widget-body" ng-class="classes"><rd-loading ng-show="loading"></rd-loading><div ng-hide="loading" class="widget-content" ng-transclude></div></div>',
		restrict: 'E',
		link: function($scope, $element, $attribute) {

			function startAnime(gap) {
				var tableHeight = angular.element('.table-responsive .table');
				var contHeight = angular.element('.widget-content .table-responsive')[0].clientHeight;
				var bot = contHeight - tableHeight[0].clientHeight;
				$animateCss(tableHeight, {
					transitionStyle: 'bounce all',
					from: {
						marginBottom: bot
					},
					to: {
						marginBottom: gap + bot + 'px'
					},
					duration: 0.3
				}).start();
			}

			function endAnime(gap) {
				var tableHeight = angular.element('.table-responsive .table');
				try {
					$animateCss(tableHeight, {
						transitionStyle: 'bounce all',
						from: {
							marginBottom: gap + 'px'
						},
						to: {
							marginBottom: 0
						},
						duration: 0.3
					}).start();
				} catch(e) {
					//TODO handle the exception
					//					console.log(e);
				}

			}

			function animteBottom(gap) {
				startAnime(gap);
				$timeout(function() {
					angular.element(document).bind('click', function(e) {
						endAnime(gap);
						angular.element(document).unbind('click');
					});
				}, 300);
			}

			angular.element('.table').bind('click', function(e) {
				if(e.target.type === "button" || e.target.parentElement.type === "button") {

					var tree = angular.element('tr.ng-scope');
					var buttons = angular.element(tree).find('#single-button');
					var itemHeight = angular.element('.dropdown-menu')[2].children.length * 24 + 12;
					var tableHeight = angular.element('.widget-content .table-responsive')[0].clientHeight;
					var tr = angular.element('tr')[0].clientHeight;
					//					console.log(angular.element('.widget-content .table-responsive'));
					for(var i = 0; i < buttons.length; i++) {
						if(!tree[i].classList.contains('ng-hide')) {
							//							console.log(tree[i].classList.contains('ng-hide'));
							if(buttons[i].getAttribute('aria-expanded') === "true") {
								var index = angular.copy(i) + 1;
								if(index > 10) {
									index = index % 10;
									if(index == 0) {
										index = 10;
									}
								}

								var totalH = index * tree[i].clientHeight + itemHeight + tr;
								//								console.log(totalH, tableHeight);
								if(totalH > tableHeight) {

									animteBottom(totalH - tableHeight);
								}
							};
						}
					}

					//					if(buttons[buttons.length - 1].getAttribute('aria-expanded') === "true" || buttons[buttons.length - 2].getAttribute('aria-expanded') === "true") {
					//						//						var itemNumber = angular.element(buttons[(i * 10) - 1].nextElementSibling).children.length;
					//						animteBottom();
					//					}
				}

			});

		}
	};
	return directive;
};