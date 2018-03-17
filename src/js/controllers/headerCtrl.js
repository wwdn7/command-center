angular
	.module('PVision')
	.controller('headerCtrl', ['$scope', 'toastr', headerCtrl])
	.directive('stopEvent', ['Privilege', '$localStorage', stopEvent]);

function headerCtrl($scope, toastr) {
	
}

function stopEvent(Privilege, $localStorage) {
	return {
		restrict: 'A',
		link: function($scope, $element, $attr) {
//			console.log($element.hover());
			if($localStorage.currentUser.valueOf().roleName == Privilege.PeaceOfMind) {
//				$element.hide();
				$element.addClass('disable-component');
			}
		}
	};
}