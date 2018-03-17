/**
 * The authentication service is used for logging in and out of the application, 
 * to login it posts the users credentials to the api and checks 
 * if there's a jwt token in the response, if so the login is successful 
 * so the user details are stored in local storage and the token is added to the 
 * http authorization header for all requests made by the $http service.
 */

angular
	.module('PVision')
	.factory('AuthenticationService', ['$http', '$localStorage', '$sce', 'Host', '$rootScope', 'allDevIDs', 'totalRecords', 'vehicleInfoServices',
		function($http, $localStorage, $sce, Host, $rootScope, allDevIDs, totalRecords, vehicleInfoServices) {
			var service = {};

			service.Login = Login;
			service.Logout = Logout;

			return service;

			function Login(username, password, callback) {
				username = username.toLowerCase();
				
				var lol = Host + "/LoginApiAction_login.action";
				var trustedurl = $sce.trustAsResourceUrl(lol);
				var params = {
					userAccount: username,
					password: password,
					ignoreLoadingBar: true
				};
				$http.jsonp(trustedurl, {
						params: params,
						jsonpCallbackParam: 'callback'
					})
					.then(function successCallback(response) {
						//						console.log(response);

						//broadcast and request currentalerts
						$rootScope.$broadcast('NotifyUpdated');
						if($localStorage.currentUser) {
							if($localStorage.currentUser.valueOf().username !== username) {
								$localStorage.$reset();
								console.log("local storage cleared!");
							} else if($localStorage.currentUser.valueOf().expireTime) {
								var time = $localStorage.currentUser.valueOf().expireTime;
								if(isExpired(time)) {
									$localStorage.$reset();
									console.log("local storage cleared!");
								};
							} else if(!$localStorage.currentUser.valueOf().expireTime) {
								$localStorage.$reset();
								console.log("local storage cleared!");
							};
						};

						//login successful if there's a token in the response
						if(response.data.jsession) {
							var time = getExpireTime();
							var userRole;

							if(response.data.roleName) {
								userRole = response.data.roleName;
							} else {
								userRole = "Admin";
							}

							//store username and token in local storage to keep user logged in between page refreshes
							$localStorage.currentUser = {
								username: username,
								token: response.data.jsession,
								expireTime: time,
								isAdmin: response.data.isAdmin,
								playback: response.data.Playback,
								video: response.data.video,
								roleName: userRole
							};

							//add jet token to auth header for all requests made by the $http service
							$http.defaults.headers.common.Authorization = 'Bearer' + response.data.jsession;

							var docClient = new AWS.DynamoDB.DocumentClient();

							var now = moment().format();

							var params = {
								TableName: 'user_config',
								Key: {
									'username': username,
									'user_role': userRole,
								},
								ProjectionExpression: 'username'
							};

							vehicleInfoServices.getip().then(function(user) {
//								console.log(user);
								var ip = 'Not Available';
								var userCity = 'Not Available';
								
								if(user.data.ip) {
									ip = user.data.ip;
								}
								
								if(user.data.city) {
									userCity = user.data.city;
								}
								
								docClient.get(params, function(err, data) {
									if(err) {
										console.log('error occured', err);
									} else if(data.Item) {
										console.log('user config already exists');
										var updates = {
											Key: {
												'username': username,
												'user_role': userRole,
											},
											TableName: 'user_config',
											UpdateExpression: 'set #lastlogin = :ll',
											ExpressionAttributeNames: {
												'#lastlogin': 'lastlogin'
											},
											ExpressionAttributeValues: {
												':ll':  {
													'logtime': now,
													'userip': ip,
													'usercity': userCity
												}
											},
											ReturnValues: 'UPDATED_NEW'
										};
										docClient.update(updates, function(err, data) {
											if(err) {
												console.log('error update database: ', err);
											} else {
												console.log('succeed add to database', data);
											}
										});
									} else {
										var params = {
											Item: {
												'username': username,
												'user_role': userRole,
												'hardware': {},
												'lastlogin': {
													'logtime': now,
													'userip': ip,
													'usercity': userCity
												}
											},
											TableName: 'user_config'
										};

										docClient.put(params, function(err, data) {
											if(err) {
												console.log('error addding database: ', err);
											} else {
												console.log('succeed add to database', data);
											}
										});
									}
								});
							}, function(err) {
								console.log('login failed', err);
							});

							//excute callback with true to indicate successful login
							callback(true);

						} else {
							//excute callback with false to indicate failed login
							callback(false);
						};
					}, function errorCallback(data) {
						console.log(data);
						//						$scope.data = "request fail!";
					});
			}

			function Logout() {

				//remove user from local stroage and clear http auth header
				//delete $localStorage.currentUser;
				if($localStorage.currentUser) {
					if($localStorage.currentUser.valueOf().token) {

						var lol = Host + "/LoginApiAction_logout.action";
						var trustedurl = $sce.trustAsResourceUrl(lol);
						var params = {
							jsession: $localStorage.currentUser.token
						}

						$http.jsonp(trustedurl, {
							params: params
						}).then(function(result) {
							console.log('loggout: ', result.data.result);
						});
						delete $localStorage.currentUser.valueOf().token;
					}
				}

				for(var prop in $rootScope) {
					if(prop.substring(0, 1) !== '$') {
						delete $rootScope[prop];
					}
				}

				totalRecords.record = undefined;
				allDevIDs.deviceMap = undefined;

				$http.defaults.headers.common.Authorization = '';

				$rootScope.$broadcast('reloadVehiList');
			}

			function getExpireTime() {
				var now = new Date();
				var plus24hrs = new Date();

				plus24hrs.setDate(now.getDate() + 1);
				plus24hrs = plus24hrs.getTime();

				return plus24hrs;
			}

			function isExpired(expireTime) {
				var now = new Date();
				now = now.getTime();

				return now >= expireTime;
			};

		}
	]);