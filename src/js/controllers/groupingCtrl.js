'use strict';

(function() {

	angular.module('PVision')
		.controller('groupingCtrl', ['$scope', '$rootScope', '$timeout', 'vehicleInfoServices', '$localStorage', 'swal', '$q', '$state', '$sessionStorage',
			function($scope, $rootScope, $timeout, vehicleInfoServices, $localStorage, swal, $q, $state, $sessionStorage) {
				$scope.vehicleGroup = [];

				var unbindGroup = $scope.$watch('vehicleGroup', function(val) {
					if(val.length > 0) {
						val.map(function(group) {
							if(!$sessionStorage['group' + group.id]) {
								$sessionStorage['group' + group.id] = "on";
								$scope['group' + group.id] = true;
							} else {
								switch($sessionStorage['group' + group.id]) {
									case 'on':
										$scope['group' + group.id] = true;
										break;
									case 'off':
										$scope['group' + group.id] = false;
										break;
									default:
										$scope['group' + group.id] = false;
										break;
								}
//								console.log($sessionStorage['group' + group.id], $scope['group' + group.id], group);
							}
						})
						unbindGroup();
					}
				});

				$scope.unGroupedTree = {
					//					accept: function(sourceNodeScope, destNodesScope, destIndex) {
					//						console.log(sourceNodeScope, destNodesScope, destIndex);
					//						return true;
					//					},
					dragStop: function(event) {
						var sourceGroupName = event.source.nodesScope.$parent.$modelValue.name;
						var destgroupName = event.dest.nodesScope.$parent.$modelValue.name;
						var vehiID = event.source.nodeScope.$modelValue.idno;

						//						console.log("from UNgrouped tree: ", event, sourceGroupName, destgroupName);

						if(destgroupName !== sourceGroupName) {
//							console.log(event.dest.nodesScope.$parent.$modelValue.id);
							var destGroupID = event.dest.nodesScope.$parent.$modelValue.id;
							vehicleInfoServices.moveVehiGroup(vehiID, destGroupID).then(function(response) {
								//								console.log(response);
								if(response.data.result == 0) {
									$rootScope.$broadcast('updateVehiList');
									//									updateVehiGroup();
//									console.log('success moved! vehicle: ', vehiID, " to: ", destgroupName);
									//									$state.reload();
								} else {
									swal({
										type: 'error',
										title: 'Please try again',
									}).then(function() {
										$rootScope.$broadcast('reloadVehiList');
										$state.reload();
									});
								}
							});
						}
						return true;
					},
				};

				$scope.groupedTree = {
					dragStop: function(event) {
						var sourceGroupName = event.source.nodesScope.$parent.$modelValue.name;
						var destgroupName = event.dest.nodesScope.$parent.$modelValue.name;
						var vehiID = event.source.nodeScope.$modelValue.idno;
//						console.log("from grouped tree: ", event, sourceGroupName, destgroupName, vehiID);
						if(destgroupName === "Others") {
							vehicleInfoServices.removeVehiGroup(vehiID).then(function(response) {
								if(response.data.result == 0) {
									$rootScope.$broadcast('updateVehiList');
									//									updateVehiGroup();
									//TODO is there a better way?
									//									$rootScope.$broadcast('updateVehiList');
									//									updateVehiGroup();
//									console.log('vehicle successfully removed', vehiID);
								} else {
									swal({
										type: 'error',
										title: 'Please try again',
									}).then(function() {
										$rootScope.$broadcast('reloadVehiList');
										$state.reload();
									});
								}
							})
						} else if(destgroupName !== sourceGroupName) {
							var destGroupID = event.dest.nodesScope.$parent.$modelValue.id;
							vehicleInfoServices.moveVehiGroup(vehiID, destGroupID).then(function(response) {
								//								console.log(response);
								if(response.data.result == 0) {
									$rootScope.$broadcast('updateVehiList');
									//									updateVehiGroup();
									//									$rootScope.$broadcast('updateVehiList');
									//									updateVehiGroup();
									console.log('success moved! vehicle: ', vehiID, " from: ", sourceGroupName, " to: ", destgroupName);
									//									$state.reload();
								} else {
									swal({
										type: 'error',
										title: 'Please try again',
									}).then(function() {
										$rootScope.$broadcast('reloadVehiList');
										$state.reload();
									});
								}
							});
						}
						return true;
					},
				};

				function updateVehiGroup() {
					vehicleInfoServices.queryVehiGroup().then(function(result) {
						if(result.data.result == 0) {
							$scope.vehicleGroup = result.data.groups.map(function(group, i) {
								group.listDevice = [];
								$localStorage.sidelist.map(function(device, j) {
									if(group.id === device.devGroupId) {
										group.listDevice.push({
											idno: device.idno,
											devName: device.userAccount.name
										});
									}
								});
								return group;
							});
						} else {
							swal({
								type: 'error',
								title: 'Please try again',
							}).then(function() {
								$rootScope.$broadcast('reloadVehiList');
								$state.reload();
							});
						}
					});
				};

				updateVehiGroup();

				function getSidelist() {
					return $localStorage.sidelist;
				};

				$scope.$watch(getSidelist, updateVehiGroup);

				function getVehicleGroup() {
					return angular.element('.sidebar').scope().sideLists;
				}

				var unbind = $scope.$watch(getVehicleGroup, function(val) {
					if(val) {

						//						unbind();

						var groups = val.filter(function(group) {
							return group.name === "Others";
						});

						//						console.log(groups);
						if(groups.length < 1) {
							$scope.data = [{
								key: 0,
								name: "Others",
								val: []
							}]
						} else {

							$scope.data = angular.copy(groups);

							$scope.data[0].val = $scope.data[0].val.map(function(device) {
								return {
									idno: device.idno,
									devName: device.userAccount.name
								}
							});
						}
					}
				});

				$scope.addGroup = function() {
					swal({
						title: "Add New Group",
						input: "text",
						type: "info",
						showCancelButton: true,
						cancelButtonText: 'Cancel',
						confirmButtonColor: '#d33',
						confirmButtonText: 'OK',
						allowOutsideClick: false,
						allowEscapeKey: false,
						preConfirm: function(text) {
							return $q(function(resolve, reject) {
								var isTaken = $scope.vehicleGroup.some(function(val) {
									if(val.name === text) {
										return true;
									}
								});

								if(isTaken) {
									return reject(text + ' has already been taken.');
								} else if(text.length < 1) {
									return reject('Please enter valid group name.');
								} else {
									return vehicleInfoServices.addVehiGroup(text).then(function(response) {
										if(response.data.result == 0) {
											console.log("group " + text + "ID: " + "scope.group.id" + " added");
											resolve();
										} else {
											reject('Please try again.');
										}
									});
								}
							});
						},
						showLoaderOnConfirm: true,
					}).then(function(result) {
						if(result) {
							swal({
								type: 'success',
								title: 'Group "' + result + '" has been added!',
								allowOutsideClick: false,
								allowEscapeKey: false
							}).then(function() {
								$rootScope.$broadcast('reloadVehiList');
								$state.reload();
							})
						}
					});
				}

				$scope.deleteGroup = function(scope) {
					//					console.log(scope);
					swal({
						title: "Delete Group " + scope.group.name,
						text: "Please confirm your action.",
						type: "info",
						showCancelButton: true,
						cancelButtonText: 'Cancel',
						confirmButtonColor: '#d33',
						confirmButtonText: 'Yes, Delete it!',
						allowOutsideClick: false,
						allowEscapeKey: false,
						preConfirm: function(text) {
							return $q(function(resolve, reject) {
								return vehicleInfoServices.deleteVehiGroup(scope.group.id).then(function(result) {
									if(result.data.result == 0) {
										scope.remove();
//										console.log("group '" + scope.group.name + "' ID: " + scope.group.id + " deleted");
										resolve(scope.group.name);
									} else if(result.data.result == 29) {
										reject("The group is in use at the moment, please remove all the vehicles or contact administrator.");
									} else {
										reject("Please try again");
									}
								});
							});
						},
						showLoaderOnConfirm: true,
					}).then(function(result) {
						if(result) {
							swal({
								type: 'success',
								title: 'Group "' + result + '" has been deleted!',
								allowOutsideClick: false,
								allowEscapeKey: false
							}).then(function() {
								$rootScope.$broadcast('reloadVehiList');
								$state.reload();
							})
						}
					});
				};

				$scope.editGroup = function(id) {
					swal({
						title: "Edit Group name",
						input: "text",
						type: "info",
						showCancelButton: true,
						cancelButtonText: 'Cancel',
						confirmButtonColor: '#d33',
						confirmButtonText: 'OK',
						allowOutsideClick: false,
						allowEscapeKey: false,
						preConfirm: function(text) {
							return $q(function(resolve, reject) {
								var isTaken = $scope.vehicleGroup.some(function(val) {
									if(val.name === text) {
										return true;
									}
								});

								if(isTaken) {
									return reject(text + ' has already been taken.');
								} else if(text.length < 1) {
									return reject('Please enter valid group name.');
								} else {
									return vehicleInfoServices.editVehiGroup(text, id).then(function(response) {
										if(response.data.result == 0) {
//											console.log("group " + text + "ID: " + "scope.group.id" + " edited");
											resolve();
										} else {
											reject("Please try again");
										}
									});
								}
							});
						},
						showLoaderOnConfirm: true,
					}).then(function(result) {
						if(result) {
							swal({
								type: 'success',
								title: 'Group "' + result + '" has been updated!',
							}).then(function() {
								$rootScope.$broadcast('reloadVehiList');
								$state.reload();
							})
						}
					});
				}
				
				$scope.isCollapsed = function(id) {
					return $scope['group' + id];
				}
				
				$scope.toggleGroup = function(scope, id) {
					$scope['group' + id] = !$scope['group' + id];
					if(angular.isDefined($sessionStorage['group' + id])) {
						if($scope['group' + id]) {
							$sessionStorage['group' + id] = 'on';
						} else {
							$sessionStorage['group' + id] = 'off';
						}
					}
					//					console.log($sessionStorage['group' + id], $scope['group' + id]);
					scope.toggle();
				};

				$scope.collapseAll = function() {
					$scope.vehicleGroup.map(function(group) {
						$sessionStorage['group' + group.id] = "on";
						$scope['group' + group.id] = true;
					});
					
					angular.element(".tree-node-content").map(function(i, elem) {
						if(elem.innerText !== " Ungrouped Vehicles") {
							//							console.log(angular.element(elem).scope());
							angular.element(elem).scope().collapse();
						}
					});
				};

				$scope.expandAll = function() {
					$scope.vehicleGroup.map(function(group) {
						$sessionStorage['group' + group.id] = "off";
						$scope['group' + group.id] = false;
					});
					
					angular.element(".tree-node-content").map(function(i, elem) {
						if(elem.innerText !== " Ungrouped Vehicles") {
							//							console.log(angular.element(elem).scope());
							angular.element(elem).scope().expand();
						}
					});
					//					$scope.$broadcast('angular-ui-tree:expand-all');
				};

			}
		]);

}());