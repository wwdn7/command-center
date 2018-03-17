/**
 * @author v.lugovksy
 * created on 16.12.2015
 */
(function() {
	'use strict';

	angular.module('PVision')
		.directive('msgCenter', msgCenter);

	/** @ngInject */
	function msgCenter() {
		return {
			restrict: 'E',
			templateUrl: 'templates/element/msgCenter.html',
			controller: 'MsgCenterCtrl'
		};
	}

})();