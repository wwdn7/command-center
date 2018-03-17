/**
 * Master Controller
 */

angular
	.module('PVision')
	.controller('MasterCtrl', ['$indexedDB', '$timeout', '$scope', '$cookieStore', '$parse', '$localStorage', 'vehiStatus', '$rootScope', 'vehicleInfoServices', '$state', 'toastr', 'allDevIDs', 'totalRecords', MasterCtrl]);

function MasterCtrl($indexedDB, $timeout, $scope, $cookieStore, $parse, $localStorage, vehiStatus, $rootScope, vehicleInfoServices, $state, toastr, allDevIDs, totalRecords) {

	/**
	 * Initiate database
	 */
	(function initDatabase() {
		//find week info
		var info = vehicleInfoServices;
		var thisWeekMon = info.findDate().monday();
		var lastWeekMon = info.findDate().lastMonday();

		var user = $localStorage.currentUser.username;

		//Initiate database
		$rootScope.thisWeekDB = new PouchDB(user + thisWeekMon);
		$rootScope.lastWeekDB = new PouchDB(user + lastWeekMon);
	})();

	/**
	 * set default speed unit
	 **/
	if(!angular.isDefined($cookieStore.get('speedUnit'))) {
		if(navigator.language == 'en-GB') {
			$cookieStore.put('speed unit', 'Miles');
		} else {
			$cookieStore.put('speed unit', 'Km');
		}
	}

	// if(!angular.isDefined($cookies.get('speedUnit'))){
	// 	if(navigator.language == 'en-GB'){
	// 		$cookies.put('speed unit', 'Miles', {'expires' : 'Tue Jan 19 2038 03:14:05 GMT+0000 (GMT Standard Time)'});
	// 	}else{
	// 		$cookies.put('speed unit', 'Km', {'expires' : 'Tue Jan 19 2038 03:14:05 GMT+0000 (GMT Standard Time)'});
	// 	}
	// }
	/**
	 * Sidebar Toggle & Cookie Control
	 */

	function getGroups() {
		return $localStorage.devGroup;
	};

	//check if group toggle already exist & assign scope
	$scope.$watch(getGroups, function(val) {
		if(val) {
			var devGroup = $localStorage.devGroup;
			devGroup.map(function(key) {
				if(angular.isDefined($cookieStore.get('group' + key))) { //check if cookie exist
					//	    			$parse('group' + key).assign($scope, $cookieStore.get('group' + key)); //assign cookie to scope & below also works
					$scope['group' + key] = $cookieStore.get('group' + key);
				};
			});
		};
	});

	function getAllIds() {
		return $localStorage.allDevID;
	};

	//check if vehicle toggle already exist & assign scope
	$scope.$watch(getAllIds, function(val) {
		if(angular.isDefined(val)) {
			var ids = val.split(',');
			ids.map(function(id) {
				$scope['id' + id] = true;
			});
		};
	});

	$scope.getOnlineText = function(id) {
		if($rootScope.itemStatus) {
			var status = $rootScope.itemStatus.get(id);
			switch(status) {
				case 1:
					return "Online";
				case 4:
					return "Offline";
				case 3:
					return "Idling";
				case 2:
					return "IGNITION OFF";
			}
		};
	};

	function groupAll(bol) {
		if($localStorage.devGroup) { //check if group key exist
			var devGroup = $localStorage.devGroup;
			devGroup.map(function(key) {
				$cookieStore.put('group' + key, bol);
				$scope['group' + key] = bol;
			});
		};
	};

	//	var ifTwice = new Map();

	$scope.$watch('itemHardwareIssue', function(newVal, oldVal) {

		//				console.log(newVal, oldVal);
		if(oldVal) {
			if(newVal.length !== oldVal.length) {
				//TODO  
				console.log('hardwareissue changed!', newVal.length, oldVal.length);
			}

			var delay = 0;
			newVal.forEach(function(value, key, map) {

				var issue = value.filter(ignoreConnErr);
				var oldResult = oldVal.get(key);
				//								console.log(issue, key, oldResult);
				//添加一道机制，检查因信号短暂丢失造成的频繁的报警，如果发现信号丢失或者摄像头问题，先存储到一个MAP里，在下一遍new value收到的时候检查是否仍存在这个问题，然后删掉这个MAP
				/*				if(ifTwice.has(key)) {
									if(value.indexOf('Camera Not Recording') > -1 || value.indexOf('Lost Connection') > -1) {
										var devName = allDevIDs.deviceMap.get(key);
										var isuu = ifTwice.get(key);
										//						console.log('after lost internet alert!');
										toastr.error('New Issue Found: ' + isuu, 'Device: ' + devName + '(' + key + ')', {
											autoDismiss: false,
											timeOut: 0,
											onTap: function() {
												$state.go('detail', {
													id: key
												});
											},
										});

										$timeout(function() {
											storeDevNot({
												armTime: getTime(),
												idno: key,
												alarmType: "hardware",
												alarmInfo: isuu,
												devName: devName,
												liCheng: null,
												zuobiao: null,
												speed: null,
												parkTime: null,
												fangXiang: null,
											});
										}, delay);
										delay += 10;
									}
									ifTwice.delete(key);
								}*/
				if(issue[0]) {
					if(!oldResult) {
						//if new record found TODO: separate armTime in the furture
						console.log('new hardware issue found! device: ', key, value);
						var devName = allDevIDs.deviceMap.get(key);
						toastr.error('New Issue Found: ' + issue.join(), 'Device: ' + devName + '(' + key + ')', {
							autoDismiss: false,
							timeOut: 0,
							onTap: function() {
								$state.go('detail', {
									id: key
								});
							},
						});
						delay += 10;
						storeHWiss(issue, devName, key, delay);
					} else {
						var diff = vehiStatus.compareUpdate(issue, oldResult.filter(ignoreConnErr));
						if(diff[0]) {
							//if new hardware status found TODO: create toaster after confirm
							var devName = allDevIDs.deviceMap.get(key);
							console.log('new hardware issue updated! device number: ' + key, 'new val: ' + value, 'diff: ' + diff, 'old val: ' + oldResult);
							toastr.error('New Issue Found: ' + diff.join(), 'Device: ' + devName + '(' + key + ')', {
								onTap: function() {
									$state.go('detail', {
										id: key
									});
								},
								autoDismiss: false,
								timeOut: 0
							});

							delay += 10;
							storeHWiss(diff, devName, key, delay);
						}
					}
				}

			});
		}
	});

	function getRecords() {
		return totalRecords.record;
	}

	function getSidelist() {
		return $localStorage.sidelist;
	}

	function getTime() {
		var t = new Date();
		return t.getTime();
	}

	function storeDevNot(data) {
		$indexedDB.openStore('alerts', function(store) {
			store.insert({
				"armTime": data.armTime,
				"devIdno": data.idno,
				"armType": data.alarmType,
				"armInfo": data.alarmInfo,
				"devName": data.devName,
				"mileage": data.liCheng,
				"coordinates": data.zuobiao,
				"speed": {
					speed: data.speed,
					parkTime: data.parkTime,
					fangXiang: data.fangXiang
				},
				"checked": true
			}).then(function(e) {
				//do something?
				console.log('device notification stored in database.', e);
				$rootScope.$broadcast('NotifyUpdated');
			});

		});
	}

	function storeHWiss(issue, devName, key, delay) {
		$timeout(function() {
			storeDevNot({
				armTime: getTime(),
				idno: key,
				alarmType: "hardware",
				alarmInfo: issue.join(),
				devName: devName,
				liCheng: null,
				zuobiao: null,
				speed: null,
				parkTime: null,
				fangXiang: null,
			});
		}, delay);
	}

	function ignoreConnErr(val) {
		if(val === 'Camera Not Recording' || val === 'Lost Connection') {
			return false;
		} else {
			return true;
		}
	}

	$rootScope.$watch(getRecords, function(newVal, oldVal) {
		if(oldVal) {
			$localStorage.record = newVal;
			console.log('totalRecords updated! new value: ', newVal, 'old value: ' + oldVal);

			//						console.log('current devices: ', allDevIDs.deviceMap); TODO bug to be fix
			var unbind = $scope.$watch(getSidelist, function(newVal, oldVal) {
				var delay = 0;
				if(newVal.length > oldVal.length) { //if device count increased
					newVal.map(function(item) {
						if(allDevIDs.deviceMap.has(item.idno) === false) { //find added device
							console.log("device loaded: ", item);
							toastr.info('Device: ' + item.userAccount.name + '(' + item.idno + ')', 'New Device Added', {
								onTap: function() {
									$state.go('detail', {
										id: item.idno
									});
								},
								autoDismiss: false,
								timeout: 0
							});
							allDevIDs.deviceMap.set(item.idno, item.userAccount.name);

							$timeout(function() {
								//								console.log('delay: ', delay);
								storeDevNot({
									armTime: getTime(),
									idno: item.idno,
									alarmType: "device+",
									alarmInfo: 'New Device Added',
									devName: item.userAccount.name,
									liCheng: null,
									zuobiao: null,
									speed: null,
									parkTime: null,
									fangXiang: null,
								});
							}, delay);
							delay += 10;
						}
					});
					unbind();
				}

				if(newVal.length < oldVal.length) { //if device count decreased
					allDevIDs.deviceMap.forEach(function(value, key) {
						var findItem = newVal.some(function(item) {
							return item.idno === key;
						});

						if(!findItem) {
//							console.log(value, key);
							toastr.info('Device: ' + value + '(' + key + ')', 'Device Removed', {
								onTap: function() {
									$state.go('detail', {
										id: key
									});
								},
								autoDismiss: false,
								timeout: 0
							});
							allDevIDs.deviceMap.delete(key);

							$timeout(function() {
								//								console.log('delay: ', delay);
								storeDevNot({
									armTime: getTime(),
									idno: key,
									alarmType: "device-",
									alarmInfo: 'Device Removed',
									devName: value,
									liCheng: null,
									zuobiao: null,
									speed: null,
									parkTime: null,
									fangXiang: null,
								});
							}, delay);
							delay += 10;
						}
					})
				}

			})

		}
	});

	var mobileView = 992;

	$scope.getWidth = function() {
		return window.innerWidth;
	};

	$scope.$watch($scope.getWidth, function(newValue, oldValue) {
		if(newValue >= mobileView) {
			if(angular.isDefined($cookieStore.get('toggle'))) {
				$scope.toggle = !$cookieStore.get('toggle') ? false : true;
			} else {
				$scope.toggle = true;
			}
		} else {
			$scope.toggle = false;
		};
	});

	$scope.toggleSidebar = function() {
		$scope.toggle = !$scope.toggle;
		$cookieStore.put('toggle', $scope.toggle);
	};

	$scope.toggleGroup = function(key) {
		if(angular.isDefined($cookieStore.get('group' + key))) {
			$cookieStore.put('group' + key, !$cookieStore.get('group' + key));
		} else {
			$cookieStore.put('group' + key, true);
		};
		$parse('group' + key).assign($scope, $cookieStore.get('group' + key));
	};

	$scope.vehicleDropdown = function(id) {
		if($scope['id' + id] == true) {
			$scope['id' + id] = false;
			/*			vehiStatus.shortLocation({lat:lat,lng:lng}, function(result) {
							angular.element('.id' + id + ' .car-details .address').text(result);
						});*/
			//  		console.log("id", id, ": false?", $scope['id' + id]);
		} else {
			$scope['id' + id] = true;
			//  		console.log("id", id, ": true?", $scope['id' + id]);
		};
	};

	$scope.isCarCollapse = function(id) {
		if($rootScope.itemStatus) {
			if($rootScope.itemStatus.has(id)) {
				return 'id' + id;
			} else {
				return true;
			};
		};
	};

	$scope.ifVehicleDropdown = function(status) {
		if(!status) {
			return false;
		} else {
			return true;
		}
	};

	$scope.getGroupClass = function(key) {
		if(angular.isDefined($cookieStore.get('group' + key))) {
			if($cookieStore.get('group' + key)) {
				return "fa-angle-down";
			} else {
				return "fa-angle-up";
			}
		} else {
			return "fa-angle-up";
		}
	}

	$scope.expandAll = function() {
		groupAll(false);
	}

	$scope.collapseAll = function() {
		groupAll(true);
	}

	//	window.onresize = function() {
	//		$scope.$apply();
	//	}

	angular.element(window).on('resize', function() {
		$scope.$apply();
	});

}