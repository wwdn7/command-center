'use strict';
/**
 *Handle http error 
 */

angular
	.module('PVision')
	.factory('unauthorisedInterceptor', ['$q', '$state', '$localStorage', '$location',
		function($q, $state, $localStorage, $location) {
			return {
				response: function(responseData) {
					//					console.log(responseData);
					return responseData;
				},
				responseError: function(rejection) {
					switch(rejection.status) {
						case 401:
							$state.go('login');
							break;
						case 404:
							//							$state.go('ErrorPage');
							break;
							//						default:
							//							$state.go('ErrorPage');
					}
					return $q.reject(rejection);
				},
				request: function(config) {
					//					console.log(config.url.valueOf());
					//					if(!$localStorage.currentUser.valueOf().token) {
					//						console.log('local storage no token exists!');
					//					}

					//如果是API request && token不存在 && 不是登录的request的情况下，返回登录界面 
					if(config.method === "JSONP" && config.params) {
						if(!config.params.jsession && !config.params.password) {
							console.log('token & password not exists, return to login page');
							$state.go('login');
						}
					}
					return config;
				}
			};
		}
	])
	.controller('404Ctrl', ['$scope', '$location', function($scope, $location) {
		$scope.path = $location.path();
		$scope.back = function() {
			history.back();
		};
		$scope.home = function() {
			$location.path('/');
		}
	}]);