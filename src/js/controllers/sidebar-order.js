var sidelist = angular.module('PVision');

sidelist.value('allDevIDs', {
	deviceMap: undefined
});
sidelist.controller('listCtrl', ["$scope", "$rootScope", "$state", "vehicleInfoServices", "vehiStatus", "$timeout", "$interval", "$localStorage", "deviceStorage", "$filter", "$uibModal", "$indexedDB", "allDevIDs",
	function($scope, $rootScope, $state, vehicleInfoServices, vehiStatus, $timeout, $interval, $localStorage, deviceStorage, $filter, $uibModal, $indexedDB, allDevIDs) {

		$scope.srclconfig = {
			autoHideScrollbar: true,
			theme: 'minimal',
			//			setWidth: '50px',
			scrollInertia: 299,
			axis: "y"
		};

		function getGroup() {
			return $localStorage.devGroup;
		};

		$scope.$watch(getGroup, function(val) {
			$scope.devGroup = $localStorage.devGroup;
		});

		function getToken() {
			return $localStorage.currentUser; //pls note that could not return token 
		};

		/*get items records*/
		$scope.$watch(getToken, function(val) {
			if(val) {
				deviceStorage.reloadAlarminfo();
				vehicleInfoServices.vehiInfo().then(function(result) {

					vehicleInfoServices.checkResult(result.data.result); //check if current user exist if not log out
//					console.log('test', result);
					if($localStorage.record) {
						if(result.data.pagination.totalRecords !== $localStorage.record) {
							$localStorage.record = result.data.pagination.totalRecords;
							console.log("$localStorage.record has changed.");
						};
					} else {
						$localStorage.record = result.data.pagination.totalRecords;
						console.log("device number updated.");
					}
				});
			}
		});

		function getDevNum() {
			return $localStorage.record;
		};

		//Update devices
		$scope.$on("updateVehiList", deviceStorage.getItems);

		/*Update device data*/
		var unbind = $scope.$watch(getDevNum, function(val) {
			if(val) {
				//				console.log('local record received: ',  val);
				deviceStorage.getItems();
				$scope.UpdatingStatus = $interval(function() {
					deviceStorage.getItems();
				}, 10000);
				unbind();
			};
		});

		$rootScope.$on('reloadVehiList', function() {
			if($scope.UpdatingStatus) {
//				console.log('vehicle status interval canceled');
				$interval.cancel($scope.UpdatingStatus);
			};
		});

		function getSidelist() {
			return $localStorage.sidelist;
		};

		$scope.$watch(getGroup, function(val) {
			if(val) {
				$scope.$watch(getSidelist, function(newVal) {
					if(newVal) {
						//						console.log(newVal);
						if(!allDevIDs.deviceMap) {
							var allDevId = new Map();
							newVal.map(function(device) {
								allDevId.set(device.idno, device.userAccount.name);
							});
							allDevIDs.deviceMap = allDevId;
							//							console.log(allDevIDs);
						}
						//			$scope.scrollPos = angular.element('#sidebar ul')[0].scrollTop; //store scroll position
						//			console.log(devGroup);
						//			console.log(angular.element('#sidebar ul')[0].scrollTop);
						$scope.sideLists = $filter('toGroup')($filter('orderBy')(newVal, '-devStatus.devIdno'), $scope.devGroup);
						//									console.log($scope.sideLists);
						if($scope.propertyName) {
							//					console.log("remained list...", subScope.propertyName);
							remainOrderList($scope.propertyName, $scope.reverse);
						};
						//make scroll position stay where it is after sort vehicles every 10 seconds
						//			$timeout(function() {angular.element('#sidebar ul')[0].scrollTop = $scope.scrollPos;}, 0);
						//			console.log(angular.element('#sidebar ul'));
					};
				});
			};
		});

		$scope.$watch('items', function(lists) {
			if(lists) {
				$rootScope.itemStatus = new Map();
				$rootScope.itemHardwareIssue = new Map();

				$localStorage.statusCount = {
					accOffCount: "",
					IdlingCount: "",
					onlineRecords: "",
					offlineRecords: "",
					hardwareRecords: "",
					inactiveRecords: ""
				};

				lists.map(function(newVal) {
					//store online status 
					if(newVal.onlineStatus) {
						$rootScope.itemStatus.set(newVal.devStatus.devIdno, newVal.onlineStatus);
					};
					if(newVal.hardwareStatus[0]) {
						$rootScope.itemHardwareIssue.set(newVal.devStatus.devIdno, newVal.hardwareStatus);
					}
					switch(newVal.onlineStatus) {
						case 1:
							$localStorage.statusCount.onlineRecords++;
							break;
						case 2:
							$localStorage.statusCount.accOffCount++;
							$localStorage.statusCount.onlineRecords++;
							break;
						case 3:
							$localStorage.statusCount.IdlingCount++;
							$localStorage.statusCount.onlineRecords++;
							break;
						case 4:
							$localStorage.statusCount.offlineRecords++;
							break;
						default:
							$localStorage.statusCount.inactiveRecords++;
					};
					if(newVal.hardwareStatus[0]) {
						$localStorage.statusCount.hardwareRecords++;
					};
				});
				//				console.log($rootScope.itemHardwareIssue);
				$scope.$watch('sideLists', function(val) {
					if(val && $rootScope.itemStatus) {
						$scope.groupRecords = new Map();
						$scope.sideLists.map(function(lists) {
							var records = 0;
							lists.val.map(function(val) {
								if($rootScope.itemStatus.has(val.idno) && $rootScope.itemStatus.get(val.idno) !== 4) {
									records++;
								}
							});
							$scope.groupRecords.set(lists.key, records);
						});
					};
				});
			};
		});

		//	})

		$scope.getGroupOnlineRecords = function(id) {
			if($scope.groupRecords) {
				return $scope.groupRecords.get(id);
			} else {
				return 0;
			};
		};

		$scope.getTypeClass = function(type) {
			switch(type) {
				case 0:
					return "fa-truck";
				case 1:
					return "fa-car";
				case 2:
					return "fa-truck";
				case 2:
					return "fa-truck";
				default:
					return "fa-car";
			};
		};

		$scope.getFleetClass = function(id) {
			//		console.log(fleet);
			var circle = "fa-circle";
			if($rootScope.itemStatus) {
				var status = $rootScope.itemStatus.get(id);
				switch(status) {
					case 1:
						return circle + " text-online";
					case 4:
						return circle + " text-offline";
					case 3:
						return circle + " text-idling";
						//			case 3: return circle + " text-parking";
					case 2:
						return circle + " text-ignition";
				}
			};
			//		if (online == 1) {
			//			if(vehiStatus.acc(status) === "OFF"){
			//				return circle + " text-ignition";
			//			}else if (vehiStatus.acc(status) === "ON"){
			//				if(park > 180){
			//					return circle + " text-idling";
			//				} else {
			//					return circle + " text-online";
			//				}
			//			}else {
			//				return circle + " text-online";
			//			}
			//		} else if(online == 0){
			//			return circle + " text-offline";
			//		} else {
			//			return "";
			//		}

		};

		//sidebar search content clear
		$scope.clearFilter = function() {
			$scope.sidesearch = "";
		}

		$scope.getHardwareClass = function(id) {
			if($rootScope.itemHardwareIssue) {
				if($rootScope.itemHardwareIssue.has(id)) {
					return "fa-exclamation-triangle";
				};
			};
		};

		$scope.$watch('currentAlerts', function(val) {
			var set = new Set();
			if(val) {
				val.map(function(value) {
					set.add(value.devIdno);
				});
			};
			$scope.alertIDs = set;
			//		console.log($scope.alertIDs);
		});

		$scope.getAlertClass = function(id) {
			if($scope.alertIDs) {
				var isAlarm = $scope.alertIDs.has(id);
				if(isAlarm) {
					return "fa-bell";
				};
			};
		};

		$scope.getOffline = function(id) {
			if($rootScope.itemStatus) {
				if(!$rootScope.itemStatus.has(id)) {
					return "inactive";
				};
			} else {
				return "inactive";
			};
		};

		$scope.ifIssue = function(id) {
			if($scope.ifHardware(id) || $scope.ifAlarm(id)) {
				return true;
			} else {
				return false;
			}
		}

		$scope.ifHardware = function(id) {
			if($rootScope.itemHardwareIssue) {
				var isHardware = $rootScope.itemHardwareIssue.has(id);
				return isHardware;
			};
		};

		$scope.ifAlarm = function(id) {
			if($scope.alertIDs) {
				var isAlarm = $scope.alertIDs.has(id);
				return isAlarm;
			};
		};

		$scope.viewVehicle = function(id) {
			if($rootScope.itemStatus) {
				if($rootScope.itemStatus.has(id)) {
					$state.go('detail', {
						id: id
					});
					//					$timeout(function() {
					//						$rootScope.$broadcast('deviceChange', id);
					//					}, 100);
				} else {
					swal({
						//					title: "Not Found",
						text: "Please make sure the device is connected",
						type: "warning",
						confirmButtonColor: "#DD6B55",
						confirmButtonText: "Close",
					});
				}
			};
			//broadcast deviceid
			//		var devId = item.devInfo.idno;
			//		console.log("in viewVehicle", item);
		};

		$scope.trackVehicle = function(id) {
			console.log(id);
			$state.go('track', {
				id: id
			});

			//			$timeout(function() {
			//				$rootScope.$broadcast('deviceChange', id);
			//			}, 100);
		};

		$scope.playVehicle = function(id) {
			console.log(id);
			$state.go('record', {
				id: id
			});

			//			$timeout(function() {
			//				$rootScope.$broadcast('deviceChange', id);
			//			}, 100);
		};

		$scope.viewHardwareIssue = function(id) {
			$state.go('hardware-issue');
			console.log(id);
			$timeout(function() {
				$rootScope.$broadcast('highlightIssue', id);
			}, 150);
		};

		$scope.viewAlarmIssue = function(id) {
			//		console.log(id);
			$scope.notifications = [];
			$indexedDB.openStore('alerts', function(store) {
				// build query search by device id
				var find = store.query();
				find = find.$eq(id);
				find = find.$index("time_idx");

				//find alerts under id
				store.eachWhere(find).then(function(e) {
					$scope.notifications = e;
					var modalInstance = $uibModal.open({
						animation: true,
						ariaLabelledBy: 'modal-title',
						ariaDescribedBy: 'modal-body',
						templateUrl: 'myModalContent.html',
						controller: 'ModalInstanceCtrl',
						controllerAs: 'vm',
						size: 'lg',
						resolve: {
							notifications: function() {
								var notifications = $filter('orderBy')($scope.notifications, '-armTime');
								notifications.map(function(val, i) {
									notifications[i].type = vehiStatus.getAlarmType(val.armType);
									notifications[i].info = vehiStatus.getAlarmContent(val.armType, val.armInfo, val.devIdno);
								});
								return notifications;
							}
						}
					});
				});
			});
		};

		function scroll() {
			$timeout(function() {
				angular.element('#sidebar ul')[0].scrollTop = 0;
			}, 0);
		};

		$scope.tab = function(tabIndex) {
			//		Sort by Fleet
			if(tabIndex == 1) {
				var orderProp = 'onlineStatus';
				orderList(orderProp);
				//			scroll();
			}
			//		Sort by Hardware
			if(tabIndex == 2) {
				var orderProp = 'hardwareInfo';
				orderList(orderProp);
				//			scroll();
			}
			//		Sort by alert
			if(tabIndex == 3) {
				var orderProp = 'alarm';
				orderList(orderProp);
				//			scroll();
			}
		};

		//orderBy:['!!devStatus.online', '-devStatus.online']
		function orderList(orderProp) {
			//			console.log("reverse", $scope.reverse, $scope.propertyName,  orderProp);
			$scope.reverse = (orderProp !== null && $scope.propertyName === orderProp) ? !$scope.reverse : false;
			//			console.log("reverse 2", $scope.reverse, $scope.propertyName, orderProp);
			remainOrderList(orderProp, $scope.reverse);
		};

		function remainOrderList(orderProp, reverse) {
			if(reverse == undefined) {
				$scope.reverse = false;
			};
			$scope.propertyName = orderProp;
			if($scope.alertIDs && $rootScope.itemHardwareIssue && $rootScope.itemStatus) {
				$scope.sideLists.map(function(arr, i) {
					$scope.sideLists[i].val = $filter('emptyAlertToEnd')($filter('orderBy')($scope.sideLists[i].val, '-idno'), $scope.propertyName, reverse, $scope.alertIDs, $rootScope.itemHardwareIssue, $rootScope.itemStatus);
				});
			};
		};

	}
])

