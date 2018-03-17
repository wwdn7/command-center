angular
	.module('PVision')
	.factory('vehiStatus', ["$rootScope", "$localStorage", "shaBiChe", "$cookieStore", vehiStatus]);

function vehiStatus($rootScope, $localStorage, shaBiChe, $cookieStore) {
	var vehicles = {
		location: location,
		shortLocation: shortLocation,
		speed: speed,
		distance: distance,
		direction: direction,
		parkTime: parkTime,
		online: online,
		network: network,
		gps: gps,
		acc: acc,
		disk1Status: disk1Status,
		disk2Status: disk2Status,
		vidloss: vidloss,
		getAlarmContent: getAlarmContent,
		getGsensorContent: getGsensorContent,
		getAdasContent: getAdasContent,
		getAlarmType: getAlarmType,
		timeAgo: timeAgo,
		compareUpdate: compareUpdate
	};

	/*in case no language setting send back but has to set rootscope to pass value*/
	//		function getlanguage(){
	//			return $localStorage.systemSetting.language;
	//		}

	//		$rootScope.$watch('languageSetting', function(val){
	//			if(val){
	//				var langSet = $rootScope.languageSetting;
	//			}
	//		});

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

	//location decode	
	function shortLocation(value, callback) {
		//location decode
		var geocoder = new google.maps.Geocoder;
		var coordinate = value;
		geocoder.geocode({
			'location': coordinate
		}, function(results, status) {
			//					console.log(results);
			if(status === 'OK') {
				if(results[0]) {
					const formatKeywordOne = "locality";
					const formatKeywordTwo = "administrative_area_level_1";
					const formatKeywordThree = "neighborhood";
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

	//Speed
	function speed(speed) {
		if($cookieStore.get('speedUnit') == "Miles") {
			return((speed / 10) * 0.62137).toFixed(0) + " mph";
		} else {
			return speed / 10 + " km/h";
		}
	}

	//Distance
	function distance(licheng) {
		if($cookieStore.get('speedUnit') == "Miles") {
			return((licheng / 1000) * 0.62137).toFixed(3) + " Miles";
		} else {
			return(licheng / 1000).toFixed(3) + " KM";
		}

	}

	//Direction
	function direction(deg) {
		switch(true) {
			case(deg >= 338 || deg < 23):
				return "North";
			case(deg >= 23 && deg < 68):
				return "North-East";
			case(deg >= 68 && deg < 113):
				return "East";
			case(deg >= 113 && deg < 158):
				return "South-East";
			case(deg >= 158 && deg < 203):
				return "South";
			case(deg >= 203 && deg < 248):
				return "South-West";
			case(deg >= 248 && deg < 293):
				return "West";
			case(deg >= 293 && deg < 338):
				return "North-West";
		};
	};

	function parkTime(sec) {
		if(sec > 3600) {
			return "More than 1 hour";
		} else {
			var minute = Math.floor(sec / 60);
			return minute + " minutes";
		};
	};

	//Online
	function online(a) {
		switch(a) {
			case 0:
				return "Offline";
			case 1:
				return "Online";
		};
	};

	//network
	function network(status) {
		var network = (status >> 10) & 7;
		if(network === 0) {
			return "Sim Card Not exist"; //SIM卡不存在
		} else if(network == 1) {
			return "Bad Signal"; //3G信号差
		} else if(network == 2) {
			return "Weak"; //3G信号差
		} else if(network == 3) {
			return "Normal"; //3G信号一般
		} else if(network == 4) {
			return "Good"; //3G信号好
		} else if(network == 5) {
			return "Excellent"; //3G信号优
		} else if(network == 6) {
			return "3G Module Not Exist"; //3g模块不存在
		} else if(network == 7) {
			return "3G Module OFF"; //3G模块关闭
		}
	}

	//GPS

	function gps(status) {
		var gps = (status >> 7) & 1;
		var valid = (status >> 0) & 1;
		if(gps < 0) {
			return "Not Exist";
		} else if(valid <= 0) {
			return "GPS Invalid";
		} else {
			return "Good";
		}
	}

	//ACC
	function acc(status) {
		var acc = (status >> 1) & 1;
		if(acc > 0) {
			return "ON";
		} else {
			return "OFF";
		}
	}

	//disk 1 status
	function disk1Status(status) {
		//8、9位表示硬盘状态
		var disk1Status = (status >> 8) & 3;
		//28位表示盘符2状态	1表示有效
		//29、30位表示，硬盘2的状态		0不存在，1存在，2断电
		//				var disk2Valid = (status1>>28)&1;
		//			var disk2Status = (status>>29)&3;
		if(disk1Status === 0) {
			return "Missing";
		} else if(disk1Status == 1) {
			return "Exist";
		} else if(disk1Status == 2) {
			return "No Power";
		}

		//			if (disk2Status === 0) {
		//				return "Not Exist";
		//			} else if (disk2Status == 1){
		//				return "Exist";
		//			}else if (disk2Status == 2){
		//				return "No Power";
		//			}
	}

	//disk 2 status
	function disk2Status(status) {
		var disk2Status = (status >> 29) & 3;
		if(disk2Status === 0) {
			return "Missing";
		} else if(disk2Status == 1) {
			return "Exist";
		} else if(disk2Status == 2) {
			return "No Power";
		}
	}

	//video loss
	function vidloss(status, num, name) {
		//			var chn0 = (status>>0)&1;
		//			var chn1 = (status>>1)&1;
		//			var chn2 = (status>>2)&1;
		//			var chn3 = (status>>3)&1;
		//			var chn4 = (status>>4)&1;
		//			var chn5 = (status>>5)&1;
		//			var chn6 = (status>>6)&1;
		//			var chn7 = (status>>7)&1;
		var chns = name.split(',');
		var arr = [];
		for(var j = 0; j < num; j++) {
			if(((status >> j) & 1) == 1 && chns[j].toLowerCase() !== 'x') {
				arr.push({
					stats: "Video Lost",
					Channel: j,
					Name: chns[j]
				});
			};
		};
		return arr;

		//			var arr = [chn0, chn1, chn2, chn3, chn4, chn5, chn6, chn7];
	};

	function getAlarmContent(armType, armInfo, devIdno) {
		switch(armType) {
			case 2:
				return "Button Pressed";
				break;
			case 3:
				return getGsensorContent(devIdno, armInfo);
				break;
			case 53:
				return getGsensorContent(devIdno, armInfo);
				break;
			case 49:
				return getAdasContent(armInfo);
				break;
			case 99:
				return getAdasContent(armInfo);
				break;
			case 'hardware':
				return armInfo;
				break;
			case 'device+':
				return "";
				break;
			case 'device-':
				return "";
				break;
			case 'activate':
				return "";
				break;
			default:
				return "";
				break;
		};
	};

	function getGsensorContent(id, armInfo) {
		/*		var content = "";
				if(armInfo !== null){
					var dirInfo = [];
					if ( ((armInfo>>0)&0x1) > 0){
						dirInfo.push("X");
					};
					if ( ((armInfo>>1)&0x1) > 0){
						dirInfo.push("Y");
					};
					if ( ((armInfo>>2)&0x1) > 0){
						dirInfo.push("Z");
					};
					content = "Direction: " + dirInfo.join(",");
				};
				return content;*/
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
	};

	function getAdasContent(armInfo) {
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
					content = "Who the fuck knows what happend";
					break;
			};
		};
		return content;
	};

	function getAlarmType(type) {
		switch(type) {
			case 3:
				return "G-Sensor Alarm Start";
				break;
			case 49:
				return "ADAS Alarm Start";
				break;
			case 53:
//				return "G-Sensor Alarm End"; //
				return "G-Sensor Alarm Start";
				break;
			case 99:
				return "ADAS Alarm End";
				break;
			case 2:
				return "Panic Button Alarm";
				break;
			case 'hardware':
				return "Hardware Issue Found";
				break;
			case 'device+':
				return "New Device Added";
				break;
			case 'device-':
				return "Device Removed";
				break;
			case 'activate':
				return "successfully activated";
				break;
				//				case 3: return "G-sensor Alarm Start";
				//					break;
				//				case 4: return "Video Loss Alarm Start";
				//					break;
				//				case 5: return "Camera Blocked Alarm Start";
				//					break;
				//				case 6: return "Illegal Door Open Alarm Start";
				//					break;
				//				case 7: return "Wrong Password 3 Times Alarm Start";
				//					break;
				//				case 8: return "Illegal Ignition Alarm Start";
				//					break;
				//				case 9: return "Temperature Alarm Start";
				//					break;
				//				case 10: return "Hard Disk Error Alarm Start";
				//					break;
				//				case 11: return "Speeding Alarm Start";
				//					break;
				//				case 12: return "Lan Departure Alarm Start";
				//					break;
				//				case 13: return "Abnormal Switch Door Alarm Start";
				//					break;
				//				case 14: return "Parking Time Too Long Alarm Start";
				//					break;
				//				case 15: return "Motion Detect Alarm Start";
				//					break;
				//				case 16: return "ACC ON Alarm Start";
				//					break;
				//				case 17: return "Device Online";
				//					break;
				//				case 18: return "GPS Signal Loss Alarm Start";
				//					break;
				//				case 46: return "Fuel Alarm - Add Fuel Start";
				//					break;
				//				case 47: return "Fuel Alarm - Fuel Reduced Start";
				//					break;
				//				case 49: return "Fatigue Driving Alarm Start";
				//					break;
				//				case 51: return "Custom Alarm End";
				//					break;
				//				case 52: return "Emergency Button Alarm End";
				//					break;
				//				case 53: return "G-sensor Alarm End";
				//					break;
				//				case 54: return "Video Loss Alarm End";
				//					break;
				//				case 55: return "Camera Blocked Alarm End";
				//					break;
				//				case 56: return "Illegal Door Open Alarm End";
				//					break;
				//				case 57: return "Wrong Password 3 Times Alarm End";
				//					break;
				//				case 58: return "Illegal Ignition Alarm End";
				//					break;
			default:
				return "I am not going to tell! :)";
				break;
		};
	};

	function timeAgo(time) {
		var d = new Date(time);
		var seconds = Math.floor((new Date() - d) / 1000);

		var interval = Math.floor(seconds / 31536000);
		if(interval >= 1) {
			var month = Math.floor((seconds % 31536000) / 2592000);
			if(month == 0) {
				return interval + " years ago";
			}
			return interval + " years " + month + " month ago";
		}
		interval = Math.floor(seconds / 2592000);
		if(interval >= 1) {
			var day = Math.floor((seconds % 2592000) / 86400);
			if(day == 0) {
				return interval + " months ago";
			}
			return interval + " months " + day + " days ago";
		}
		interval = Math.floor(seconds / 86400);
		if(interval >= 1) {
			var hour = Math.floor((seconds % 86400) / 3600);
			if(hour == 0) {
				return interval + " days ago";
			}
			return interval + " days " + hour + " hour ago";
		}
		interval = Math.floor(seconds / 3600);
		if(interval >= 1) {
			var minute = Math.floor((seconds % 3600) / 60);
			if(minute == 0) {
				return interval + " hours ago";
			}
			return interval + " hours " + minute + " minutes ago";
		}
		interval = Math.floor(seconds / 60);
		if(interval >= 1) {
			var second = (seconds % 60);
			return interval + " minutes ago";
		}
		return "Just now";
	}
	
	function compareUpdate(arr1, arr2) {
		return arr1.filter(function(i) {return !(arr2.indexOf(i) > -1);});
	}

	return vehicles;
}