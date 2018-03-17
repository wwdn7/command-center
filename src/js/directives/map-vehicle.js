var myApp = angular.module("PVision");
myApp.directive("mapVehicle", ["vehicleInfoServices", "$rootScope", "$interval", "vehiStatus", "vehicles", "$stateParams", "$localStorage",
	function(vehicleInfoServices, $rootScope, $interval, vehiStatus, vehicles, $stateParams, $localStorage) {
		return {
			restrict: 'E', //Element Type
			template: '<div></div>', //Defining myApp div
			replace: true, //Allowing replacing
			link: function(scope, element, attributes) {
				var vehicle = {
				//	path: vehicles.arrow,
					path: vehicles.car,
					fillColor: '#828282',
					fillOpacity: 1,
					scale: 0.008,
					strokeColor: 'black',
					strokeWeight: 1,
					anchor: new google.maps.Point(1000, 50)
				};
				var coordinate = new google.maps.LatLng(53.410233, -6.345580);
				var mapOptions = {
					center: coordinate, //Center of our map based on LatLong Coordinates
					zoom: 15, //How much we want to initialize our zoom in the map
					mapTypeId: google.maps.MapTypeId.ROADMAP, //Map type, you can check them in APIs documentation
					fullscreenControl: true // allow to view in full screen.
				};
				var map = new google.maps.Map(document.getElementById(attributes.id), mapOptions);
				var marker = [];
				//				scope.$on('deviceChange', function(event, data) {
				if($stateParams.id) {
					var data = $stateParams.id;
				} else if($localStorage.currentDevID) {
					var data = $localStorage.currentDevID;
				};

				var previousVehicleInfo;
				var currentVehicleInfo;
				var unbind = scope.$watch('items', function(newValue, oldValue) {
					//					console.log(newValue, oldValue);
					if(oldValue) {
						previousVehicleInfo = oldValue.filter(function(e) {
							return e.devStatus.devIdno == data;
						});
						//						marker[previousVehicleInfo[0].devStatus.gpsTimeStr].setMap(null);
					};
					if(newValue) {
						if(currentVehicleInfo && previousVehicleInfo) {
							marker[currentVehicleInfo[0].devStatus.gpsTimeStr].setMap(null);
							marker[previousVehicleInfo[0].devStatus.gpsTimeStr].setMap(null);
						}
						//						scope.$on('deviceChange', function(event, data) {
						//							console.log('hahaha');
						//							marker[currentVehicleInfo[0].devStatus.gpsTimeStr].setMap(null);
						//							marker[previousVehicleInfo[0].devStatus.gpsTimeStr].setMap(null);
						//							unbind();
						//						});
						currentVehicleInfo = newValue.filter(function(e) {
							return e.devStatus.devIdno == data;
						});
						//						console.log(currentVehicleInfo[0]);
						if(currentVehicleInfo[0].devInfo.icon == 2){
							vehicle.path = vehicles.truck;
						}else{
							vehicle.path = vehicles.car
						}
						if(currentVehicleInfo[0].devStatus.online == 0 || currentVehicleInfo[0].devStatus.online == null) {
							vehicle.fillColor = '#828282';
						} else {
							if(vehiStatus.acc(currentVehicleInfo[0].devStatus.status1) === "OFF") {
								vehicle.fillColor = '#988e40';
							} else {
								vehicle.fillColor = '#18a31b';
								if(currentVehicleInfo[0].devStatus.parkTime > 180) {
									vehicle.fillColor = '#efefd7';
								}
							}
						}
						//						var oldLat = parseFloat(previousVehicleInfo[0].devStatus.weiDuEx);
						//						var oldLng = parseFloat(previousVehicleInfo[0].devStatus.weiDuEx);
						var lat = parseFloat(currentVehicleInfo[0].devStatus.weiDuEx);
						var lng = parseFloat(currentVehicleInfo[0].devStatus.jingDuEx);
					//	var rotation = currentVehicleInfo[0].devStatus.hangXiang - 180;
                        var rotation = currentVehicleInfo[0].devStatus.hangXiang;
						vehicle.rotation = rotation;

						marker[currentVehicleInfo[0].devStatus.gpsTimeStr] = new google.maps.Marker({
							position: new google.maps.LatLng(lat, lng),
							icon: vehicle,
							map: map
						});

						marker[currentVehicleInfo[0].devStatus.gpsTimeStr].setMap(map);
						map.panTo(new google.maps.LatLng(lat, lng));
						// var trafficLayer = new google.maps.TrafficLayer();
						// trafficLayer.setMap(map);
						// map.setZoom(15);
					}
				});
			}
			//				});
		};
	}
]);
