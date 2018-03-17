var list = angular.module('PVision');
list.constant('keywordsH', ['Missing Hard Drive', 'No GPS Data', 'Lost Connection', 'Camera Not Recording', 'No Events']);
list.controller('hardware-issue', ["$scope", "$filter", "swal", "vehiStatus", "$rootScope", "$state", "$compile", 'filterService', 'keywordsH', 'exportService', '$localStorage', '$q', 'deviceStorage',
	function($scope, $filter, swal, vehiStatus, $rootScope, $state, $compile, filterService, keywordsH, exportService, $localStorage, $q, deviceStorage) {

		var excelOption = {
			formats: ['xlsx'],
			headers: true,
			exportButtons: false,
			ignoreCols: [0, 8],
			filename: 'hardware issue',
			bootstrap: true
		};

		exportService.setOption(excelOption);

		//Clear search data
		$scope.$on('$locationChangeSuccess', function() {
			$rootScope.data.filterTable = '';
		});

		filterService.config({
			initKeywords: keywordsH
		});

		$scope.$on('highlightIssue', function(event, id) {
			//		console.log(angular.element('.hardware-issue-table .id' + id));
			//	angular.element('.hardware-issue-table .id' + id).addClass('danger');
			if($scope.vehicles) {
				//    console.log("vehicle hardware issue list ", $scope.vehicles);
				$scope.vehicles = filterService.filterAlert($scope.initData, id);
				//    console.log("vehicle hardware issue list ", $scope.vehicles);

				$scope.vehicles.some(function(val, i) {
					if(val.devStatus.devIdno === id) {
						//					console.log(Math.ceil(i/10));
						$rootScope.data.currentPage = Math.ceil((i + 1) / 10);
						$rootScope.updatePageIndexes();
						return true;
					};
				});
			};
			/*	$scope.$on('highlightIssue', function(event, newID) {
					if(newID !== id) {
						angular.element('.hardware-issue-table .id' + id).removeClass('danger');
					}
				});
			*/
		});

		$scope.vehicles = [];

		function initVehicleData(data) {
			var vehicles = data.filter(function(val, i) {
				return val.hardwareInfo && val.hardwareInfo !== "Device Not Found!";
			});

			filterService.config({
				initData: vehicles
			});

			$scope.vehicles = vehicles;
			$scope.initData = vehicles;
		}

		var unbind = $scope.$watch('items', function(newVal) {
			//								console.log(newVal);
			if(newVal) {
				initVehicleData(newVal);
				//				console.log($scope.vehicles);
				unbind();
				$scope.$on('filterThis', function(event, arr) {
					$scope.vehicles = filterService.filterThis(arr);
				});
			}
		});

		$scope.getWarn = function(status, index) {
			if(angular.isArray(status)) {
				switch(index) {
					case 1:
						var stri = "";
						status.some(function(val) {
							if(val == "Lost Connection") {
								stri = "highlight-issue"
							};
							return val == "Lost Connection";
						});
						return stri;
						break;
					case 2:
						var stri = "";
						status.some(function(val) {
							if(val == "No GPS Data") {
								stri = "highlight-issue"
							};
							return val == "No GPS Data";
						});
						return stri;
						break;
					case 3:
						var stri = "";
						status.some(function(val) {
							if(val == "Missing Hard Drive") {
								stri = "highlight-issue"
							};
							return val == "Missing Hard Drive";
						});
						return stri;
						break;
					case 4:
						var stri = "";
						status.some(function(val) {
							if(val == "Camera Not Recording") {
								stri = "highlight-issue"
							};
							return val == "Camera Not Recording";
						});
						return stri;
						break;
					case 5:
						var stri = "";
						status.some(function(val) {
							if(val == "No Events") {
								stri = "highlight-issue"
							};
							return val == "No Events";
						});
						return stri;
						break;
				}
			}
		}

		$scope.showVehicle = function(id) {
			$state.go('detail', {
				id: id
			});
			console.log(id);
		}

		$scope.trackVehicle = function(id) {
			$state.go('track', {
				id: id
			});
			console.log(id);
		}

		$scope.playVehicle = function(id) {
			$state.go('record', {
				id: id
			});
			console.log(id);
		}

		function convertIssue(err) {
			var result = [];

			err.map(function(val) {
				if(val.selected) {
					switch(val.name) {
						case "Lost Connection":
							result.push(1);
							break;
						case "No GPS Data":
							result.push(2);
							break;
						case "Missing Hard Drive":
							result.push(3);
							break;
						case "Camera Not Recording":
							result.push(4);
							break;
						case "No Events":
							result.push(5);
							break;
						default:
							break;
					};
				}
			});

			return result;
		}

		function convertToIssue(err) {
			var result = [];

			err.map(function(num) {
				switch(num) {
					case 1:
						result.push("Lost Connection");
						break;
					case 2:
						result.push("No GPS Data");
						break;
					case 3:
						result.push("Missing Hard Drive");
						break;
					case 4:
						result.push("Camera Not Recording");
						break;
					case 5:
						result.push("No Events");
						break;
					default:
						break;
				}
			});

			return result;
		}

		$scope.disalarm = function(name, hderr, idno) {

			if($localStorage.alarminfo['device' + idno]) {
				var issues = convertToIssue($localStorage.alarminfo['device' + idno]);
			}

			$scope.errors = hderr.map(function(val) {
				return {
					name: val,
					selected: false
				}
			});

			if(issues) {
				issues.map(function(iss) {
					$scope.errors.push({
						name: iss,
						selected: true
					});
				});
			}

			swal({
				title: 'Disalarm ' + name,
				confirmButtonText: 'Submit',
				showCancelButton: true,
				html: 'Please select false alarm then submit to hide it.' +
					'<form><div ng-repeat="err in errors" class="swal-checkbox-container"><input type="checkbox" name="hderror" ng-value="err.name" ng-model="err.selected">{{err.name}}</div></form>',
				showLoaderOnConfirm: true,
				preConfirm: function(html) {
					return $q(function(resolve, reject) {
						var docClient = new AWS.DynamoDB.DocumentClient();
						var disalarm = convertIssue($scope.errors);
						//						console.log(disalarm, $scope.errors);

						var params = {
							TableName: 'user_config',
							Key: {
								'username': $localStorage.currentUser.username,
								'user_role': $localStorage.currentUser.roleName
							},
							UpdateExpression: "set hardware.device" + idno + " = :a",
							ExpressionAttributeValues: {
								":a": disalarm
							},
							ReturnValues: "UPDATED_NEW"
						};

						return docClient.update(params, function(err, data) {
							if(err) {
								console.log('update failed', err);
								reject('Please try again.');
							} else {
								console.log('update success', data);
								resolve();
							}
						});
					});
				}
			}).then(function(result) {
				if(result) {
					deviceStorage.reloadAlarminfo();
					swal({
						type: 'success',
						title: 'Succeed!',
						text: 'Please reload page',
						confirmButtonText: 'Reload',
						allowOutsideClick: false,
						allowEscapeKey: false
					}).then(function() {
						$rootScope.$broadcast('reloadVehiList');
						$state.reload();
					});
				}
			});

			var target = document.getElementById('swal2-content');
			$compile(target)($scope);
		}

	}
]);
