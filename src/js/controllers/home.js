'use strict';

angular
	.module('PVision')
	.controller('indexCtroller', ['$scope', '$localStorage', '$state', 'swal', '$uibModal', '$indexedDB', '$rootScope', '$document', 'vehiStatus', '$filter', indexCtroller])
	.controller('ModalInstanceCtrl', ['$uibModalInstance', 'notifications', '$indexedDB', 'vehiStatus', '$scope', '$rootScope', ModalInstanceCtrl]);

function indexCtroller($scope, $localStorage, $state, swal, $uibModal, $indexedDB, $rootScope, $document, vehiStatus, $filter) {
	var vm = this;
	var modalInstance;

	vm.isNotify = function() {
		if($rootScope.currentAlerts && $rootScope.currentAlerts.length > 0) {
			return true;
		}
	};
	//		vm.notifications = $rootScope.currentAlerts;

	vm.open = function() {
		modalInstance = $uibModal.open({
			animation: true,
			ariaLabelledBy: 'modal-title',
			ariaDescribedBy: 'modal-body',
			templateUrl: 'myModalContent.html',
			controller: 'ModalInstanceCtrl',
			controllerAs: 'vm',
			size: 'lg',
			//			backdrop: false,
			resolve: {
				notifications: function() {
					return $rootScope.currentAlerts;
				}
			}
		});
	};

	vm.grouping = function() {
		$state.go('grouping');
	}

	vm.logout = function() {
		swal({
			title: "Are you sure?",
			text: "You are signing out",
			type: "warning",
			allowOutsideClick: false,
			showCancelButton: true,
			confirmButtonColor: "#DD6B55",
			confirmButtonText: "Sign Out",
			cancelButtonText: "Cancel",
		}).then(function() {
			$state.go('login');
		});
	};

	initController();

	function initController() {
		// make username available to view
		if($localStorage.currentUser) {
			vm.username = $localStorage.currentUser.username;
		}
		//console.log(vm.username);
	};
};

function ModalInstanceCtrl($uibModalInstance, notifications, $indexedDB, vehiStatus, $scope, $rootScope) {
	var vm = this;
	vm.notificates = notifications;

	//				  console.log("gotcha!", $uibModalInstance);
	function getNotify() {
		return notifications;
	}

	/*close context menu when modal closed*/
	$uibModalInstance.result.then(function() {
		//			console.log('asasasa');
	}, function() {
		//			console.log(angular.element('#menu'));
		angular.element('#menu').removeClass("menu-active");
	});

	$scope.$on('closeModalPls', function() {
		$uibModalInstance.close();
	});

	//	  $scope.$watch('currentAlerts', function(val){
	//	  	if(val){
	//			console.log('notifications pushed'); //not pushed when updated
	//	  		vm.notificates = val;
	//	  	}
	//	  });

	//display time in seconds
	$scope.timePass = function(time) {
		return vehiStatus.timeAgo(time);
	};

	$scope.removeNot = function(ki, index) {

		//	  	console.log(ki);
		//		var msg = angular.element( document.querySelector("#key" +ki ) );
		//		msg.remove();

		$indexedDB.openStore('alerts', function(store) {
			store.upsert({
				"armTime": ki,
				"checked": false
			}).then(function(e) {
				console.log("data has been deleted!", e);
			});
		});

		vm.notificates.splice(index, 1);
		$rootScope.$broadcast('NotifyUpdated');

	};

	$scope.close = function(){
		console.log("Bye!");
		$uibModalInstance.close();
	}

	$scope.clearAll = function() {

		//	  	console.log(vm.notificates);
		var updateAll = [];
		vm.notificates.map(function(val) {
			var notify = {
				"armTime": val.armTime,
				"checked": false
			};
			updateAll.push(notify);
		});
		//	  	console.log(updateAll);

		$indexedDB.openStore('alerts', function(store) {
			store.upsert(updateAll).then(function() {
				console.log("all data have been cleared!");
			});
		});
		vm.notificates = [];
		$rootScope.$broadcast('NotifyUpdated');
	};

	vm.config = {
		autoHideScrollbar: true,
		theme: 'minimal-dark',
		setHeight: 400,
		scrollInertia: 0
	};

	//
	$scope.isAlarm = function(type) {
		if(type == 53 || type == 49) {
			return "notification-item-alarm";
		}
	}

	$scope.getVerb = function(type) {
		switch (type){
			case 53:
				return ' on ';
				break;
			case 49:
				return ' on ';
				break;
			case 'hardware':
				return ': ';
				break;
			case 'device+':
				return '';
				break;
			case 'device-':
				return '';
				break;
			default:
				return '';
				break;
		}
	}

};
