/**
 *The login index controller handles all interaction and data for the login index view, 
 *when it first loads it ensures the user is logged out (in the initController() function), 
 *which is why the logout link on the home index view just needs to send the user to the login page.
 */
'use strict';

angular
	.module('PVision')
	.controller('loginCtroller', ['$scope', '$location', 'AuthenticationService', loginCtroller]);

function loginCtroller($scope, $location, AuthenticationService) {
	var vm = this;

	vm.login = login;

	initController();

	function initController() {
		//reset login status
		AuthenticationService.Logout();
	};

	function login() {
		vm.loading = true;
		AuthenticationService.Login(vm.username, vm.password, function(result) {
			if(result === true) {
				$location.path('/');
			} else {
				//console.log(vm.username + vm.password);
				vm.error = 'Username or password is incorrect';
				vm.loading = false;
			}
		});
	};

	$scope.inputType = 'password';

	$scope.showPassword = function() {
		if($scope.inputType == 'password') {
			$scope.inputType = 'text';
		} else {
			$scope.inputType = 'password';
		};
	}
}