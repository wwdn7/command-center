var myApp = angular.module("PVision");

//Getting our Maps Element Directive
myApp.directive("alertMap", ["vehicles", "valTransfer", function(vehicles, valTransfer) {
	return {
		restrict: 'E', //Element Type
		template: '<div></div>', //Defining myApp div
		replace: true, //Allowing replacing
		link: function(scope, element, attributes) {
			var zuobiao = valTransfer.getter();
			//Initializing Coordinates
			var vehicle = {
				path: vehicles.alert,
				fillColor: 'red',
				fillOpacity: 1,
				scale: 0.1,
				strokeWeight: 1,
				anchor: new google.maps.Point(185, 200)
			};
			var coordinate = new google.maps.LatLng(zuobiao.lat, zuobiao.lng);
			var mapOptions = {
				center: coordinate, //Center of our map based on LatLong Coordinates
				zoom: 15, //How much we want to initialize our zoom in the map
				mapTypeId: google.maps.MapTypeId.ROADMAP, //Map type, you can check them in APIs documentation
				fullscreenControl: false // allow to view in full screen.
			};

			//Attaching our features & options to the map
			var map = new google.maps.Map(document.getElementById('alert-map'), mapOptions);
			var marker = new google.maps.Marker({
				position: coordinate,
				icon: vehicle,
				map: map
			});

			marker.setMap(map); //Setting the marker up
			//   var sv = new google.maps.StreetViewService();
			//   var panorama = new google.maps.StreetViewPanorama(document.getElementById('alert-street'));
			//   sv.getPanorama({location: coordinate, radius: 50}, processSVData);
			//
			//   function processSVData(data, status) {
			//     console.log(status);
			//     console.log(data);
			//     if (status === 'OK') {
			//       panorama.setPano(data.location.pano);
			//       panorama.setPov({
			//         heading: 0,
			//         pitch: 0
			//       });
			//       panorama.setVisible(true);
			//
			//     } else {
			//       console.error('Street View data not found for this location.');
			//     }
			//   }
		}
	};
}]);