sidelist.filter("emptyToEnd", ["$rootScope", function($rootScope) {
	return function(array) {
		if(!angular.isArray(array)) return;
		var present = array.filter(function(item) {
			if($rootScope.itemStatus) {
				if($rootScope.itemStatus.has(item.idno)) {
					return item;
				}
			}
		});
		var empty = array.filter(function(item) {
			if($rootScope.itemStatus) {
				if(!$rootScope.itemStatus.has(item.idno)) {
					return item;
				}
			} else if(!$rootScope.itemStatus) {
				return item;
			}
		});
		return present.concat(empty);
	};
}]);

sidelist.filter("toGroup", function() {
	return function(array, key) {
		if(!angular.isArray(array)) return;
		if(!angular.isArray(key)) return;
		var present = [];
		key.map(function(val) {
			var name = ""
			var tempArr = array.filter(function(item) {
				if(item.devGroupId == val) {
					return item;
				}
			});
			tempArr.some(function(el, i) {
				if(el.devGroupId == val) {
					if(!el.devGroupName) {
						name = "Others";
					} else {
						name = el.devGroupName;
					};
					return el.devGroupId == val;
				}
			});
			var items = {
				val: tempArr,
				name: name,
				key: val
			};
			present.push(items);
		});
		//      console.log(present);
		return present;
	}
});

