var myApp = angular.module("PVision");
myApp.controller('playControl', ["$scope", function($scope) {
		$scope.pausePlay = function() {
			$scope.pause = true;
			$scope.resume = false;
			$scope.showPause = false;
			$scope.showResume = true;
		};
		$scope.resumePlay = function() {
			$scope.pause = false;
			$scope.resume = true;
			$scope.showPause = true;
			$scope.showResume = false;
			console.log('Resume');
			$scope.$broadcast('resume', $scope);
		}
	}])
	.directive("mapTrack", ["$rootScope", "$interval", "$timeout", "swal", "vehicles", 'utility', '$q', function($rootScope, $interval, $timeout, swal, vehicles, utility, $q) {
		return {
			restrict: 'E', //Element Type
			templateUrl: 'templates/element/playRouteControl.html',
			replace: true, //Allowing replacing
			link: function(scope, element, attributes) {
				var apiKey = 'AIzaSyDANsEavAQS9nwX9baymNwCxnWmjZh4gHQ';
				var myLatLng = new google.maps.LatLng(53.410233, -6.345580);
				var mapOptions = {
					center: myLatLng, //Center of our map based on LatLong Coordinates
					zoom: 5, //How much we want to initialize our zoom in the map
					mapTypeId: 'roadmap', //Map type, you can check them in APIs documentation
					fullscreenControl: true // allow to view in full screen.
				};
				var map = new google.maps.Map(document.getElementById("map-track"), mapOptions);
				var parking = {
					path: "M556.3,579.8H449.4v213.6h-107v-534h213.9c105.6,0,157,73.3,157,160.1c0,86.8-40.5,160.1-146.2,160.1h-10.8V579.8z M500,10.7c-270.6,0-490,219-490,489.3c0,270.2,219.4,489.3,490,489.3c270.7,0,490-219.1,490-489.3C990,229.7,770.7,10.7,500,10.7L500,10.7z M556.3,366.1H449.4V473h106.9c45.2,0,53.4-11.8,53.4-53.4c0-41.6,2.6-53.4-42.7-53.4H556.3L556.3,366.1z",
					fillColor: "#0000FF",
					fillOpacity: 1,
					scale: 0.015,
					anchor: new google.maps.Point(185, 200)
				};
				var alert = {
					path: vehicles.alert,
					fillColor: "#D80027",
					fillOpacity: 1,
					scale: 0.1,
					anchor: new google.maps.Point(185, 200)
				};
				var vehicle = {
					path: vehicles.arrow,
					fillColor: '#4769b2',
					fillOpacity: 1,
					scale: 0.07,
					anchor: new google.maps.Point(185, 200)
				};

				var start = {
					url: 'img/start.png'
				};
				var end = {
					url: 'img/end.png',
					anchor: new google.maps.Point(5, 42)
				};

				scope.$on('TrackResult', function(event, data) {

					//					scope.$on('showGSensor', function(event, data) {
					//						if(data)
					//							return;
					//					});
					//					scope.$on('showAdas', function(event, data) {
					//						if(data)
					//							return;
					//					});
					if(scope.play) {
						$interval.cancel(scope.play);
						$interval.cancel(scope.smallSeg);
						scope.button_clicked = false;
					}
					var map = new google.maps.Map(document.getElementById("map-track"), mapOptions);
					var infos = data;
					var routes = [];
					if(infos.length > 1 && infos && infos != null) {
						for(i = 0; i < infos.length; i++) {
							if(infos[i].mapJingDu != null && infos[i].mapWeiDu != null) {
								if(routes.indexOf({
										lat: parseFloat(infos[i].mapWeiDu),
										lng: parseFloat(infos[i].mapJingDu)
									}) == -1) {
									routes.push({
										lat: parseFloat(infos[i].mapWeiDu),
										lng: parseFloat(infos[i].mapJingDu)
									});
								}
							}
						}
						var lastPosition = new google.maps.LatLng({
							lat: parseFloat(infos[infos.length - 1].mapWeiDu),
							lng: parseFloat(infos[infos.length - 1].mapJingDu)
						});
						vehicle.rotation = infos[infos.length - 1].huangXiang - 180;
						marker = new google.maps.Marker({
							position: lastPosition,
							icon: vehicle,
							map: map
						});
						var path = new google.maps.Polyline({
							path: routes,
							geodesic: true,
							strokeColor: 'green',
							strokeWeight: 3,
							map: map
						});
						map.setCenter(lastPosition);
						makeBoundary(routes, map);
					} else {
						console.log('no trips');
						swal({
							title: "Info",
							text: "There is not any trips for this vehicle for the date that you have selected",
							type: "info",
							confirmButtonColor: '#d33',
							confirmButtonText: 'OK'
						});
					}

					/**
					 * Show Path
					 **/
					scope.$on('showRoutes', function(event, data) {
						scope.showPause = false;
						scope.showResume = false;
						scope.pause = false;
						scope.resume = false;
						if(scope.play) {
							$interval.cancel(scope.play);
						}
						var routes = data.map(function(elem) {
							return {
								lat: parseFloat(elem.mapWeiDu),
								lng: parseFloat(elem.mapJingDu)
							};
						}).filter(function(e) {
							return(e.lat && e.lng);
						});
						var map = new google.maps.Map(document.getElementById("map-track"), mapOptions);

						startPoint = new google.maps.Marker({
							position: new google.maps.LatLng(routes[0].lat, routes[0].lng),
							icon: start,
							map: map
						});
						endPoint = new google.maps.Marker({
							position: new google.maps.LatLng(routes[routes.length - 1].lat, routes[routes.length - 1].lng),
							icon: end,
							map: map
						});
						map.panTo(new google.maps.LatLng(routes[0].lat, routes[0].lng));
						placeGAlerts(data, map);
						placeAdasAlerts(data, map);
						placeParking(data, map);
						makeBoundary(routes, map);
						drawRoutes(data, map);
						// runSnapToRoad(data, map);
						// drawPolyline(routes, map);
					});

					/**
					 * Play Path
					 **/
					scope.$on('playRoutes', function(event, data) {
						scope.showPause = true;
						scope.showResume = false;
						scope.pause = false;
						scope.resume = false;
						if(scope.button_clicked) {
							if(scope.play != null) {
								$interval.cancel(scope.play);
								scope.button_clicked = false;
							}
						}
						if(!scope.button_clicked) {
							var routes = data.map(function(elem) {
								return {
									lat: parseFloat(elem.mapWeiDu),
									lng: parseFloat(elem.mapJingDu)
								};
							}).filter(function(e) {
								return(e.lat && e.lng);
							});
							var newData = data.filter(function(e) {
								return(e.mapWeiDu && e.mapJingDu);
							});
							var map = new google.maps.Map(document.getElementById("map-track"), mapOptions);
							startPoint = new google.maps.Marker({
								position: new google.maps.LatLng(routes[0].lat, routes[0].lng),
								icon: start,
								map: map
							});
							endPoint = new google.maps.Marker({
								position: new google.maps.LatLng(routes[routes.length - 1].lat, routes[routes.length - 1].lng),
								icon: end,
								map: map
							});
							marker = new google.maps.Marker({
								position: new google.maps.LatLng(routes[0].lat, routes[0].lng),
								icon: vehicle,
								map: map
							});
							map.panTo(new google.maps.LatLng(routes[0].lat, routes[0].lng));
							map.setZoom(12);

							var infowindow = new google.maps.InfoWindow();
							var index = 0;
							// drawPolyline(routes, map);
							drawRoutes(data, map);
							var movePath = makePath(newData);
							console.log(movePath);
							var times = movePath.length - 1;
							placeGAlerts(data, map);
							placeAdasAlerts(data, map);
							makeBoundary(routes, map);
							moveVehicleOnPath(movePath, vehicle, times, index, infowindow, map);
						}
						scope.button_clicked = true;
						return scope.button_clicked;
					});

					/**
					 * Resume play route
					 **/
					scope.$on('resumeDetails', function(event, data) {
						var resumeDetails = data;
						scope.$on('resume', function(event, data) {
							moveVehicleOnPath(resumeDetails.routes, resumeDetails.vehicle, resumeDetails.routes.length - resumeDetails.index, resumeDetails.index, resumeDetails.infowindow, resumeDetails.map);
						});
					});

					scope.$on('$destroy', function() {
						$interval.cancel(scope.play);
					});
				});

				/**
				 * Show location of speeding alert
				 **/
				scope.$on('showSpeeding', function(event, data) {
					scope.showPause = false;
					scope.showResume = false;
					scope.pause = false;
					scope.resume = false;
					if(scope.play) {
						$interval.cancel(scope.play);
					}
					var mapp = new google.maps.Map(document.getElementById("map-track"), mapOptions);
					var path = [];
					var bound = [];
					var info = [];
					var c = 'red';
					var polyline = new google.maps.Polyline({
						strokeWeight: 6
					});
					data.map(function(e, i) {
						path.push({
							lat: parseFloat(e.mapWeiDu),
							lng: parseFloat(e.mapJingDu)
						});
						bound.push({
							lat: parseFloat(e.mapWeiDu),
							lng: parseFloat(e.mapJingDu)
						});
						info.push(e);
						if(data[i + 1]) {
							path.push({
								lat: parseFloat(data[i + 1].mapWeiDu),
								lng: parseFloat(data[i + 1].mapJingDu)
							});
							bound.push({
								lat: parseFloat(data[i + 1].mapWeiDu),
								lng: parseFloat(data[i + 1].mapJingDu)
							});
							info.push(data[i + 1]);
							drawSpeedingPolyline(path, mapp, info);
						}
						path = [];
						info = [];
					});
					makeBoundary(bound, mapp);
				});

				/**
				 * Show location of ADAS alert
				 **/
				scope.$on('showAdas', function(event, data) {
					scope.showPause = false;
					scope.showResume = false;
					scope.pause = false;
					scope.resume = false;
					if(scope.play) {
						$interval.cancel(scope.play);
					}
					if(data) {
						if(!(data.weiDu && data.jingDu)) {
							swal({
								title: "Warning",
								text: "GPS Invalid",
								type: "info",
								confirmButtonColor: '#d33',
								confirmButtonText: 'OK'
							});
						} else {
							var coordinate = utility.getGPS(data.weiDu, data.jingDu);
							var mapp = new google.maps.Map(document.getElementById("map-track"), mapOptions);
							mapp.setZoom(15);
							var vehicle = {
								path: vehicles.alert,
								fillColor: 'red',
								fillOpacity: 1,
								scale: 0.1,
								strokeWeight: 1,
								anchor: new google.maps.Point(185, 200)
							};
							marker = new google.maps.Marker({
								position: new google.maps.LatLng(coordinate),
								icon: vehicle,
								map: mapp
							});
							mapp.setCenter(coordinate);
							var infowindow = new google.maps.InfoWindow();
							var content = '<div class="row" style="color:black;">' +
								'<p align=center><b><font color="red" size=5px>' + data.event + '</font></b></p>' +
								'<b>Time: </b>' + new Date(data.armTimeStr).toLocaleString() +
								'</br><b>Speed: </b>' + data.speed +
								'</br><b>location: </b>' + data.position +
								' </div>';
							infowindow.setContent(content);
							infowindow.open(map, marker);
						}
					}

				});

				/**
				 * Show location of gSensor alert
				 **/
				scope.$on('showGSensor', function(event, data) {
					scope.showPause = false;
					scope.showResume = false;
					scope.pause = false;
					scope.resume = false;
					if(scope.play) {
						$interval.cancel(scope.play);
					}
					if(data) {
						if(!(data.weiDu && data.jingDu)) {
							swal({
								title: "Warning",
								text: "GPS Invalid",
								type: "info",
								confirmButtonColor: '#d33',
								confirmButtonText: 'OK'
							});
						} else {
							var coordinate = utility.getGPS(data.weiDu, data.jingDu);
							var mapp = new google.maps.Map(document.getElementById("map-track"), mapOptions);
							mapp.setZoom(15);
							var vehicle = {
								path: vehicles.alert,
								fillColor: 'red',
								fillOpacity: 1,
								scale: 0.1,
								strokeWeight: 1,
								anchor: new google.maps.Point(185, 200)
							};
							marker = new google.maps.Marker({
								position: new google.maps.LatLng(coordinate),
								icon: vehicle,
								map: mapp
							});
							mapp.setCenter(coordinate);
							var infowindow = new google.maps.InfoWindow();
							var content = '<div class="row" style="color:black;">' +
								'<p align=center><b><font color="red" size=5px>' + data.event + '</font></b></p>' +
								'<b>Time: </b>' + new Date(data.armTimeStr).toLocaleString() +
								'</br><b>Speed: </b>' + data.speed +
								'</br><b>location: </b>' + data.position +
								' </div>';
							infowindow.setContent(content);
							infowindow.open(map, marker);
						}
					}

				});

				/**
				 * Make map boundary to contain all the marker
				 **/
				function makeBoundary(routes, map) {
					bounds = new google.maps.LatLngBounds();
					if(routes.length > 1) {
						for(var i = 0; i < routes.length; i++) {
							bounds.extend(new google.maps.LatLng(routes[i].lat, routes[i].lng));
						}
					} else {
						bounds.extend(new google.maps.LatLng(routes[0].lat, routes[0].lng));
					}
					map.fitBounds(bounds);
				}

				/**
				 * use google map snap to road api to make smooth path
				 **/
				function runSnapToRoad(path, map, color) {
					var pathValues = [];
					if(path.length <= 100) {
						for(i = 0; i < path.length; i++) {
							pathValues.push([path[i].mapWeiDu, path[i].mapJingDu]);
						}
						var v = pathValues.join('|');
						$.get('https://roads.googleapis.com/v1/snapToRoads', {
							interpolate: true,
							key: apiKey,
							path: v
						}, function(data) {
							console.log(path);
							console.log(data);
							data.snappedPoints.map(function(elem, i) {
								if(elem.originalIndex != null) {
									elem.gpsTime = path[elem.originalIndex].gpsTime;
									elem.speed = path[elem.originalIndex].speed;
									elem.huangXiang = path[elem.originalIndex].huangXiang;
									elem.position = path[elem.originalIndex].position;
									elem.mapWeiDu = elem.location.latitude;
									elem.mapJingDu = elem.location.longitude;
								} else {
									elem.gpsTime = data.snappedPoints[i - 1].gpsTime;
									elem.speed = data.snappedPoints[i - 1].speed;
									elem.huangXiang = data.snappedPoints[i - 1].huangXiang;
									elem.position = data.snappedPoints[i - 1].position;
									elem.mapWeiDu = elem.location.latitude;
									elem.mapJingDu = elem.location.longitude;
								}
							});
							console.log(data.snappedPoints);
							drawRoutes(data.snappedPoints, map);
							var index = 0;
							var marker = marker = new google.maps.Marker({
								// position:new google.maps.LatLng(coordinate),
								icon: vehicle,
								map: map
							});
							var infowindow = new google.maps.InfoWindow();
							$interval(function() {
								vehicle.rotation = data.snappedPoints[index].huangXiang - 180;
								marker.setIcon(vehicle);
								marker.setPosition(new google.maps.LatLng(data.snappedPoints[index].mapWeiDu, data.snappedPoints[index].mapJingDu));
								if(!map.getBounds().contains(marker.getPosition())) {
									map.panTo(new google.maps.LatLng(data.snappedPoints[index].mapWeiDu, data.snappedPoints[index].mapJingDu));
								}
								var content = '<div class="row" style="color:black;"><b>Time: </b>' + data.snappedPoints[index].gpsTime + ' <b>Speed: </b>' + utility.getSpeed(data.snappedPoints[index].speed) + ' </div>';
								infowindow.setContent(content);
								infowindow.open(map, marker);
								index++;
							}, 100, data.snappedPoints.length, true, index);
							// processSnapToRoadResponse(data);
							// drawSnappedPolyline(map, color);
						});
					} else {
						var i, j, temparray, chunk = 99;
						for(i = 0, j = path.length; i < j; i += chunk) {
							temparray = path.slice(i, i + chunk);
							var pathValues = [];
							for(k = 0; k < temparray.length; k++) {
								pathValues.push([temparray[k].lat, temparray[k].lng]);
							}
							var v = pathValues.join('|');
							$.get('https://roads.googleapis.com/v1/snapToRoads', {
								interpolate: true,
								key: apiKey,
								path: v
							}, function(data) {
								processSnapToRoadResponse(data);
								drawSnappedPolyline(map);
							});
						}
					}
				}

				/**
				 * Get lat and lng from snapped point
				 **/
				function processSnapToRoadResponse(data) {
					snappedCoordinates = [];
					placeIdArray = [];

					for(var i = 0; i < data.snappedPoints.length; i++) {
						var latlng = new google.maps.LatLng(data.snappedPoints[i].location.latitude, data.snappedPoints[i].location.longitude);
						snappedCoordinates.push(latlng);
					}
				}

				/**
				 * Draw snaaped Polyline
				 **/
				function drawSnappedPolyline(map, color) {
					if(color == null) color = 'green';
					var snappedPolyline = new google.maps.Polyline({
						path: snappedCoordinates,
						strokeColor: color,
						strokeWeight: 4
					});
					snappedPolyline.setMap(map);
				}

				/**
				 * Draw Polyline
				 **/
				function drawPolyline(path, map) {
					var polyline = new google.maps.Polyline({
						path: path,
						strokeColor: 'green',
						strokeWeight: 6
					});
					polyline.setMap(map);
				}

				/**
				 * Draw Speeding Polyline
				 **/
				function drawSpeedingPolyline(path, map, info) {
					var c = 'red';
					var polyline = new google.maps.Polyline({
						path: path,
						strokeColor: c,
						strokeWeight: 6
					});
					if(info.length > 1) {
						// var infowindow = new google.maps.InfoWindow({pixelOffset: new google.maps.Size(10,10)});
						var infowindow = new google.maps.InfoWindow();
						// var start = info[0].gpsTime + ' ' + info[0].position;
						// var end = info[info.length-1].gpsTime + ' ' + info[info.length-1].position;
						var topSpeed = Math.max.apply(Math, info.map(function(item) {
							return item.speed
						}));
						var speedLimit = info[0].speedLimit;
						var duration = utility.calculateDuration(info[0].gpsTime, info[info.length - 1].gpsTime);
//						var lat = parseFloat(info[info.length - 1].mapJingDu);
//						var lng = parseFloat(info[info.length - 1].mapWeiDu);
//						var coordinate = info[info.length - 1].mapJingDu + ", " + info[info.length - 1].mapWeiDu;

						var content = '<div class="row" style="color:black;">' +
							'<p align=center><b><font color="red" size=5px>Speed Violation</font></b></p>' +
							'<b>Start: </b>' + new Date(info[0].gpsTime).toLocaleString() +
							'</br><b>End: </b>' + new Date(info[info.length - 1].gpsTime).toLocaleString() +
//							'</br><b>Location: </b>' + scope.coordinate +
							'</br><b>Top Speed: </b>' + utility.getSpeed(topSpeed) +
							'</br><b>Speed Limit: </b>' + utility.getSpeedLimit(speedLimit) +
							'</br><b>Duration: </b>' + duration +
							' </div>';
						if(topSpeed / 10 - speedLimit <= 10) {
							c = 'orange';
							polyline.setOptions({
								strokeColor: c
							});
						}
						polyline.setMap(map);
						google.maps.event.addListener(polyline, 'mouseover', function(event) {
							polyline.setOptions({
								strokeColor: '#F5D3C0'
							});
							infowindow.setContent(content);
							infowindow.setPosition(path[0]);
							// infowindow.setPosition(event.latLng);
							infowindow.open(map, polyline);
						});

						google.maps.event.addListener(polyline, 'mouseout', function(event) {
							polyline.setOptions({
								strokeColor: c
							});
							infowindow.close();
						});
					}
				}

				/**
				 * Add point to path and make a new path--add points between 2 points base on length
				 **/
				function makePath(data) {
					var path = [];
					path.push({
						lat: data[0].mapWeiDu,
						lng: data[0].mapJingDu,
						time: new Date(data[0].gpsTime).toLocaleString(),
						speed: utility.getSpeed(data[0].speed),
						speedLimit: utility.getSpeedLimit(data[0].speedLimit),
						huangXiang: data[0].huangXiang
					});
					for(var i = 0; i < data.length - 1; i++) {
						var latDif = parseFloat(data[i + 1].mapWeiDu) - parseFloat(data[i].mapWeiDu);
						var lngDif = parseFloat(data[i + 1].mapJingDu) - parseFloat(data[i].mapJingDu);
						var distance = Math.hypot(latDif, lngDif);
						var noOfSeg = Math.round(distance / 0.0005);
						var lat = parseFloat(data[i].mapWeiDu);
						var lng = parseFloat(data[i].mapJingDu);
						if(noOfSeg > 1) {
							var smallLatSeg = latDif / noOfSeg;
							var smallLngSeg = lngDif / noOfSeg;
							for(var j = 0; j < noOfSeg; j++) {
								lat = lat + smallLatSeg;
								lng = lng + smallLngSeg;
								path.push({
									lat: lat,
									lng: lng,
									time: new Date(data[i].gpsTime).toLocaleString(),
									speed: utility.getSpeed(data[i].speed),
									speedLimit: utility.getSpeedLimit(data[i].speedLimit),
									huangXiang: data[i].huangXiang
								});
							}
						}
						path.push({
							lat: data[i + 1].mapWeiDu,
							lng: data[i + 1].mapJingDu,
							time: new Date(data[i + 1].gpsTime).toLocaleString(),
							speed: utility.getSpeed(data[i + 1].speed),
							speedLimit: utility.getSpeedLimit(data[i + 1].speedLimit),
							huangXiang: data[i + 1].huangXiang
						});
					}
					return path;
				}

				/**
				 * Make marker move on the map
				 **/
				function moveVehicleOnPath(path, vehicle, times, index, infowindow, map, s) {
					var speed = s || 100;
					if(path.length >= 400) {
						speed = 41;
					} else if(path.length >= 200 && path.length < 400) {
						speed = 100;
					} else {
						speed = 150;
					}
					console.log(path.length);
					if(scope.play) {
						$interval.cancel(scope.play);
					}
					scope.play = $interval(function() {
						if(scope.pause) {
							console.log('pause');
							scope.showPause = false;
							scope.showResume = true;
							var resumeDetails = {
								'index': index,
								'routes': path,
								'vehicle': vehicle,
								'times': times,
								'index': index,
								'infowindow': infowindow,
								'map': map
							};
							$interval.cancel(scope.smallSeg);
							$interval.cancel(scope.play);
							scope.$broadcast('resumeDetails', resumeDetails);
						}
						vehicle.rotation = path[index].huangXiang - 180;
						marker.setIcon(vehicle);
						marker.setPosition(new google.maps.LatLng(path[index].lat, path[index].lng));
						if(!map.getBounds().contains(marker.getPosition())) {
							map.panTo(new google.maps.LatLng(path[index].lat, path[index].lng));
						}
						var content = '<div class="row" style="color:black;"><b>Time: </b>' + path[index].time + ' <b>Speed: </b>' + path[index].speed  + ' <b>Speed Limit: </b>'+ path[index].speedLimit + ' </div>';
						infowindow.setContent(content);
						infowindow.open(map, marker);
						index++;
					}, speed, times, true, index);
					scope.play.then(function() {
						scope.button_clicked = false;
						infowindow.close();
						scope.showPause = false;
						scope.showResume = false;
					});
				}

				/**
				 * Draw speeding lines(client side)
				 **/
				function drawRoutes(routes, map) {
					var routes = routes.filter(function(e) {
						return(e.mapWeiDu && e.mapJingDu);
					});
					var pathValues = [];
					if(routes.length < 100 && routes.length > 1) {
						for(var i = 0; i < routes.length; i++) {
							pathValues.push([routes[i].mapWeiDu, routes[i].mapJingDu]);
						}
						var v = pathValues.join('|');
						$.get('https://roads.googleapis.com/v1/speedLimits', {
							key: apiKey,
							path: v
						}, function(data) {
							var speedingPoints = [];
							data.snappedPoints.map(function(elem) {
								for(var i = 0; i < data.speedLimits.length; i++) {
									if(data.speedLimits[i].placeId === elem.placeId) {
										elem.speedLimit = data.speedLimits[i].speedLimit;
										break;
									} else {
										if(i > 1) {
											elem.speedLimit = data.speedLimits[i - 1].speedLimit;
										}
									}
								}
							});

							var temp = [];
							var info = [];
							var path = [];
							routes.map(function(elem, index) {
								for(var i = 0; i < data.snappedPoints.length; i++) {
									if(index == data.snappedPoints[i].originalIndex) {
										if((elem.speed / 10) > data.snappedPoints[i].speedLimit) {
											elem.speeding = true;
											elem.speedLimit = data.snappedPoints[i].speedLimit;
											elem.overSpeed = (elem.speed / 10) - elem.speedLimit;
										} else {
											elem.speedLimit = data.snappedPoints[i].speedLimit;
											elem.speeding = false;
										}
									}
								}
							});

							routes.map(function(e, i) {
								if(e.speeding) {
									temp.push({
										lat: parseFloat(e.mapWeiDu),
										lng: parseFloat(e.mapJingDu)
									});
									info.push(routes[i]);
									if(routes[i + 1]) {
										temp.push({
											lat: parseFloat(routes[i + 1].mapWeiDu),
											lng: parseFloat(routes[i + 1].mapJingDu)
										});
										info.push(routes[i + 1]);
										drawSpeedingPolyline(temp, map, info);
										temp = [];
										info = [];
									}
								} else {
									path.push({
										lat: parseFloat(e.mapWeiDu),
										lng: parseFloat(e.mapJingDu)
									});
									if(routes[i + 1]) {
										path.push({
											lat: parseFloat(routes[i + 1].mapWeiDu),
											lng: parseFloat(routes[i + 1].mapJingDu)
										});
									}
									drawPolyline(path, map);
									path = [];
								}
							});
						});
					} else {
						var i, j, temparray = [],
							chunk = 100;
						for(i = 0, j = routes.length; i < j; i += chunk) {
							temparray.push(routes.slice(i, i + chunk));
						}
						var path = [];
						temparray.map(function(e) {
							var pathValues = [];
							for(var i = 0; i < e.length; i++) {
								pathValues.push([e[i].mapWeiDu, e[i].mapJingDu]);
							}
							path.push(pathValues);
						});
						var promise = [];
						path.map(function(e) {
							var v = e.join('|');
							var p = $.get('https://roads.googleapis.com/v1/speedLimits', {
								key: apiKey,
								path: v
							}, function(data) {});
							promise.push(p);
						});

						$q.all(promise).then(function(results) {
							results.map(function(elem, index) {
								elem.snappedPoints.map(function(e) {
									for(var i = 0; i < elem.speedLimits.length; i++) {
										if(elem.speedLimits[i].placeId === e.placeId) {
											e.speedLimit = elem.speedLimits[i].speedLimit;
											break;
										} else {
											if(i > 1) {
												e.speedLimit = elem.speedLimits[i - 1].speedLimit;
											}
										}
									}
								});

								temparray.map(function(e, ind) {
									if(ind == index) {
										temparray[ind].map(function(el, pos) {
											for(var i = 0; i < elem.snappedPoints.length; i++) {
												if(pos == elem.snappedPoints[i].originalIndex) {
													if((el.speed / 10) > elem.snappedPoints[i].speedLimit) {
														el.speeding = true;
														el.speedLimit = elem.snappedPoints[i].speedLimit;
														el.overSpeed = (el.speed / 10) - el.speedLimit;
													} else {
														el.speedLimit = elem.snappedPoints[i].speedLimit;
														el.speeding = false;
													}
												}
											}
										});
									}
								});
							});

							var temp = [];
							var info = [];
							var path = [];
							temparray.map(function(elem, index) {
								elem.map(function(e, i) {
									if(e.speeding) {
										temp.push({
											lat: parseFloat(e.mapWeiDu),
											lng: parseFloat(e.mapJingDu)
										});
										info.push(e);
										if(elem[i + 1]) {
											temp.push({
												lat: parseFloat(elem[i + 1].mapWeiDu),
												lng: parseFloat(elem[i + 1].mapJingDu)
											});
											info.push(elem[i + 1]);
											drawSpeedingPolyline(temp, map, info);
											temp = [];
											info = [];
										} else {
											if(temparray[index + 1].length > 0) {
												temp.push({
													lat: parseFloat(temparray[index + 1][0].mapWeiDu),
													lng: parseFloat(temparray[index + 1][0].mapJingDu)
												});
												info.push(temparray[index + 1][0]);
												drawSpeedingPolyline(temp, map, info);
												temp = [];
												info = [];
											}
										}
									} else {
										path.push({
											lat: parseFloat(e.mapWeiDu),
											lng: parseFloat(e.mapJingDu)
										});
										if(elem[i + 1]) {
											path.push({
												lat: parseFloat(elem[i + 1].mapWeiDu),
												lng: parseFloat(elem[i + 1].mapJingDu)
											});
										} else {
											if(temparray[index + 1].length > 0) {
												path.push({
													lat: parseFloat(temparray[index + 1][0].mapWeiDu),
													lng: parseFloat(temparray[index + 1][0].mapJingDu)
												});
											}
										}
										drawPolyline(path, map);
										path = [];
									}
								});
							});
						});
					}
				}

				/**
				 * Place alert icons for gsensor on map
				 **/
				function placeGAlerts(data, map) {
					var showAlert;
					console.log(scope.gAlerts);
					scope.gAlerts.map(function(elem) {
						if(elem.armTime >= data[0].trackTime && elem.armTime <= data[data.length - 1].trackTime) {
							var lat = elem.weiDu / 1000000;
							var lng = elem.jingDu / 1000000;
							showAlert = new google.maps.Marker({
								position: new google.maps.LatLng(lat, lng),
								icon: alert,
								map: map
							});
							var infowindow = new google.maps.InfoWindow();
							(function(showAlert, elem) {
								google.maps.event.addListener(showAlert, "mouseover", function(e) {
									var content = '<div class="row" style="color:black;">' +
										'<p align=center><b><font color="red" size=5px>' + elem.event + '</font></b></p>' +
										'<b>Time: </b>' + new Date(elem.armTimeStr).toLocaleString() +
										'</br><b>Speed: </b>' + elem.speed +
										'</br><b>location: </b>' + elem.position +
										' </div>';
									infowindow.setContent(content);
									infowindow.open(map, showAlert);
								});
								google.maps.event.addListener(showAlert, 'mouseout', function() {
									infowindow.close();
								});
							})(showAlert, elem);
						}
					});
				}

				/**
				 * Place alert icons for adas on map
				 **/
				function placeAdasAlerts(data, map) {
					var showAlert;
					scope.adasAlerts.map(function(elem) {
						if(elem.armTime >= data[0].trackTime && elem.armTime <= data[data.length - 1].trackTime) {
							var lat = elem.weiDu / 1000000;
							var lng = elem.jingDu / 1000000;
							showAlert = new google.maps.Marker({
								position: new google.maps.LatLng(lat, lng),
								icon: alert,
								map: map
							});
							var infowindow = new google.maps.InfoWindow();
							(function(showAlert, elem) {
								google.maps.event.addListener(showAlert, "mouseover", function(e) {
									var content = '<div class="row" style="color:black;">' +
										'<p align=center><b><font color="red" size=5px>' + elem.event + '</font></b></p>' +
										'<b>Time: </b>' + new Date(elem.armTimeStr).toLocaleString() +
										'</br><b>Speed: </b>' + elem.speed +
										'</br><b>location: </b>' + elem.position +
										' </div>';
									infowindow.setContent(content);
									infowindow.open(map, showAlert);
								});
								google.maps.event.addListener(showAlert, 'mouseout', function() {
									infowindow.close();
								});
							})(showAlert, elem);
						}
					});
				}

				/**
				 * Place parkingPoints on map
				 **/
				function placeParking(routes, map) {
					var parkingPoints = [];
					var time = 0;
					routes.map(function(elem, i) {
						if(elem.parkTime > 180) {
							if(routes[i + 1]) {
								if(routes[i + 1].parkTime <= 180) {
									parkingPoints.push(elem);
								}
							}
						}
					});
					// console.log(routes);
					// console.log('parking', parkingPoints);
				}
			}
		};
	}]);
