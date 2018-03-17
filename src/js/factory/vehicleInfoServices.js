angular
	.module('PVision')
	.factory('vehicleInfoServices', ["Host", "swal", "$sce", "$http", "$localStorage", "$q", "$state", "$rootScope", "MediaHost", vehicleInfoServices]);

function vehicleInfoServices(Host, swal, $sce, $http, $localStorage, $q, $state, $rootScope, MediaHost) {

	var vehiServices = {
		returnHttp: returnHttp,
		vehiInfo: vehiInfo,
		updateVehiInfo: updateVehiInfo,
		vehiNumber: vehiNumber,
		vehiNumberOff: vehiNumberOff,
		track: track,
		record: record,
		playRecord: playRecord,
		downloadVideo: downloadVideo,
		downloadVideoSegment: downloadVideoSegment,
		alert: alert,
		alertSuoyou: alertSuoyou,
		getLocation: getLocation,
		getAllLocation: getAllLocation,
		vehiList: vehiList,
		checkResult: checkResult,
		createPageArray: createPageArray,
		trackAlerts: trackAlerts,
		resetPassword: resetPassword,
		findDate: findDate,
		loadTimeout: loadTimeout,
		queryVehiGroup: queryVehiGroup,
		deleteVehiGroup: deleteVehiGroup,
		addVehiGroup: addVehiGroup,
		editVehiGroup: editVehiGroup,
		moveVehiGroup: moveVehiGroup,
		removeVehiGroup: removeVehiGroup,
		getip: getip,
		listAllUser: listAllUser,
		addRole: addRole,
		addUser: addUser,
		allocateAllDevice: allocateAllDevice
	}

	function returnHttp(url, params) {
		var deferred = $q.defer();
		var trustedurl = $sce.trustAsResourceUrl(url);

		$http.jsonp(trustedurl, {
			params: params
		}).then(function(response) {
			deferred.resolve(response);
		}, function(response) {
			deferred.reject(response);
		});

		return deferred.promise;
	};

	function vehiInfo(records) {
		//					console.log($localStorage.currentUser.token);
		var url = Host + "/VehicleStatusApiAction_allDeviceStatus.action";

		if(angular.isNumber(records)) {
			var params = {
				//				userAccount: $localStorage.currentUser.username,
				jsession: $localStorage.currentUser.token,
				currentPage: 1,
				pageRecords: records,
				ignoreLoadingBar: true
			};

			return returnHttp(url, params);
		} else {
			var params = {
				//				userAccount: $localStorage.currentUser.username,
				jsession: $localStorage.currentUser.token,
				//				json: page
				currentPage: 1,
				pageRecords: 10,
				ignoreLoadingBar: true
			};

			return returnHttp(url, params);
		}
	};

	function updateVehiInfo(vehi) {
		var url = Host + "/VehicleApiAction_updateVehicle.action";

		var params = {
			jsession: $localStorage.currentUser.token,
			idno: vehi.idno,
			icon: vehi.icon,
			vehicleCard: vehi.vehicleCard,
			chnCount: vehi.chnCount,
			chnName: vehi.chnName,
			ioInCount: vehi.ioInCount,
			ioInName: vehi.ioInName
		};

		return returnHttp(url, params);
	}

	function vehiNumber(devid) {

		var url = Host + "/VehicleStatusApiAction_allDeviceStatus.action";
		var params = {
			//			userAccount: $localStorage.currentUser.username,
			jsession: $localStorage.currentUser.token,
			name: devid,
			ignoreLoadingBar: true
		};

		return returnHttp(url, params);
	}

	function vehiNumberOff(devid) {
		var url = Host + "/VehicleStatusApiAction_deviceNotOnline.action";
		var params = {
			//			userAccount: $localStorage.currentUser.username,
			jsession: $localStorage.currentUser.token,
			name: devid
		};

		return returnHttp(url, params);
	}

	function track(id, start, end, total) {
		// console.log("start: " + start);
		// console.log("end: " + end);

		var url = Host + "/VehicleApiAction_queryTrackDetail.action";

		// disable the search button
		if(id) {
			angular.element(document).find('button.btn.btn-primary').prop('disabled', true);
		}
		// var searchButton = document.querySelectorAll("button.btn.btn-primary");
		// if(searchButton[0].getAttribute("disabled")) {
		//
		// }console.log(searchButton[0].getAttribute("disabled"));
		// searchButton[0].setAttribute('disabled', true);
		// console.log(searchButton[0].textContent	("disabled"));
		//console.log('test total', total);
		if(total) {
			var params = {
				jsession: $localStorage.currentUser.token,
				devIdno: id,
				distance: 0,
				begintime: start,
				endtime: end,
				//				toMap: 1,  //disable geocoding if not pass variable
				currentPage: 1,
				pageRecords: total
			};
			return returnHttp(url, params);
		} else {
			var params = {
				jsession: $localStorage.currentUser.token,
				devIdno: id,
				distance: 0,
				begintime: start,
				endtime: end,
				//				toMap: 1, //disable geocoding if not pass variable
				currentPage: 1,
				pageRecords: 10
			};
			return returnHttp(url, params);
		}
	}

	function record(id, date, begin, end, chn) {
		var url = MediaHost + "/PlaybackSearch.do?Location=1";

		if(begin > 300) {
			begin = begin - 300; //TODO time start included 
		}

		var params = {
			jsession: $localStorage.currentUser.token,
			DevIDNO: id,
			Channel: -1,
			Date: date,
			BeginSecond: begin,
			EndSecond: end,
			//			Location: 1,
			Attribute: 2,
		};
		angular.element(document).find('button.btn.btn-primary').prop('disabled', true);
		return returnHttp(url, params);
	}

	function playRecord(id, path, chn, filelen, date, begin, end) {
		var url = MediaHost + "/Playback.m3u8?Location=1";

		var params = {
			jsession: $localStorage.currentUser.token,
			DevIDNO: id,
			FileName: path,
			Channel: chn,
			FileLen: filelen,
			AlarmInfo: 0,
			FileType: 0,
			Offset: 0,
			ServerID: 0,
			Date: date,
			Begintime: begin,
			Endtime: end
		};

		return returnHttp(url, params);
	}

	function downloadVideo(data) {
		var url = Host + "/Download.down?Location=1";
		var trustedurl = $sce.trustAsResourceUrl(url);

		var params = {
			jsession: $localStorage.currentUser.token,
			DevIDNO: data.id,
			FileName: data.path,
			Channel: data.chn,
			FileLen: data.filelen,
			AlarmInfo: 0,
			FileType: 0,
			Offset: data.offset,
			ServerID: 0,
			Date: data.date,
			Begintime: data.begin,
			Endtime: data.end
		};

		return $http.get(trustedurl, {
			params: params
		});
	};

	function downloadVideoSegment(data) {
		var url = MediaHost + "/GrecDownload.grec?Location=1";

		var params = {
			jsession: $localStorage.currentUser.token,
			DevIDNO: data.id,
			FileName: data.path,
			Channel: data.chn,
			FileLen: data.filelen,
			AlarmInfo: 0,
			FileType: 0,
			Offset: data.offset,
			ServerID: 0,
			Date: data.date,
			Begintime: data.begin,
			Endtime: data.end
		};

		return $http.get(url, {
			params: params
		});
	};

	//find week info
	var thisWeekBegin = findDate().monday() + " 00:00:00";
	var thisWeekEnd = findDate().today() + " " + findDate().time();
	var lastWeekBegin = findDate().lastMonday() + " 00:00:00";
	var lastWeekEnd = findDate().lastSunday() + " 23:59:59";

	function alert(ids, type, records, isLastWeek) {
		var url = Host + "/VehicleApiAction_alarmDetail.action";
		if(isLastWeek) {
			var params = {
				jsession: $localStorage.currentUser.token,
				alarmTypeValue: type,
				devIdnos: ids,
				begintime: lastWeekBegin,
				endtime: lastWeekEnd,
				pageRecords: records,
				toMap: 1 //disable geocoding if not pass variable
			};
		} else {
			var params = {
				jsession: $localStorage.currentUser.token,
				alarmTypeValue: type,
				devIdnos: ids,
				begintime: thisWeekBegin,
				endtime: thisWeekEnd,
				pageRecords: records,
				toMap: 1 //disable geocoding if not pass variable
			};
		};
		return returnHttp(url, params);
	}

	function trackAlerts(id, start, end, type) {
		var url = Host + "/VehicleApiAction_alarmDetail.action";
		var params = {
			jsession: $localStorage.currentUser.token,
			type: "acc",
			alarmTypeValue: type,
			devIdnos: id,
			currentPage: 1,
			pageRecords: 5000,
			toMap: 1, //disable geocoding if not pass variable
			begintime: start,
			endtime: end
		};
		return returnHttp(url, params);
	}

	function findDate() {
		var findDate = {
			today: today,
			yestoday: yestoday,
			monday: monday,
			time: time,
			lastMonday: lastMonday,
			lastSunday: lastSunday
		}

		var d = new Date();

		function today() {
			return d.toISOString().split('T')[0];
		}

		function yestoday() {
			return new Date(d.getTime() - 86400000).toISOString().split('T')[0];
		}

		function monday() {
			var monday = new Date();
			monday.setDate(d.getDate() - d.getDay() + 1);
			monday = monday.toISOString().split('T')[0];
			return monday;
		}

		function time() {
			return d.toTimeString().split(' ')[0];
		}

		function lastMonday() {
			var lastMonday = new Date();
			lastMonday.setDate(d.getDate() - d.getDay() - 6);
			lastMonday = lastMonday.toISOString().split('T')[0];
			return lastMonday;
		}

		function lastSunday() {
			var lastSunday = new Date();
			lastSunday.setDate(d.getDate() - d.getDay());
			lastSunday = lastSunday.toISOString().split('T')[0];
			return lastSunday;
		}

		return findDate;
	}

	function alertSuoyou(ids, isLastWeek) {
		var url = Host + "/VehicleApiAction_alarmDetail.action";
		//		console.log(findDate().lastMonday(),findDate().lastSunday());
		if(thisWeekBegin.split('-')[1] !== thisWeekEnd.split('-')[1]) {
			console.log(thisWeekBegin.split('-')[1], thisWeekEnd.split('-')[1]);

		}

		//Init array data
		var thisWeek = {
			begin: thisWeekBegin,
			end: thisWeekEnd,
			week: "thisWeek"
		}
		var lastWeek = {
			begin: lastWeekBegin,
			end: lastWeekEnd,
			week: "lastWeek"
		}
		var gsensor = {
			type: 3,
			leiXing: "Gsensor"
		}
		var adas = {
			type: 49,
			leiXing: "ADAS"
		}

		var typeArr = [adas, gsensor];
		var timeArr = [thisWeek, lastWeek];

		var promises = [];

		if(isLastWeek) {
			//generate api request array 
			typeArr.map(function(type) {
				timeArr.map(function(time) {
					var params = {
						jsession: $localStorage.currentUser.token,
						alarmTypeValue: type.type,
						devIdnos: ids,
						begintime: time.begin,
						endtime: time.end,
						pageRecords: 1,
						toMap: 1,
						leiXing: type.leiXing,
						week: time.week,
						ignoreLoadingBar: true
					};
					promises.push(params);
				});
			});
		} else {
			//generate api request array
			typeArr.map(function(type) {
				var params = {
					jsession: $localStorage.currentUser.token,
					alarmTypeValue: type.type,
					devIdnos: ids,
					begintime: thisWeekBegin,
					endtime: thisWeekEnd,
					pageRecords: 1,
					toMap: 1,
					leiXing: type.leiXing,
					week: "thisWeek",
					ignoreLoadingBar: true
				};
				promises.push(params);
			});
		};

		var totalRecords = [];

		return promises.reduce(function(p, val, i) {
			// The initial promise object
			if(p.then === undefined) {
				p.resolve();
				p = p.promise;
			}
			return p.then(function() {
				return returnHttp(url, val).then(function(response) {
					//	    			console.log(i, response);
					totalRecords.push({
						totalRecords: response.data.pagination.totalRecords,
						leiXing: response.config.params.leiXing,
						week: response.config.params.week
					});
					return totalRecords;
				});
			});
		}, $q.when(true));
	};

	function getLocation(zuobiao) {
		var url = Host + "/VehicleApiAction_getLocation.action";

		var mapZuobiao = {};

		if(angular.isArray(zuobiao)) {
			mapZuobiao = zuobiao.reduce(function(result, coor, i) {
				if(i == 0) {
					return result;
				}
				var lat = result.lat + "," + coor.lat;
				var lng = result.lng + "," + coor.lng;
				return {
					lat: lat,
					lng: lng
				};
			}, zuobiao[0]);
		}

		//		console.log(mapZuobiao);

		var params = {
			jsession: $localStorage.currentUser.token,
			lat: mapZuobiao.lat,
			lng: mapZuobiao.lng
		};
		return returnHttp(url, params);
	}

	//TODO
	function getAllLocation(promises) {
		var url = Host + "/VehicleApiAction_getLocation.action";

		return promises.reduce(function(p, val, i) {
			// The initial promise object
			if(p.then === undefined) {
				p.resolve();
				p = p.promise;
			}
			return p.then(function() {
				return returnHttp(url, val).then(function(response) {
					console.log(response);
					return response;
				});
			});
		}, $q.when(true));
	}

	function vehiList(pagination) {
		var url = Host + "/VehicleApiAction_vehicleList.action";
		var trustedurl = $sce.trustAsResourceUrl(url);
		if(angular.isArray(pagination)) {
			var promises = [];
			angular.forEach(pagination, function(pagi) {

				var params = {
					jsession: $localStorage.currentUser.token,
					currentPage: pagi.currentPage,
					pageRecords: pagi.pageRecords
				};

				var deferred = $q.defer();

				$http.jsonp(trustedurl, params).then(function(response) {
					deferred.resolve(response);
				}, function(error) {
					deferred.reject();
				});

				promises.push(deferred.promise);
			})

			return $q.all(promises);
		} else {
			var params = {
				jsession: $localStorage.currentUser.token,
				currentPage: 1,
				pageRecords: 1
			};

			var deferred = $q.defer();

			$http.jsonp(trustedurl, {
				params: params,
				jsonpCallbackParam: 'callback'
			}).then(function(response) {
				deferred.resolve(response);
			}, function(response) {
				deferred.reject(response);
			});

			return deferred.promise;
		}
	};

	function checkResult(result) {
		switch(result) {
			case 1:
				var issue = "User name does not exist!";
				openSwal(issue);
				break;
			case 2:
				var issue = "Wrong Password!";
				openSwal(issue);
				break;
			case 3:
				var issue = "User Account has been cancled!";
				openSwal(issue);
				break;
			case 4:
				var issue = "User has expired!";
				openSwal(issue);
				break;
			case 5:
				var issue = "Token does not exist or expired.";
				logout(issue);
				break;
			case 6:
				var issue = "System Abnormal!";
				openSwal(issue);
				break;
			case 7: //增加登录跳转功能？ 当token不存在时？
				var issue = "Bad Request!";
				openSwal(issue);
				break;
			case 8:
				var issue = "No permission to device or vehicle!";
				openSwal(issue);
				break;
			case 9:
				var issue = "Start time should not beyond end time!";
				openSwal(issue);
				break;
			case 10:
				var issue = "Search time is over scope!";
				openSwal(issue);
				break;
			case 11:
				var issue = "Download task already exists!";
				openSwal(issue);
				break;
			case 12:
				var issue = "Account already exists!";
				openSwal(issue);
				break;
			case 13:
				var issue = "No Permission!";
				openSwal(issue);
				break;
			case 14:
				var issue = "Reach maximum number of devices allowing control!";
				openSwal(issue);
				break;
			case 15:
				var issue = "Device already exists!";
				openSwal(issue);
				break;
			case 16:
				var issue = "Vehicle already exists!";
				openSwal(issue);
				break;
			case 17:
				var issue = "Device already in use!";
				openSwal(issue);
				break;
			case 18:
				var issue = "Vehicle does not exist!";
				openSwal(issue);
				break;
			case 19:
				var issue = "Device does not exist!";
				openSwal(issue);
				break;
			default:
				return;
		};

		function openSwal(issue) {
			swal({
				title: "Please Try Again",
				text: issue,
				type: "info",
				confirmButtonColor: '#d33',
				confirmButtonText: 'OK'
			});
		};

		function logout(issue) {
			swal({
				title: "Please Login Again",
				text: issue,
				type: "info",
				confirmButtonColor: '#d33',
				confirmButtonText: 'Sign Out',
				//	          timer: 5000
			}).then(function() {
				$state.go('login');
			});
		}
	}

	function createPageArray(data) {
		var currentPage = data.currentPage;
		var totalPage = parseInt(data.totalPages);
		var temp = 1;

		if(typeof currentPage !== "undefined" && currentPage !== "") {
			temp = parseInt(currentPage);
		}

		var pageArray = [];
		for(var i = 1; i <= totalPage; i++) {
			pageArray.push({
				currentPage: i,
				pageRecords: 10
			});
		}
		return pageArray;
	}

	function createPageArray(data) {
		var currentPage = data.currentPage;
		var totalPage = parseInt(data.totalPages);
		var temp = 1;

		if(typeof currentPage !== "undefined" && currentPage !== "") {
			temp = parseInt(currentPage);
		}

		var pageArray = [];
		for(var i = 1; i <= totalPage; i++) {
			pageArray.push({
				currentPage: i,
				pageRecords: 10
			});
		}
		return pageArray;
	}

	/**
	 * Reset Password API Call
	 */
	function resetPassword(oldPW, newPW) {
		var url = Host + "/LoginApiAction_password.action";
		var params = {
			jsession: $localStorage.currentUser.token,
			userAccount: $localStorage.currentUser.username,
			oldPwd: oldPW,
			newPwd: newPW
		};

		return returnHttp(url, params);
	}

	function loadTimeout() {
		if(!$rootScope.loadCountDown || $rootScope.loadCountDown < 1) {
			$rootScope.loadCountDown = 3;
			//			console.log("count down before next request: ", $rootScope.loadCountDown);
			return true;
		} else {
			$rootScope.loadCountDown--;
			//			console.log($rootScope.loadCountDown, false);
			return false;
		}
	};

	function queryVehiGroup() {
		var url = Host + "/VehiGroupApiAction_list.action";
		var params = {
			jsession: $localStorage.currentUser.token,
		};

		return returnHttp(url, params);
	}

	function deleteVehiGroup(id) {
		var url = Host + "/VehiGroupApiAction_delete.action";
		var params = {
			jsession: $localStorage.currentUser.token,
			id: id
		};

		return returnHttp(url, params);
	}

	function addVehiGroup(name) {
		var url = Host + "/VehiGroupApiAction_add.action";
		var params = {
			jsession: $localStorage.currentUser.token,
			parentId: 0,
			name: name
		};

		return returnHttp(url, params);
	}

	function editVehiGroup(name, id) {
		var url = Host + "/VehiGroupApiAction_save.action";
		var params = {
			jsession: $localStorage.currentUser.token,
			id: id,
			name: name
		};

		return returnHttp(url, params);
	}

	function moveVehiGroup(vehicle, groupId) {
		var url = Host + "/VehiGroupApiAction_moveSelect.action";
		var params = {
			jsession: $localStorage.currentUser.token,
			groupId: groupId,
			vehicle: vehicle
		};

		return returnHttp(url, params);
	}

	function removeVehiGroup(vehicle) {
		var url = Host + "/VehiGroupApiAction_removeSelect.action";
		var params = {
			jsession: $localStorage.currentUser.token,
			vehicle: vehicle
		};

		return returnHttp(url, params);
	}

	function getip() {
		var url = 'https://freegeoip.net/json/';
		var deferred = $q.defer();
		var trustedurl = $sce.trustAsResourceUrl(url);
		
		$http.jsonp(trustedurl).then(function(response) {
			deferred.resolve(response);
		}, function(response) {
			deferred.reject(response);
		});

		return deferred.promise;
	}
	
	function listAllUser() {
		var url = Host + "/UserApiAction_list.action";
		var params = {
			jsession: $localStorage.currentUser.token,
			pageRecords: 100
		};

		return returnHttp(url, params);
	}
	
	function addRole(name, code) {
		var url = Host + "/gpsapi/808gps/open/192.168.168.23:88/RoleApiAction_add.action";
		var params = {
			jsession: $localStorage.currentUser.token,
			name: name,
			privilege: code,
			remarks: $localStorage.currentUser.username
		};

		return returnHttp(url, params);
	}
	
	function addUser(username, roleid) {
		var url = Host + "/UserApiAction_add.action";
		var params = {
			jsession: $localStorage.currentUser.token,
			name: $localStorage.currentUser.username + ' API',
			account: username,
			password: '000000',
			roleId: roleid,
			validity: '2019-09-30 00:00:00'
		};

		return returnHttp(url, params);
	}
	
	function allocateAllDevice(userid, ids) {
		var url = Host + "/UserApiAction_savePermit.action";
		var params = {
			jsession: $localStorage.currentUser.token,
			id: userid,
			permitsDev: ids
		};

		return returnHttp(url, params);
	}

	return vehiServices;
}