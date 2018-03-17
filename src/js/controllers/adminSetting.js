/**
 *Secret Menu 
 */

angular
	.module('PVision')
	.controller('godmode', ['$scope', "swal", "vehicleInfoServices", "$q", "$compile", "allDevIDs", godmode]);

function godmode($scope, swal, vehicleInfoServices, $q, $compile, allDevIDs) {
	$scope.roleID, $scope.userid;

	$scope.roles = [{
			name: 'PeaceOfMind',
			code: '1,2,21,22,51',
			selected: false
		},
		{
			name: 'Mornitoring',
			code: '1,2,21,22,631,31,51',
			selected: false
		},
		{
			name: 'Streaming',
			code: '1,2,21,22,31,621,51,631',
			selected: false
		},
		{
			name: 'LiveManagement',
			code: '1,2,21,22,631,31,621,641,51',
			selected: false
		}
	];

	$scope.addSubAcc = function() {
		swal.setDefaults({
			showCancelButton: true,
			animation: false,
			progressSteps: ['1', '2', '3'],
			allowOutsideClick: false,
			allowEscapeKey: false

		});

		var steps = [{
				title: 'Create User Permission',
				confirmButtonText: 'Next →',
				showLoaderOnConfirm: true,
				html: 'Please note that this function only apply for user role & username not created yet or the user role already in use.' +
					'<div ng-repeat="role in roles"><input class="vehi-radio" type="radio" name="icon" ng-model="role.selected" ng-value="true">&nbsp;{{role.name}}<br></span>',
				preConfirm: function(html) {
					return $q(function(resolve, reject) {

						return $scope.roles.some(function(val) {
							if(val.selected == true) {
								return vehicleInfoServices.addRole(val.name, val.code).then(function(result) {
									if(result.data.result == 0) {
										$scope.roleID = result.data.roleID;
										resolve();
										return true;
									} else if(result.data.result == 22) {
										vehicleInfoServices.listAllUser().then(function(response) {
											if(response.data.result === 0) {
												response.data.users.some(function(user) {
													if(user.userRole.name == val.name) {
														$scope.roleID = user.userRole.id;
//														console.log($scope.roleID);
														resolve();
														return true;
													}
												})
											}
										});
									} else {
										reject('please contact Cong Pong for help1');
									}
								}, function(err) {
									reject('please contact Cong Pong for help2');
								});
							}
						});
					});
				}
			},
			{
				title: 'Add new User',
				confirmButtonText: 'Next →',
				text: 'Please enter username you want to add, if you want to modify user data, you shall use original platform.',
				input: 'text',
				showLoaderOnConfirm: true,
				preConfirm: function(text) {
					return $q(function(resolve, reject) {
						return vehicleInfoServices.addUser(text, $scope.roleID).then(function(result) {
							if(result.data.result == 0) {
//								console.log(result);
								$scope.userid = result.data.userId;
								resolve();
							} else {
								reject('please contact Cong Pong for help3');
							}
						}, function(err) {
							console.log(err);
							reject('please contact Cong Pong for help4');
						});
					});
				}
			},
			{
				title: 'Allocate All Devices',
				confirmButtonText: 'Sumit',
				text: 'This will allocate all devices to the user you just created, you can modify it on original platform or go upstairs and ask Cong.',
				showLoaderOnConfirm: true,
				preConfirm: function(text) {
					return $q(function(resolve, reject) {

						if(allDevIDs.deviceMap) {
							var devids = allDevIDs.deviceMap.keys();

							var ids = Array.from(devids).join(',');
						} else {
							reject('no device added, please go to management platform.');
						}

						return vehicleInfoServices.allocateAllDevice($scope.userid, ids).then(function(result) {
							if(result.data.result == 0) {
								resolve();
							} else {
								reject('please contact Cong Pong for help5');
							}
						}, function(err) {
							console.log(err);
							reject('please contact Cong Pong for help6');
						});
					});
				}
			}
		];

		swal.queue(steps).then(function(result) {
			swal.resetDefaults();
			swal('Succeed!', 'Thank you for using godmode.', 'success');
		}, function(err) {
			swal.resetDefaults();
		});

		var target = document.getElementById('swal2-content');
		$compile(target)($scope);
	}

}