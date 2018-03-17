angular
	.module('PVision')
	.factory('utility', ['shaBiChe', '$cookieStore', utility]);

function utility(shaBiChe, $cookieStore) {
	var service = {
		calculateDuration: calculateDuration,
		returnDuration: returnDuration,
		calculate: calculate,
		getSpeed: getSpeed,
		getSpeedLimit: getSpeedLimit,
		getOverSpeed: getOverSpeed,
		getLicheng: getLicheng,
		getLucheng: getLucheng,
		getGSensorAlarmContent: getGSensorAlarmContent,
		getAdasAlarmContent: getAdasAlarmContent,
		getGPS: getGPS,
		location: location
	};
	return service;

	/**
	 * calculate differnce between 2 times and translate to readable hours, minutes and seconds
	 **/
	function calculateDuration(start, end) {
		var s = new Date(start);
		var e = new Date(end);
		var diff = (e.getTime() - s.getTime()) / 1000;
		return calculate(diff);
	}
	
	function returnDuration(start, end) {
		var s = new Date(start);
		var e = new Date(end);
		var diff = (e.getTime() - s.getTime()) / 1000;
		return diff;
	}

	/**
	 * convert seconds to time
	 **/
	function calculate(time) {
		var hour = ((time - time % 3600) / 3600);
		var mins = (parseInt((time % 3600) / 60));
		var secs = ((time % 3600) % 60);
		var message = '';
		if(secs != 0){
			message = secs + ' seconds';
	  }
		if(mins != 0) {
			message = mins + ' minutes ' + message;
		}
		if(hour != 0) {
			message = hour + ' hour ' + message
		}

		return message;
	}

	/**
	 * Convert speed from km to miles
	 **/
	function getSpeed(speed) {
		if($cookieStore.get('speedUnit') == "Miles") {
			return((speed / 10) * 0.62137).toFixed(0) + " mph";
		} else {
			return (speed / 10).toFixed(0) + " km/h";
		}
	}

	/**
	 * Convert speed limit from km to miles
	 **/
	function getSpeedLimit(speed) {
		if(speed == null){
			return "";
		}
		if($cookieStore.get('speedUnit') == "Miles") {
			return(speed * 0.62137).toFixed(0) + " mph";
		} else {
			return speed.toFixed(0) + " km/h";
		}
	}

	/**
	 * Get Over Speed
	**/
	function getOverSpeed(speed, speedLimit){
		// console.log(speed, speedLimit);
		if($cookieStore.get('speedUnit') == "Miles") {
			return ((speed / 10 - speedLimit) * 0.62137).toFixed(0) + " mph";
		} else {
			return (speed / 10 - speedLimit).toFixed(0) + " km/h";
		}
	}

	/**
	 * Convert lucheng from km to miles
	 **/
	function getLucheng(start, end) {
		if($cookieStore.get('speedUnit') == "Miles") {
			return(((end - start) / 1000) * 0.62137).toFixed(3) + " Miles";
		} else {
			return((end - start) / 1000).toFixed(3) + " KM";
		}
	}

	/**
	 *
	 **/
	function getLicheng(licheng) {
		if($cookieStore.get('speedUnit') == "Miles") {
			return((licheng / 1000) * 0.62137).toFixed(3) + " Miles";
		} else {
			return(licheng / 1000).toFixed(3) + " KM";
		}
	}

	/**
	 * translate adas alarm to english words.
	 **/
	function getAdasAlarmContent(armInfo) {
		var content = "";
		if(armInfo !== null) {
			switch(armInfo) {
				case 0:
					content = "No Fatigue Event";
					break;
				case 1:
					content = "Level 1 Fatigue Event";
					break;
				case 2:
					content = "Level 2 Fatigue Event";
					break;
				case 3:
					content = "Level 3 Fatigue Event";
					break;
				case 4:
					content = "Concentration Alarm";
					break;
				case 5:
					content = "On the phone";
					break;
				case 6:
					content = "Smoking";
					break;
				case 7:
					content = "Looking around";
					break;
				case 8:
					content = "Yawning";
					break;
				case 80:
					content = "Chatting";
					break;
				case 81:
					content = "Head Down";
					break;
				case 82:
					content = "Eye closed";
					break;
				case 83:
					content = "Front Vehicle Collision Warning Alarm";
					break;
				case 84:
					content = "Left Lane Departure Alarm";
					break;
				case 85:
					content = "Right Lane Departure Alarm";
					break;
				case 86:
					content = "Pedestrian collision";
					break;
				case 87:
					content = "Speeding";
					break;
				case 88:
					content = "Ranging forward warning";
					break;
				case 89:
					content = "Urban Area Front Vehicle Collision Warning Alarm";
					break;
				case 100:
					content = "Overtime Driving";
					break;
				case 170:
					content = "Missing Driver";
					break;
				default:
					content = "Who the fcuk knows what happend";
					break;
			}
		}
		return content;
	}

	/**
	 * Translate lat and lng to english address
	 **/
	function getGPS(weiDu, jingDu) {
		return {
			lat: weiDu / 1000000,
			lng: jingDu / 1000000
		};
	}

	//location decode
	function location(value, callback) {
		//location decode
		var geocoder = new google.maps.Geocoder;
		var coordinate = value;
		geocoder.geocode({
			'location': coordinate
		}, function(results, status) {
			//				console.log(results);
			if(status === 'OK') {
				if(results[0]) {
					const formatKeywordOne = "route";
					const formatKeywordTwo = "street_address";
					const formatKeywordThree = "administrative_area_level_3";
					results.some(function(val, i) {
						return val.types.some(function(type) {
							if(type == formatKeywordOne) {
								callback(results[i].formatted_address);
								return type == formatKeywordOne;
							} else if(type == formatKeywordTwo) {
								callback(results[i].formatted_address);
								return type == formatKeywordTwo;
							} else if(type == formatKeywordThree) {
								callback(results[i].formatted_address);
								return type == formatKeywordThree;
							} else {
								return callback(results[0].formatted_address);
							};
						});
					});
				} else {
					callback("Not Available");
					console.log("no result found");
				}
			} else {
				callback("Not Available");
				console.log('Geocoder failed due to: ' + status);
			}
		});
	};

	/**
	 * translate g-sensor alarm to english
	 **/
	function getGSensorAlarmContent(id, armInfo) {
		var content = "";
		if(armInfo !== null) {
			if(((armInfo >> 0) & 0x1) > 0) {
				content = 'Harsh Steering';
				if(shaBiChe.shabiyihao.indexOf(id) !== -1) {
					content = "Harsh Steering";
				}
				if(shaBiChe.shabierhao.indexOf(id) !== -1) {
					content = "Speed Bump";
				}
				if(shaBiChe.shabisanhao.indexOf(id) !== -1) {
					content = "Speed Bump";
				}
				if(shaBiChe.shabisihao.indexOf(id) !== -1) {
					content = "Harsh Braking";
				}
				if(shaBiChe.shabiwuhao.indexOf(id) !== -1) {
					content = "Harsh Braking";
				}
			}
			if(((armInfo >> 1) & 0x1) > 0) {
				content = 'Speed Bump';
				if(shaBiChe.shabiyihao.indexOf(id) !== -1) {
					content = "Harsh Braking";
				}
				if(shaBiChe.shabierhao.indexOf(id) !== -1) {
					content = "Harsh Steering";
				}
				if(shaBiChe.shabisanhao.indexOf(id) !== -1) {
					content = "Harsh Braking";
				}
				if(shaBiChe.shabisihao.indexOf(id) !== -1) {
					content = "Harsh Steering";
				}
				if(shaBiChe.shabiwuhao.indexOf(id) !== -1) {
					content = "Speed Bump";
				}
			}
			if(((armInfo >> 2) & 0x1) > 0) {
				content = 'Harsh Braking';
				if(shaBiChe.shabiyihao.indexOf(id) !== -1) {
					content = "Speed Bump";
				}
				if(shaBiChe.shabierhao.indexOf(id) !== -1) {
					content = "Harsh Braking";
				}
				if(shaBiChe.shabisanhao.indexOf(id) !== -1) {
				//	content = "Harsh Turing";
                    content = "Harsh Steering";
				}
				if(shaBiChe.shabisihao.indexOf(id) !== -1) {
					content = "Speed Bump";
				}
				if(shaBiChe.shabiwuhao.indexOf(id) !== -1) {
					content = "Harsh Steering";
				}
			}
		}
		return content;
	}

	/**
	 * Calculate parking Time
	 **/
	function calculateParkingTime(data) {
		var time = 0;
		var parking = [];
		for(var i = 0; i < data.length - 1; i++) {
			if(data[i].speed == 0) {
				if(data[i + 1].speed == 0) {
					time = time + (data[i + 1].trackTime - data[i].trackTime);
				} else {
					if(time >= 180000) {
						parking.push({
							'time': data[i].gpsTime,
							'parkTime': time,
							'lat': data[i].lat,
							'lng': data[i].lng
						});
					}
					if(data[i + 1].trackTime - data[i].trackTime >= 180000) {
						parking.push({
							'time': data[i].gpsTime,
							'parkTime': time,
							'lat': data[i].lat,
							'lng': data[i].lng
						});
					}
					time = 0;
				}
			}
		}
		return parking;
	}
}
