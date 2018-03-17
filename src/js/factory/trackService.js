angular
	.module('PVision')
	.constant('apiKey', 'AIzaSyDANsEavAQS9nwX9baymNwCxnWmjZh4gHQ')
	.factory('trackService', ['vehicleInfoServices', '$q', '$localStorage', 'Host', 'apiKey', trackService]);

function trackService(vehicleInfoServices, $q, $localStorage, Host, apiKey) {
	var service = {
		getSpeedAlerts: getSpeedAlerts,
	};

	function getSpeedLimits(temparray) {
		var promises = [];
		temparray.map(function(e) {
			var pathValues = [];
			for(var i = 0; i < e.length; i++) {
				pathValues.push([e[i].mapWeiDu, e[i].mapJingDu]);
			}
			var v = pathValues.join('|');
			var p = $.get('https://roads.googleapis.com/v1/speedLimits', {
				key: apiKey,
				path: v
			});
			var deferred = $q.defer();
			deferred.resolve(p);
			promises.push(deferred.promise);
		});

		return $q.all(promises);
	}

	function getSpeedAlerts(result) {

		var finalResult = [];

		var routes = result.filter(function(e) {
			return(e.mapWeiDu && e.mapJingDu);
		});

		var i, j, temparray = [],
			chunk = 100;

		for(i = 0, j = routes.length; i < j; i += chunk) {
			temparray.push(routes.slice(i, i + chunk));
		}

		return getSpeedLimits(temparray).then(function(response) {
//			console.log('限速返回的结果', response.length + " * 100");

			var speedingPromise = [];

			response.map(function(elem, index) {
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

				var tempSpeeding = [];

				temparray.map(function(e, ind) {
					if(ind == index) {
						e.map(function(el, pos) {

							for(var i = 0; i < elem.snappedPoints.length; i++) {
								if(pos == elem.snappedPoints[i].originalIndex) {
									if((el.speed / 10) > elem.snappedPoints[i].speedLimit) {
										el.speeding = true;
										el.speedLimit = elem.snappedPoints[i].speedLimit;
										el.overSpeed = (el.speed / 10) - el.speedLimit;
										tempSpeeding.push(el);
										if(e[pos + 1]) {
											tempSpeeding.push(e[pos + 1]);
										}
									} else {
										el.speeding = false;
										//get final speeding alert result
										el.speedLimit = elem.snappedPoints[i].speedLimit;
										if(tempSpeeding.length > 1) {
											var deferred = $q.defer();
											deferred.resolve(tempSpeeding);
											finalResult.push(deferred.promise);
										}
										tempSpeeding = [];
									}
								}
							}
						});
					}
				});
			});
			return $q.all(finalResult);
		});
	}

	return service;
}
