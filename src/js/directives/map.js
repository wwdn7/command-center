var myApp = angular.module("PVision");

myApp.directive("mapView", ["vehiStatus", "$compile", "$rootScope", "$compile", "vehicles", "utility", "$state", "$templateCache",
	function(vehiStatus, $compile, $rootScope, $compile, vehicles, utility, $state, $templateCache) {
		return {
			restrict: 'E', //Element Type
			templateUrl: 'templates/element/infowindow.html',
			replace: true, //Allowing replacing
			link: function(scope, element, attributes) {

				scope.vehicle = {
					id: "",
					time: "",
					address: "",
					speed: "",
				};

				var trafficbtn = $templateCache.get('traffic-btn.html');

				var mapPanel = $templateCache.get('map-panel.html');

				element.ready(function() {
					angular.element('.gm-style').ready(function() {
						var target = angular.element('#map-view').children().children();
						target.append(angular.element(trafficbtn));
						$compile(angular.element('.traffic-container'))(scope);
					});

				});
				
				var trafficLayer = new google.maps.TrafficLayer();
				
				scope.$on("setTraffic", function() {

					scope.reverseTraffic = !scope.reverseTraffic;
					
					if(scope.reverseTraffic) {
						trafficLayer.setMap(map);
					} else {
						trafficLayer.setMap(null);
					}
				})

				var minusHeight = function() {
					//					console.log($state.current.name);
					switch($state.current.name) {
						case "index":
							return 580;
							break;
						case "view-map":
							return 210;
							break;
						default:
							return 580;
							break;
					}
				};

				var mapHeight = window.innerHeight - minusHeight();
				angular.element(document.querySelector('#map-view')).css('height', mapHeight + 'px');

				angular.element(window).on('resize', function() {
					mapHeight = window.innerHeight - minusHeight();
					angular.element(document.querySelector('#map-view')).css('height', mapHeight + 'px');
					google.maps.event.trigger(map, "resize");
				});

				var pos = {
					lat: 53.414669,
					lng: -6.348474
				};
				//Initializing Coordinates
				var mapOptions = {
					center: pos, //Center of our map based on LatLong Coordinates
					maxZoom: 15, //How much we want to initialize our zoom in the map
					mapTypeId: google.maps.MapTypeId.ROADMAP, //Map type, you can check them in APIs documentation
					fullscreenControl: true // allow to view in full screen.
				};
				var geocoder = new google.maps.Geocoder;
				var infoWindow = new google.maps.InfoWindow();
				//Attaching our features & options to the map
				var map = new google.maps.Map(document.getElementById('map-view'), mapOptions);

				var markers = []; //use for clustering
				var markerCluster;
				//monitoring
				scope.$watch('items', function(newVal, oldVal) {
						if(newVal) {
							scope.onlineDevices = newVal.filter(function(val) {
								return val.devStatus.online == 1;
							});
							for(var i = 0; i < markers.length; i++) {
								markers[i].setMap(null);
							}
							markers = [];

							if(typeof markerCluster === 'object') {
								markerCluster.clearMarkers();
							}

							//Putting a marker on the center
							var vehicle = {
								path: vehicles.car,
								fillColor: '#006DF0',
								fillOpacity: 1,
								scale: 0.008,
								strokeColor: 'black',
								strokeWeight: 1,
								anchor: new google.maps.Point(0, 50)
							};
							map.addListener('dragend', function() {
								scope.drag = true;
							});
							map.addListener('zoom_changed', function() {
								scope.zoomChange = true;
							});
							var bounds = new google.maps.LatLngBounds();
							// Looping through the JSON data
							for(var i = 0, length = scope.onlineDevices.length; i < length; i++) {
								var item = scope.onlineDevices[i];
								if(item.devInfo.icon == 2) {
									vehicle.path = vehicles.truck;
								} else {
									vehicle.path = vehicles.car
								}
								var coordinate = {
									lat: item.devStatus.weiDuEx,
									lng: item.devStatus.jingDuEx
								};
								var latLng = new google.maps.LatLng(coordinate.lat, coordinate.lng);

								//assign color to vehicle for different status.
								if(vehiStatus.acc(item.devStatus.status1) === "OFF") {
									vehicle.fillColor = '#988e40';
								} else {
									vehicle.fillColor = '#18a31b';
									if(item.devStatus.parkTime > 180) {
										vehicle.fillColor = '#b2bfdc';
									}
								}
								var rotation = item.devStatus.hangXiang;
								vehicle.rotation = rotation;
								// Creating a marker and putting it on the map
								var marker = new google.maps.Marker({
									position: latLng,
									icon: vehicle,
									// icon: 'img/car.svg',
									map: map,
									title: item.devInfo.userAccount.name
								});
								bounds.extend(marker.getPosition());
								markers.push(marker);
								if(scope.vehicle.id == item.devInfo.userAccount.name) {
									scope.vehicle.id = item.devInfo.userAccount.name;
									// scope.time = item.devStatus.gpsTimeStr;
									scope.vehicle.time = item.devStatus.gpsTime;
									// scope.speed = item.devStatus.speed / 10;
									scope.vehicle.speed = utility.getSpeed(item.devStatus.speed);
									scope.vehicle.sim = item.devStatus.devIdno;
									if(!scope.drag) {
										map.panTo(marker.position);
									}
								}
								// Creating a closure to retain the correct data, notice how I pass the current data in the loop into the closure (marker, data)
								(function(marker, item) {
									// Attaching a click event to the current marker
									google.maps.event.addListener(marker, "click", function(e) {
										//										console.log(item);

										var infowin = angular.element('#infowindow');

										scope.vehicle.id = item.devInfo.userAccount.name;
										// scope.time = item.devStatus.gpsTimeStr;
										scope.vehicle.time = item.devStatus.gpsTime;
										// scope.speed = item.devStatus.speed / 10;
										scope.vehicle.speed = utility.getSpeed(item.devStatus.speed);
										scope.vehicle.sim = item.devStatus.devIdno;
										scope.drag = false;
										var l = new google.maps.LatLng(item.devStatus.weiDuEx, item.devStatus.jingDuEx);

										if(!infowin[0]) {
											var target = angular.element('#map-view').children().children();
											target.append(angular.element(mapPanel));
											$compile(angular.element('#infowindow'))(scope);
										}

										geocoder.geocode({
											'location': l
										}, function(results, status) {
											if(status === 'OK') {
												if(results[1]) {
													scope.vehicle.address = results[0].formatted_address;
													scope.$digest();
													// var compiled = $compile(content)(scope);
													// infoWindow.setContent(compiled[0]);
													// infoWindow.open(map, marker);
													map.setZoom(16); // zoom in when click on the vehicle.
													map.setCenter(marker.position);
												} else {
													window.alert('No results found');
												}
											} else {
												window.alert('Geocoder failed due to: ' + status);
											}
										});
									});

									// Event that closes the Info Window with a click on the map
									/*google.maps.event.addListener(map, 'click', function() {
										console.log('clicked');
									});*/
								})(marker, item);
							}
							if(scope.sign == null && !scope.zoomChange && !scope.drag) {
								map.fitBounds(bounds);
							}
							window.setTimeout(function() {
								google.maps.event.trigger(map, 'resize');
								if(scope.sign == null && !scope.zoomChange && !scope.drag) {
									map.fitBounds(bounds);
								}
							}, 100);
							//Vehicle clustering
							markerCluster = new MarkerClusterer(map, markers, {
								imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'
							});
						}

					},
					function() {
						handleLocationError(true, infoWindow, map.getCenter());
					});
			}
		};

		function handleLocationError(browserHasGeolocation, infoWindow, pos) {
			infoWindow.setPosition(pos);
			infoWindow.setContent(browserHasGeolocation ?
				'Error: The Geolocation service failed.' :
				'Error: Your browser doesn\'t support geolocation.');
			infoWindow.open(map);
		}
	}
]);