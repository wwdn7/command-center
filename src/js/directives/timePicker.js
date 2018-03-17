angular
.module('PVision')
.directive('timePicker', ['swal', 'vehicleInfoServices', 'valTransfer', function(swal, vehicleInfoServices, valTransfer){
	return {
		restrict:'E', //Element Type
		//Define template
		templateUrl: 'templates/element/timePicker.html',
		//		    template:'<div><div><h4>Select vehicle</h4><select  ng-model="vehicle_id" ng-options="vehicle.idno as vehicle.userAccount.name for vehicle in vehiList" style="color: #555;"></select></div><div class="form-group"><h4>From</h4><adm-dtp ng-model="startDate" full-data="startDate_detail" maxdate="{{endDate_detail.unix}}"></adm-dtp><h4>To</h4><adm-dtp ng-model="endDate" options="endDate_options" full-data="startDate_detail" maxdate="{{endDate_detail.unix}}"></adm-dtp></div><div class="jourey-search-btn row"><div class="col-md-3"><button class="btn btn-info" ng-click="queries()" style="position: relative; margin-top:60%; padding:10px; font-size: large">Search</button></div></div></div>',
		replace:true, //Allowing replacing
		link:function($scope,$element,$attribute){
			var data = valTransfer.getter();
//			console.log(data);
			//Time Picker
			  $scope.endTime = new Date(data.callEnd);
			  $scope.beginTime = new Date(data.callBegin);
			  $scope.max = new Date(data.callEnd);
			  $scope.min = new Date(data.callBegin);
			  
			  $scope.hstep = 1;
			  $scope.sstep = 1;
			  $scope.mstep = 1;
			  $scope.ismeridian = false;
		}
	}
}])
