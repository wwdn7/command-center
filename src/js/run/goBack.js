angular
	.module('PVision')
  .run(['$window', '$rootScope',
    function ($window ,  $rootScope) {
      $rootScope.goBack = function(){
        $window.history.back();
      }
}]);
