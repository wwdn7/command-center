angular
	.module('PVision')
	.directive('pwvalid', ['$q', '$timeout', pwvalid])
	.controller('acc-setting', ["$scope", 'vehicleInfoServices', 'swal', '$location', '$cookieStore', 'Privilege', '$localStorage',
		function($scope, vehicleInfoServices, swal, $location, $cookieStore, Privilege, $localStorage) {
			//		$scope.privilege = "PeaceOfMind".replace(/([A-Z])/g, ' $1').trim();

			$scope.updatePassword = function(modifyPassword) {
//			console.log(modifyPassword.originPassword.$viewValue, modifyPassword.inputPassword.$viewValue);
				
				var oldPW = modifyPassword.originPassword.$viewValue;
				var newPW = modifyPassword.inputPassword.$viewValue;
				var confirmPW = modifyPassword.inputConfirmPassword.$viewValue;

//				 console.log($scope, "old: " + oldPW + "new: " + newPW + "confirm: " + confirmPW);
				if(newPW === confirmPW) {
					vehicleInfoServices.resetPassword(oldPW, newPW).then(function(response) {
						// console.log(response.data.result);
						if(response.data.result == 0) {
							swal({
								title: "Success",
								text: "Password has been reset and please login again",
								type: "info",
								confirmButtonColor: '#d33',
								confirmButtonText: 'OK'
							}).then(function() {
								$location.path('auth/');
							});
						} else if(response.data.result == 19) {
							swal({
								title: "Alert",
								text: "The Original Password you have entrerd is incorrect",
								type: "info",
								confirmButtonColor: '#d33',
								confirmButtonText: 'OK'
							});
						} else {
							swal({
								title: "Alert",
								text: "ERROR",
								type: "info",
								confirmButtonColor: '#d33',
								confirmButtonText: 'OK'
							});
						}
					});
				} else {
					swal({
						title: "Alert",
						text: "Password need to be matched",
						type: "info",
						confirmButtonColor: '#d33',
						confirmButtonText: 'OK'
					});
				}
			}

			function getMonthPlan(role) {
				switch(role) {
					case "PeaceOfMind":
						return "Peace Of Mind";
						break;
					case "Monitoring":
						return "Mornitoring";
						break;
					case "Streaming":
						return "Streaming";
						break;
					case "LiveManagement":
						return "Live Management";
						break;
					default:
						return "";
						break;
				}
			}

			if($localStorage.currentUser.valueOf().roleName) {
				$scope.monthlyPlan = getMonthPlan($localStorage.currentUser.valueOf().roleName);
			}

			$scope.isAdmin = function() {
				return $localStorage.currentUser.valueOf().roleName;
			}
			
			$scope.isgod = function() {
				if($localStorage.currentUser.valueOf().roleName === 'Admin') {
					return true;
				}else {
					return false;
				}
			}

			//		$scope.speedUnit = $cookieStore.get('speed unit');
			//		$scope.speedSet = function(value) {
			//			if(value != $cookieStore.get('speed unit')) {
			//				// $cookies.put('speed unit', value, {'expires' : 'Tue Jan 19 2038 03:14:05 GMT+0000 (GMT Standard Time)'});
			//				$cookieStore.put('speed unit', value);
			//			}
			//			swal({
			//				title: "Success",
			//				text: "Speed unit has set to " + value,
			//				type: "info",
			//				confirmButtonColor: '#d33',
			//				confirmButtonText: 'OK'
			//			}).then(function() {
			//				$location.path('/');
			//			});
			//		}
		}
	])
	.directive('toggleButton', ['$cookieStore', '$state', '$rootScope', function($cookieStore, $state, $rootScope) {
		return {
			require: 'ngModel',
			scope: {
				activeText: '@activeText',
				inactiveText: '@inactiveText',
				lightState: '=ngModel'
			},
			replace: true,
			transclude: true,
			template: '<div>' +
				'<span ng-transclude></span> ' +
				'<button class="btn miles" ng-class="{\'btn-primary\': state.value}" ng-click="state.toggle()">{{activeText}}</button>' +
				'<button class="btn kilo" ng-class="{\'btn-primary\': !state.value}" ng-click="state.toggle()">{{inactiveText}}</button>' +
				'</div>',
			link: function postLink(scope, element) {
				scope.lightState = scope.inactiveText;
				element.css('padding-left', '3%');

				function getSpeedUnit() {
					var str = $cookieStore.get('speedUnit');
					return(str === 'Miles') ? true : false;
				};

				scope.state = {
					value: getSpeedUnit(),
					toggle: function() {
						this.value = !this.value;
						scope.lightState = this.value ? scope.activeText : scope.inactiveText;
						//						console.log(scope.lightState);
						$cookieStore.put('speedUnit', scope.lightState);
						swal({
							title: "Success",
							text: "Speed unit has set to " + scope.lightState,
							type: "info",
							confirmButtonColor: '#d33',
							confirmButtonText: 'OK'
						}).then(function() {
							$rootScope.$broadcast('reloadVehiList');
							$state.reload();
						});
					}
				};
			}
		}
	}]);

function pwvalid($q, $timeout) {
	return {
		restrict: "A",
		require: "ngModel",
		link: function(scope, element, attributes, ngModel) {
			ngModel.$validators.pwvalid = function(modelValue) {
				if(!ngModel) return; //do nothing if no ng-model

				//watch own value if and re-validate on change
				scope.$watch(attributes.ngModel, function() {
					validate();
				});

				//observe the other value and re-validate the change
				attributes.$observe('pwvalid', function(val) {
					validate();
				});

				var validate = function() {
					//values
					var val1 = ngModel.$viewValue;
					var val2 = attributes.pwvalid;
					//set validity
					ngModel.$setValidity('pwvalid', val1 === val2);
				};
			}
		}
	};
};