sidelist.filter("emptyAlertToEnd", ["$filter", function($filter) {
	return function(array, sort, bool, ids, map, online) {
		var present = array.filter(function(item) {
			switch(sort) {
				case "alarm":
					var isAlarm = ids.has(item.idno);
					if(isAlarm) {
						return item;
					};
					break;
				case "hardwareInfo":
					var isHardware = map.has(item.idno);
					if(isHardware) {
						return item;
					};
					break;
				case "onlineStatus":
					item.onlineStatus = online.get(item.idno);
					return item;
					break;
			}
		});
		//      console.log(present);

		if(sort == 'onlineStatus') {
			present = $filter('orderBy')(present, "onlineStatus", bool);
		};

		//    	present = (sort == 'onlineStatus') ? $filter('orderBy')(present, sort, false) : $filter('orderBy')(present, sort, bool);

		var empty = array.filter(function(item) {
			switch(sort) {
				case "alarm":
					var isAlarm = ids.has(item.idno);
					if(!isAlarm) {
						return item;
					};
					break;
				case "hardwareInfo":
					var isHardware = map.has(item.idno);
					if(!isHardware) {
						return item;
					};
					break;
			};
		});
		return present.concat(empty);
	}
}]);

sidelist.controller('itemCtrl', ["$rootScope", "$filter", "$stateParams",
	function($rootScope, $filter, $stateParams) {

		//reset page info on location change
		$rootScope.$on('$locationChangeSuccess', function() {
			if($rootScope.data) {
				$rootScope.data.currentPage = 1;
				$rootScope.updatePageIndexes();
				//				if(!$stateParams.resetFilter) {
				//					$rootScope.data.filterTable = '';
				//				}
				//							console.log('filter data: ', $rootScope.data.filterTable);
			};
		});

		//reset page on filter change
		$rootScope.$on('filterThis', function(event, items) {
			if(items) {
				$rootScope.data.currentPage = 1;
				$rootScope.updatePageIndexes();
			}
		});

		// set the default sort types
		// '-' at the beginning of the string sorts in reverse
		// orderBy: also accepts a boolean to sort in reverse
		// but the boolean sorts all categories in reverse
		// in this case we only want to sort the first category in reverse
		$rootScope.sortType = 'ID';
		// the table will first be sorted by 'sortType' and then by 'secondSortType'
		// followed by 'thirdSortType'
		$rootScope.secondSortType = 'Jingdu';
		$rootScope.thirdSortType = 'Weidu';
		// set the default search/filter term

		$rootScope.data = {
			// pagination settings
			currentPage: 1,
			// max size of the pagination bar
			maxPaginationSize: 10,
			itemsPerPage: 10,
			filterTable: ''
		};

		// update the beginning and end points for shown people
		// this will be called when the user changes page in the pagination bar
		$rootScope.updatePageIndexes = function() {
			//console.log($rootScope.firstIndex);
			$rootScope.firstIndex = ($rootScope.data.currentPage - 1) * $rootScope.data.itemsPerPage;
			$rootScope.lastIndex = $rootScope.data.currentPage * $rootScope.data.itemsPerPage;
			//console.log('Page changed to: ' + $rootScope.data.currentPage);
		};
		$rootScope.updatePageIndexes();

		// return 1 if the element is filtered
		// used to hide elements that do not match the search filter
		$rootScope.filterSort = function(element) {
			if($filter('filter')([element], $rootScope.data.filterTable).length > 0) {
				return 1;
			}
			return 2;
		};

		// string manipulation functions
		// primarily used for sorting the table
		function matchFirstChar(c, string) {
			return(string.charAt(0) == c);
			console.log("not run?");
		}

		function removeFirstChar(string) {
			return string.slice(1);
		}

		function removeDash(label) {
			if(matchFirstChar('-', label)) {
				return removeFirstChar(label);
			}
			return label;
		}

		function addDash(label) {
			if(!matchFirstChar('-', label)) {
				return '-' + label;
			}
			return label;
		}

		// formatting functions
		// for displaying table headers and tooltips
		function capitalizeFirstLetter(string) {
			return string.charAt(0).toUpperCase() + string.slice(1);
		}

		function makeReadableLabel(label) {
			var formatted = label;
			switch(label) {
				case 'Jingdu':
					formatted = 'Jingdu';
					break;
				case 'Weidu':
					formatted = 'Weidu';
			}
			return formatted;
		}

		// sort functions
		// add or remove '-' to sort up or down
		$rootScope.sortReverse = function(set) {
			set = set || false;
			if(set || !matchFirstChar('-', $rootScope.sortType)) {
				$rootScope.sortType = addDash($rootScope.sortType);
			} else {
				$rootScope.sortType = removeDash($rootScope.sortType);
			}
		};

		// sort a column with a single data attribute
		$rootScope.singleSort = function(label) {
			if($rootScope.sortType == label) {
				$rootScope.sortReverse();
			} else {
				$rootScope.sortType = label;
			}
		};

		// sort a column with two data attributes
		// example: first name and last name
		$rootScope.doubleSort = function(label1, label2) {
			if($rootScope.sortType == ('-' + label1)) {
				$rootScope.sortType = label2;
			} else if($rootScope.sortType == ('-' + label2)) {
				$rootScope.sortType = label1;
			} else if($rootScope.sortType != label1 && $rootScope.sortType != label2) {
				$rootScope.sortType = label1;
			} else {
				$rootScope.sortReverse();
			}
		};

		// boolean functions for detecting how a column is sorted
		// used for the up and down carets next to each column header
		$rootScope.sortDescend = function(label1, label2) {
			label2 = label2 || '';
			return($rootScope.sortType == ('-' + label1) || $rootScope.sortType == ('-' + label2));

		};

		$rootScope.sortAscend = function(label1, label2) {
			label2 = label2 || '';
			return($rootScope.sortType == label1 || $rootScope.sortType == label2);
		};

		// show a tooltip displaying how a column is sorted
		$rootScope.sortTooltip = function(label1, label2) {
			label2 = label2 || '';

			var order = 'descending';
			if(matchFirstChar('-', $rootScope.sortType)) {
				order = 'ascending';
			}

			var baseSortType = removeDash($rootScope.sortType);
			if(label1 == baseSortType || label2 == baseSortType) {
				return capitalizeFirstLetter((makeReadableLabel(baseSortType)) + ' ' + order);
			}
			return 'Sort by ' + makeReadableLabel(label1) + ' or ' + makeReadableLabel(label2);
		};
	}
])

