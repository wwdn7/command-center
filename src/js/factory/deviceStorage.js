angular
	.module('PVision')
	.value('totalRecords', {
		record: undefined
	})
	.factory('deviceStorage', ["$rootScope", "$indexedDB", "$localStorage", "$interval", "vehicleInfoServices", "vehiStatus", "$q", "utility", "totalRecords",
		function($rootScope, $indexedDB, $localStorage, $interval, vehicleInfoServices, vehiStatus, $q, utility, totalRecords) {

			var services = {
				getItems: getItems,
				reloadAlarminfo: reloadAlarminfo
			};

			var dateTime = new Date().getTime();
			var docClient = new AWS.DynamoDB.DocumentClient();

			var params = {
				TableName: 'user_config',
				ProjectionExpression: 'hardware',
				KeyConditionExpression: 'username = :ul',
				ExpressionAttributeValues: {
					":ul": $localStorage.currentUser.username,
				}
			};

			function reloadAlarminfo() {
				docClient.query(params, function(err, data) {
					if(err) {
//						console.log('database reading failed', err, params);
					} else {
//						console.log('find data item', data);
						if(data.Items[0] && data.Count == 1) {
							if(!angular.equals(data.Items[0].hardware, {})) {
								$localStorage.alarminfo = data.Items[0].hardware;
								//console.log('find disalarm info', $localStorage.alarminfo);
							} else {
								$localStorage.alarminfo = "";
								console.log('no disalarm info added');
							}
						}else {
							console.log('query error?', data);
						}
					}
				});
			}

			/*Store all device Info*/
			function getItems() {
				vehicleInfoServices.vehiInfo($localStorage.record).then(function(response) {
					vehicleInfoServices.checkResult(response.data.result);
					var items = response.data.devices;
					totalRecords.record = response.data.pagination.totalRecords;

					var vehiData = items.map(function(val, i) {

						//Distance
						var distance = val.devStatus.liCheng;
						// items[i].devStatus.liCheng = vehiStatus.distance(distance);
						items[i].devStatus.liCheng = utility.getLicheng(distance);

						//Direction
						var deg = val.devStatus.hangXiang;
						items[i].hangXiang = vehiStatus.direction(deg);

						//Speed
						var speed = val.devStatus.speed;
						// items[i].speed = vehiStatus.speed(speed);
						items[i].speed = utility.getSpeed(speed);

						//Online
						var a = val.devStatus.online;
						items[i].online = vehiStatus.online(a);
						//							(val.devStatus.online == 1) ? items[i].onlineStatus = 1 : items[i].onlineStatus = undefined;
						if(val.devStatus.online == 1) {
							items[i].onlineStatus = 1;
						} else if(val.devStatus.online == 0) {
							items[i].onlineStatus = 4;
						}
						//test device ip
						//					if(val.devStatus.online == 1){
						//						console.log("IP Address: ", val.devStatus.ip, " device name: ", val.devInfo.userAccount.name);
						//					}

						//Status
						var status1 = val.devStatus.status1;
						var status3 = val.devStatus.status3;

						//Network Signal
						items[i].network = vehiStatus.network(status1);

						//GPS Antenna State
						items[i].gps = vehiStatus.gps(status1);

						//ACC State
						items[i].acc = vehiStatus.acc(status1);

						//disk status
						items[i].disk1Status = vehiStatus.disk1Status(status1);
						items[i].disk2Status = vehiStatus.disk2Status(status1);

						if(val.online === "Online" && val.acc === "ON" && val.devStatus.parkTime > 180) {
							items[i].idling = "idling";
							items[i].onlineStatus = 3;
							//						console.log("recorded", i);
						} else {
							items[i].idling = "";
						}

						if(val.online === "Online" && val.acc === "OFF") {
							items[i].accOff = "ACC OFF";
							items[i].onlineStatus = 2;
							//						console.log("failure recorded", i);
						} else {
							items[i].accOff = "";
						}

						var disk1Status = (status1 >> 8) & 3;
						var disk2Status = (status1 >> 29) & 3;

						//disk status
						items[i].disk1Status = vehiStatus.disk1Status(status1);
						items[i].disk2Status = vehiStatus.disk2Status(status1);

						if(val.devInfo.diskType == 1) {
							items[i].disk1 = "SD1";
							items[i].disk2 = "SD2";
						} else if(val.devInfo.diskType == 2) {
							items[i].disk1 = "HDD";
							items[i].disk2 = "SD";
						} else {
							items[i].disk1 = "";
							items[i].disk2 = "";
						}

						//							if(disk1Status == 1){
						//								if(disk2Status == 1){
						//									items[i].diskStatus = val.disk1 + "(" + val.disk1Status + "), " + val.disk2 +  "(" + val.disk2Status + ")" ;
						//								}else if(disk2Status == 0 && val.devInfo.diskType == 1){
						//									items[i].diskStatus = val.disk1 + "(" + val.disk1Status + ")" + ", Missing SD2";
						//									items[i].hardwareStatus = "hardware issue";
						//								}else {
						//									items[i].diskStatus = val.disk1 + "(" + val.disk1Status + "), " + val.disk2 +  "(" + val.disk2Status + ")";
						//								}
						//							}else if(disk2Status == 1 && disk1Status == 0){
						//								items[i].diskStatus = val.disk2 + "(" + val.disk2Status + ")" + ", Missing SD1";
						//								items[i].hardwareStatus = "hardware issue";
						//							}else if(val.devStatus.online !== null){
						//								items[i].diskStatus = "No Disk Exist";
						//								items[i].hardwareStatus = "hardware issue";
						//		//						console.log("hardware issue recorded", val);
						//							}else{
						//								items[i].diskStatus = val.disk1 + "(" + val.disk1Status + "), " + val.disk2 +  "(" + val.disk2Status + ")";
						//							}
						/*Hardware issue status*/
						items[i].videoLoss = vehiStatus.vidloss(status3, val.devInfo.chnCount, val.devInfo.chnName);
						items[i].diskStatus = val.disk1 + "(" + val.disk1Status + "), " + val.disk2 + "(" + val.disk2Status + ")";
						var chn = "";
						if(val.videoLoss[0]) {
							for(var j = 0; j < val.videoLoss.length; j++) {
								chn = chn.concat(val.videoLoss[j].Name + " ");
								//								chn = chn.concat(val.videoLoss[j].Name + "-" + val.videoLoss[j].Channel + " ");
								items[i].vidInfo = "Video loss at channel " + chn;
							}
						} else {
							items[i].vidInfo = "Operating...";
						}

						items[i].hardwareInfo = "";
						items[i].hardwareStatus = [];

						if(val.devStatus.online !== null) {
							if(disk1Status !== 1) {
								if(!$localStorage.alarminfo['device' + val.devInfo.idno]) {
									items[i].hardwareStatus.push("Missing Hard Drive");
								} else if($localStorage.alarminfo['device' + val.devInfo.idno].indexOf(3) == -1) {
									items[i].hardwareStatus.push("Missing Hard Drive");
								}

								if(disk2Status !== 1) {
									items[i].hardwareInfo = items[i].hardwareInfo + "Missing " + val.disk1 + "," + val.disk2 + "; ";
								} else {
									items[i].hardwareInfo = items[i].hardwareInfo + "Missing " + val.disk1 + "; ";
								}
							} else if(disk2Status !== 1 && val.devInfo.diskType == 1) {

								if(!$localStorage.alarminfo['device' + val.devInfo.idno]) {
									items[i].hardwareStatus.push("Missing Hard Drive");
								} else if($localStorage.alarminfo['device' + val.devInfo.idno].indexOf(3) == -1) {
									items[i].hardwareStatus.push("Missing Hard Drive");
								}
								items[i].hardwareInfo = items[i].hardwareInfo + "Missing " + val.disk2 + "; ";
							}
							if(val.gps == "GPS Invalid") {
								if(!$localStorage.alarminfo['device' + val.devInfo.idno]) {
									items[i].hardwareStatus.push("No GPS Data");
								} else if($localStorage.alarminfo['device' + val.devInfo.idno].indexOf(2) == -1) {
									items[i].hardwareStatus.push("No GPS Data");
								}
								items[i].hardwareInfo = items[i].hardwareInfo + val.gps + "; ";
							}
							if(val.network == "Sim Card Not exist" || val.network == "3G Module Not Exist" || val.network == "3G Module OFF") {
								if(!$localStorage.alarminfo['device' + val.devInfo.idno]) {
									items[i].hardwareStatus.push("Lost Connection");
								} else if($localStorage.alarminfo['device' + val.devInfo.idno].indexOf(1) == -1) {
									items[i].hardwareStatus.push("Lost Connection");
								}
								items[i].hardwareInfo = items[i].hardwareInfo + val.network + "; ";
							}
							//video loss
							if(val.videoLoss[0]) {
								if(!$localStorage.alarminfo['device' + val.devInfo.idno]) {
									items[i].hardwareStatus.push("Camera Not Recording");
								} else if($localStorage.alarminfo['device' + val.devInfo.idno].indexOf(4) == -1) {
									items[i].hardwareStatus.push("Camera Not Recording");
								}

								items[i].hardwareInfo = items[i].hardwareInfo + "Video Loss;";
							}

							if(val.devStatus.updateTime < dateTime - 604800000) {
								if(!$localStorage.alarminfo['device' + val.devInfo.idno]) {
									items[i].hardwareStatus.push("No Events");
								} else if($localStorage.alarminfo['device' + val.devInfo.idno].indexOf(5) == -1) {
									items[i].hardwareStatus.push("No Events");
								}

								items[i].hardwareInfo = items[i].hardwareInfo + " Offline 7+ days;";
							}
						} else {
							items[i].hardwareInfo = "Device Not Found!";
						}

						if(val.devStatus.parkTime >= 180) {
							items[i].isPark = "Parking(" + vehiStatus.parkTime(val.devStatus.parkTime) + ")";
						} else {
							items[i].isPark = val.speed + " (" + val.hangXiang + ")";
						};

						//					return items[i];
						return {
							accOff: val.accOff,
							videoLoss: val.videoLoss,
							vidInfo: val.vidInfo,
							hardwareInfo: val.hardwareInfo,
							hangXiang: val.hangXiang,
							online: val.online,
							onlineStatus: val.onlineStatus,
							network: val.network,
							gps: val.gps,
							acc: val.acc,
							disk1Status: val.disk1Status,
							disk2Status: val.disk2Status,
							diskStatus: val.diskStatus,
							idling: val.idling,
							hardwareStatus: val.hardwareStatus,
							devInfo: val.devInfo,
							speed: val.speed,
							isPark: val.isPark,
							devStatus: {
								alarmType: val.devStatus.alarmType,
								alarmTime: val.devStatus.alarmTime,
								alarmInfo: val.devStatus.alarmInfo,
								alarmDesc: val.devStatus.alarmDesc,
								devIdno: val.devStatus.devIdno,
								devGroupName: val.devStatus.devGroupName,
								gpsTime: val.devStatus.gpsTime,
								gpsTimeStr: val.devStatus.gpsTimeStr,
								hangXiang: val.devStatus.hangXiang,
								jingDu: val.devStatus.jingDu,
								weiDu: val.devStatus.weiDu,
								jingDuEx: val.devStatus.jingDuEx,
								weiDuEx: val.devStatus.weiDuEx,
								speed: val.devStatus.speed,
								parkTime: val.devStatus.parkTime,
								status1: val.devStatus.status1,
								online: val.devStatus.online,
								liCheng: val.devStatus.liCheng
							}
						};
					});
					//						console.log('test: ', $localStorage.items);
					$rootScope.items = vehiData;
				}, function(err) {
					console.log('failed load vehicle data', err);
				});
			}

			return services;
		}
	]);