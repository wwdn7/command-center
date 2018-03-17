 'use strict';

 /**
  * Route configuration for the PVision module.
  */
 angular
 	.module('PVision')
 	.config(['$stateProvider', '$urlRouterProvider', '$httpProvider', '$qProvider', 'cfpLoadingBarProvider', 'ChartJsProvider', 'toastrConfig', '$indexedDBProvider',
 		function($stateProvider, $urlRouterProvider, $httpProvider, $qProvider, cfpLoadingBarProvider, ChartJsProvider, toastrConfig, $indexedDBProvider) {
 			AWS.config.update({
 				region: "eu-west-1",
 				accessKeyId: "AKIAIJYXNETJGSLIYNVQ",
 				secretAccessKey: "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"
 			});

// 			AWS.config.credentials = new AWS.CognitoIdentityCredentials({
// 				IdentityPoolId: "eu-west-1_LavxZbany",
// 				RoleArn: "arn:aws:cognito-idp:eu-west-1:444235434904:userpool/eu-west-1_LavxZbany"
// 			});

 			//Config index database
 			$indexedDBProvider
 				.connection('PVDatabase')
 				.upgradeDatabase(1, function(event, db, tx) {
 					var alertStore = db.createObjectStore('alerts', {
 						keyPath: 'armTime'
 					});
 					alertStore.createIndex('type_idx', 'armType', {
 						unique: false
 					});
 					alertStore.createIndex('time_idx', 'devIdno', {
 						unique: false
 					});
 					alertStore.createIndex('name_str', 'devName', {
 						unique: false
 					});
 					alertStore.createIndex('info_idx', 'armInfo', {
 						unique: false
 					});
 					alertStore.createIndex('coor_obj', 'coordinates', {
 						unique: false
 					});
 					alertStore.createIndex('sudu_str', 'speed', {
 						unique: false
 					});
 					alertStore.createIndex('miles_str', 'mileage', {
 						unique: false
 					});
 					alertStore.createIndex('chk_bol', 'checked', {
 						unique: false
 					});
 				});

 			//Toaster Config
 			angular.extend(toastrConfig, {
 				tapToDismiss: false,
 				closeButton: true,
 				closeHtml: '<button>&times;</button>',
 				allowHtml: true,
 				maxOpened: 3,
 				newestOnTop: true,
 				timeOut: 0,
 				positionClass: 'toast-bottom-right'
 			});

 			//chart.js
 			(function(ChartJsProvider) {
 				ChartJsProvider.setOptions({
 					colors: ['#000', '#00ADF9', '#DCDCDC', '#46BFBD', '#FDB45C', '#949FB1', '#4D5360']
 				});
 			});

 			/*Chartjs Global settings*/
 			Chart.defaults.global.defaultFontColor = '#fff';

 			Chart.defaults.global.colors = [{
 				backgroundColor: 'rgba(255, 100, 0, 1)',
 				pointBackgroundColor: 'rgba(255, 100, 0, 1)',
 				pointHoverBackgroundColor: 'rgba(151,187,205,1)',
 				pointHoverBorderColor: 'rgba(151,187,205,1)'
 			}, {
 				backgroundColor: 'rgba(255, 150, 0, 1)',
 				pointBackgroundColor: 'rgba(255, 150, 0, 1)',
 				pointHoverBackgroundColor: 'rgba(151,187,205,1)',
 				pointHoverBorderColor: 'rgba(151,187,205,1)'
 			}];

 			//config loading bar
 			cfpLoadingBarProvider.latencyThreshold = 300;
 			cfpLoadingBarProvider.parentSelector = '#main-view';

 			//disalarm Possibly unhandled rejection
 			$qProvider.errorOnUnhandledRejections(false);

 			// Default with credential to all methods
 			$httpProvider.defaults.withCredentials = true;

 			//Http Intercpetor to check auth failures for xhr requests
 			$httpProvider.interceptors.push('unauthorisedInterceptor');

 			// For unmatched routes
 			$urlRouterProvider.otherwise('/');

 			// Application routes
 			$stateProvider
 				.state('main', {
 					templateUrl: 'templates/main.html',
 					abstract: true
 				})
 				.state('index', {
 					url: '/',
 					templateUrl: 'templates/pages/dashboard.html',
 					parent: 'main',
 				})
 				.state('login', {
 					url: '/auth/',
 					templateUrl: 'templates/login.html',
 					controller: 'loginCtroller',
 					controllerAs: 'vm'
 				})
 				.state('redirect', {
 					url: '/redirecting/',
 					templateUrl: 'templates/redirect.html',
 					controller: 'redirectCtl'
 				})
 				.state('resetPassword', {
 					url: '/reset-password/',
 					templateUrl: 'templates/reset-password.html',
 					controller: 'resetPWCtroller',
 					controllerAs: 'rp'
 				})
 				.state('tables', {
 					url: '/tables/',
 					templateUrl: 'templates/pages/tables.html',
 					parent: 'main'
 				})
 				.state('ref', {
 					url: '/ref/',
 					templateUrl: 'templates/dashboardElement.html',
 					parent: 'main'
 				})
 				.state('detail', {
 					url: '/detail/',
 					templateUrl: 'templates/pages/vehicle-detail.html',
 					params: {
 						id: null
 					},
 					parent: 'main'
 				})
 				.state('list', {
 					url: '/list/',
 					templateUrl: 'templates/pages/vehicle-list.html',
 					//          	params: {resetFilter: true},
 					parent: 'main'
 				})
 				.state('alert-list', {
 					url: '/alert-list/',
 					templateUrl: 'templates/pages/alert-list.html',
 					params: {
 						records: null,
 						type: null,
 						lastWeek: null
 					},
 					parent: 'main'
 				})
 				.state('alert-detail', {
 					url: '/alert-detail/',
 					templateUrl: 'templates/pages/alert-detail.html',
 					parent: 'main'
 				})
 				.state('hardware-issue', {
 					url: '/hardware-issue/',
 					templateUrl: 'templates/pages/hardware-issue.html',
 					//          	params: {id:null},
 					parent: 'main'
 				})
 				.state('view-map', {
 					url: '/view-map/',
 					templateUrl: 'templates/pages/view-map.html',
 					parent: 'main'
 				})
 				.state('track', {
 					url: '/track/',
 					templateUrl: 'templates/pages/track.html',
 					params: {
 						id: null,
 						start: null,
 						end: null,
 						armInfo: 0
 					},
 					parent: 'main'
 				})
 				.state('record', {
 					url: '/record/',
 					templateUrl: 'templates/pages/record.html',
 					params: {
 						id: null,
 						date: null,
 						start: null,
 						end: null,
 						timeBegin: null,
 						timeEnd: null
 					},
 					parent: 'main'
 				})
 				.state('account', {
 					url: '/account/',
 					templateUrl: 'templates/pages/account.html',
 					parent: 'main'
 				})
 				.state('grouping', {
 					url: '/vehicle-group/',
 					templateUrl: 'templates/pages/vehicle-group.html',
 					controller: 'groupingCtrl',
 					parent: 'main'
 				})
 				.state('manageVehicle', {
 					url: '/vehicle/',
 					templateUrl: 'templates/pages/manage-vehicle.html',
 					parent: 'main'
 				})
 				.state('manageDriver', {
 					url: '/driver/',
 					templateUrl: 'templates/pages/manage-driver.html',
 					parent: 'main'
 				})
 				.state('ErrorPage', {
 					url: '/404/',
 					templateUrl: 'templates/404.html',
 					controller: '404Ctrl'
 				})

 		}
 	]);