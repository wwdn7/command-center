angular
	.module('MultiFilter', ['ui.bootstrap'])
	.controller('filterCtrl', ['$scope', 'filterService', filterCtrl])
	.factory('filterService', filterService)
	.filter('multiKeywords', ['$filter', multiKeywords])
	//	.animation('.filter-ready-to-use', ['$animateCss', initWordFilter])
	.animation('.filter-box-item', ['$animateCss', keywordFilter])
	.directive('repeatKeywordAnimation', ['$animateCss', repeatKeywordAnimation])
	//	.value('initData', [])
	//	.value('initKeywords', ['UK', 'Ireland'])
	.directive('multiInputs', ['filterService', '$timeout',
		function(filterService, $timeout) {
			return {
				restrict: 'E',
				templateUrl: 'templates/element/multiInputsFilter.html',
				controller: 'filterCtrl',
				link: function(scope, element, attrs) {
					scope.filterInitArray = [];
					element.addClass('mul-filter-wrapper');
					//					var unbind = scope.$watch(getfirstElm, function(elm) {
					//						if(elm) {
					//							elm.style.clear = 'left';
					//							elm.style.marginLeft = '0';
					//							//							unbind();
					//						};
					//					});
					//										console.log(angular.element('.filter-box-wrapper'));
					function getConHeight() {
						return angular.element('.filter-box-wrapper').height();
						//						return element.children().children().height();
					};

					//					function getfirstElm() {
					//						return angular.element('.filter-box-item')[0];
					//					};

					scope.$watch(getConHeight, function(height) {
						//						var height = element.children().children()[0].clientHeight;
						//						console.log(element.children().children()[0].clientHeight + 10 + 'px', element.children().children(), height);
						if(height) {
							element.children().css('height', height + 25 + 'px');
						}
					});

//					window.onresize = function() {
//						element.children().css('height', getConHeight() + 25 + 'px');
//					};

					angular.element(window).on('resize', function() {
						element.children().css('height', getConHeight() + 25 + 'px');
					})

					scope.removeKeyword = function(key) {
						scope.filterArray.splice(key, 1);
						$timeout(function() {
							element.children().css('height', getConHeight() + 25 + 'px');
						}, 1200);
					};
					//										console.log(filterService.getInitKeywords());
					scope.readyKeywords = filterService.getInitKeywords();

					scope.clearAll = function() {
						scope.filterInitArray = [];
						scope.filterArray = [];
						for(var i = 0; i < scope.readyKeywords.length; i++) {
							scope['reverse' + i] = false;
						};
						$timeout(function() {
							element.children().css('height', getConHeight() + 25 + 'px');
						}, 1200);
					};

					scope.enableKeyword = function(key, word) {
						scope['reverse' + key] = !scope['reverse' + key];
						if(scope['reverse' + key]) {
							scope.filterInitArray.push({
								value: word
							});
						} else {
							scope.filterInitArray = scope.filterInitArray.filter(function(fil) {
								return fil.value !== word;
							});
						};
					};

					scope.isUsed = function(key) {
						return scope['reverse' + key] ? "filter-box-enable" : "";
					};

					scope.$watchCollection('filterInitArray', function(arr) {
						var keywords = scope.filterArray.concat(arr);
						scope.$emit('filterThis', keywords);
					});

				}
			};
		}
	]);

function filterCtrl($scope, filterService) {

	$scope.filterArray = [];

	$scope.submit = function() {
		if($scope.multiKeyword) {
			if(!$scope.filterArray.some(function(item) {
					return item.value === $scope.multiKeyword
				})) {
				$scope.filterArray.push({
					value: $scope.multiKeyword
				});
			}
			$scope.multiKeyword = "";
		};
	};

	$scope.keySubmit = function(key) {
		if(key == 13 && $scope.multiKeyword) {
			if(!$scope.filterArray.some(function(item) {
					return item.value === $scope.multiKeyword
				})) {
				$scope.filterArray.push({
					value: $scope.multiKeyword
				});
			}
			$scope.multiKeyword = "";
		};
	};

	$scope.$watchCollection('filterArray', function(arr) {
		var keywords = $scope.filterInitArray.concat(arr);
		$scope.$emit('filterThis', keywords);
	});

	$scope.isInUse = function(word) {
		var inUse = $scope.readyKeywords.some(function(val) {
			return val === word;
		});
		return inUse;
	}
};

filterService.$inject = ['$filter'];

function filterService($filter) {
	var service = {
		getInitKeywords: getInitKeywords,
		filterThis: filterThis,
		config: config,
		initData: initData,
        filterAlert: filterAlert
	};

	var initData = [];
	var initKeywords = [];

	function getInitKeywords() {
		return initKeywords;
	};

	function filterThis(arr) {
		if(angular.isArray(arr) && arr.length > 0) {
			var result = $filter('multiKeywords')(initData, arr);
			return result;
		} else {
			return initData;
		}
	};

	function config(obj) {
		if(angular.isArray(obj.initKeywords)) {
			initKeywords = obj.initKeywords;
		};
		if(obj.initData) {
			initData = obj.initData;
		};
	};

	function filterAlert(arr, id) {
		if(angular.isArray(arr) && arr.length > 0 && arr[0].devStatus) {
		//	console.log('passed in array ', arr);
			return Array.of(arr.find(function(elem){
				return elem.devStatus.devIdno === id;
			}));
		}
	}

	return service;
};

function multiKeywords($filter) {
	return function(array, key) {
		//				console.log(array, key);
		var result = key.reduce(function(arr, val, i) {
			//						console.log(arr, val, i);
			var temp = $filter('filter')(arr, val.value);
			//						console.log('temp: ', temp);
			return temp;
		}, array);

		return result;
	};
};

function keywordFilter($animateCss) {
	return {
		enter: function(element) {
			return $animateCss(element, {
				keyframeStyle: '1s flipInX linear'
			}).start();
		},
		leave: function(element) {
			return $animateCss(element, {
				keyframeStyle: '1s flipOutX linear'
			}).start();
		},
	}
};

/*function initWordFilter($animateCss) {
	return {
		enter: function(element) {
			return $animateCss(element, {
				stagger: 0.2,
				keyframeStyle: '0.2s bounceInLeft linear'
			}).start();
		},
	}
};*/

function repeatKeywordAnimation($animateCss) {

	return {
		link: function(scope, element) {
			//			console.log(element);
			$animateCss(element, {
				stagger: 0.2,
				//								delay:5,
				//								staggerIndex: 0.1,
				duration: 0.4,
				//				from: {
				//					opacity: 0,
				////					animation: '0.8s bounceInLeft'
				//				},
				//				to: {
				//					opacity: 1,
				////					animation: '0.8s bounceInLeft'
				//				},
				keyframeStyle: '0.8s bounceInLeft'
			}).start();
		},
	}
}