sidelist.controller('tabsController', ["$scope", "$http", "$sce", "$localStorage", "$rootScope", "$timeout", "$state", "Host", "$interval",
	function($scope, $http, $sce, $localStorage, $rootScope, $timeout, $state, Host, $interval) {

		/*sidebar lists*/
		function getVehicleList() {
			var url = Host + "/VehicleApiAction_vehicleList.action?";
			var trustedurl = $sce.trustAsResourceUrl(url);
			var params = {
				userAccount: $localStorage.currentUser.username,
				jsession: $localStorage.currentUser.token,
				currentPage: 1,
				pageRecords: $localStorage.record,
				ignoreLoadingBar: true
			};

			return $http.jsonp(trustedurl, {
				params: params
			}).then(function(response) {
				//create sidebar and load device info
				if(!$localStorage.sidelist) {
					$localStorage.sidelist = response.data.vehicles;
					console.log("sidebar lists loaded!");
				} else if(!jsonEqual(response.data.vehicles, $localStorage.sidelist)) {
					$localStorage.sidelist = response.data.vehicles;
					console.log("sidebar/device info updated!", $localStorage.sidelist.length);
				} else {
					//					console.log("sidebar lists didn't change!");
				}
			});
		}

		function jsonEqual(newVal, oldVal) {
			//	console.log(JSON.stringify(newVal) === JSON.stringify(oldVal));

			var first = filterList(newVal);
			var second = filterList(oldVal);
			//	console.log(second);
			//	return JSON.stringify([{a:1},{b:{d:4}},{c:3}]) == JSON.stringify([{a:1},{b:{d:4}},{c:3}]);
			return JSON.stringify(first) == JSON.stringify(second);
		}

		function filterList(lists) {
			var result = lists.map(function(val, i) {
				return {
					chnCount: val.chnCount,
					chnName: val.chnName,
					devGroupId: val.devGroupId,
					devGroupName: val.devGroupName,
					devSubType: val.devSubType,
					devType: val.devType,
					driverName: val.driverName,
					driverTele: val.driverTele,
					factory: val.factory,
					icon: val.icon,
					idno: val.idno,
					ioInCount: val.ioInCount,
					ioInName: val.ioInName,
					userAccount: val.userAccount
				};
			});
			return result;
		};

		function isUserReady() {
			return $localStorage.record;
		};

		/*Update device data*/
		$scope.$watch(isUserReady, function(val) {
			if(val) {
				getVehicleList();
				$scope.UpdatingStatus = $interval(function() {
					getVehicleList();
				}, 10000);
			};
		});

		$rootScope.$on('updateVehiList', getVehicleList);

		$rootScope.$on('reloadVehiList', function() {
			if($scope.UpdatingStatus) {
//				console.log('vehicle list interval canceled');
				$interval.cancel($scope.UpdatingStatus);
			};
		});

		// $scope.orderProp = 'devStatus.online';
		angular.element(document).ready(function() {
			//			console.clear();
			/*console.log($state.current);
			if($state.current.name !== "index") {
				$state.go('index');
			}*/
			//log out if user doesn't log in on a new day
			if($localStorage.currentUser) {
				if(!$localStorage.currentUser.valueOf().expireTime) {
					$localStorage.$reset();
					$state.go('login');
					console.log("Local storage cleared! New login request!");
				} else if($localStorage.currentUser.valueOf().expireTime) {
					var time = $localStorage.currentUser.expireTime;
					if(compareExpireTime(time)) {
						swal({
							title: "Your token has Expired",
							text: "Please login again.",
							type: "info",
							confirmButtonColor: '#d33',
							confirmButtonText: 'Sign Out',
							allowOutsideClick: false,
							allowEscapeKey: false
						}).then(function() {
							$localStorage.$reset();
							$state.go('login');
							console.log("Local storage cleared! New login request!");
						});
					};
				} else if($localStorage.currentUser.valueOf().token) { //keep user logged in after page refresh
					$http.defaults.headers.common.Authorization = 'Bearer ' + $localStorage.currentUser.token;
				};
			};
		});

		function compareExpireTime(expireTime) {
			var now = new Date();
			now = now.getTime();

			//			console.log(yesterDay, expireTime);
			return now >= expireTime; //login time is more than one day
			//				console.log(new Date((time + (28800 * 1000))));
			//			return now > (time + (28800 * 1000));
		};
	}
]);