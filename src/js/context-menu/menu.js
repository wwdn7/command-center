angular
	.module('ContextMenu', ['ui.bootstrap'])
	.controller('menuCtrl', ['$compile', 'menuService', '$scope', '$indexedDB', 'vehiStatus', 'swal', 'valTransfer', '$state', '$rootScope', '$timeout', menuCtrl])
	.factory('menuService', ['SIDEMENU', menuService])
	.run(['SIDEMENU', 'menuService', '$compile', '$rootScope', function(SIDEMENU, menuService, $compile, $rootScope, $timeout) {
		var sidemenu = angular.element(SIDEMENU);

		angular.element(document).ready(function() {
			var target = angular.element(SIDEMENU);
			target.appendTo('body');
			$compile(target)($rootScope);
		});
	}])
	.constant('SIDEMENU', '<div ng-controller="menuCtrl" id="menu" style="z-index: 1065; position: absolute; display:none;">' +
		'<ul class="dropdown-menu" role="menu" aria-labelledby="single-button" style="display:block; top:0;">' +
		'<li role="menuitem" class="menu-item">' +
		'<a class="menu-link" href="javascript:void(0)" menu-click="show">More Information</a>' +
		'</li>' +
		'<li role="menuitem" class="menu-item">' +
		'<a class="menu-link" href="javascript:void(0)" menu-click="track">Go to Fleeting Tracking</a>' +
		'</li>' +
		'<li role="menuitem" class="menu-item">' +
		'<a class="menu-link" href="javascript:void(0)" menu-click="play">Go to Record View</li>' +
		'</ul>' +
		'</div>')
	.directive('modalContextMenu', ['menuService', 'SIDEMENU', '$compile',
		function(menuService, SIDEMENU, $compile) {
			return {
				restrict: 'A',
				link: function($scope, $ele, $attr) {
					//					console.log($ele);
					$ele.bind("contextmenu", function(e) {
						e.preventDefault();
					});
				}
			};
		}
	]);

function menuCtrl($compile, menuService, $scope, $indexedDB, vehiStatus, swal, valTransfer, $state, $rootScope) {

	/**
	 * Variables.
	 */
	var contextMenuClassName = "menu";
	var contextMenuItemClassName = "menu-item";
	var contextMenuLinkClassName = "menu-link";
	var contextMenuActive = "menu-active";

	var taskItemClassName = "notification-item-alarm";
	var taskItemInContext;

	var clickCoords;
	var clickCoordsX;
	var clickCoordsY;

	var menu = angular.element('#menu');
	var menuItems = angular.element(".menu-item");
	var menuState = 0;
	var menuWidth;
	var menuHeight;
	var menuPosition;
	var menuPositionX;
	var menuPositionY;

	var windowWidth;
	var windowHeight;

	/**
	 * Initialise our application's code.
	 */
	function init() {
		//		contextListener();
		$scope.clickListener();
		$scope.keyupListener();
		$scope.resizeListener();
	}

	/**
	 * Listens for contextmenu events.
	 */
	//	function contextListener() {
	angular.element(document).bind('contextmenu', function(e) {
		//					console.log(e);
		taskItemInContext = menuService.clickInsideElement(e, taskItemClassName);

		if(taskItemInContext) {
			e.preventDefault();
			toggleMenuOn();
			positionMenu(e);
		} else {
			taskItemInContext = null;
			toggleMenuOff();
			e.preventDefault();
		}
	});
	//	}

	/**
	 * Listens for click events.
	 */
	$scope.clickListener = function() {
		document.addEventListener("click", function(e) {
			//			console.log(e);
			var clickeElIsLink = menuService.clickInsideElement(e, contextMenuLinkClassName);
			//						console.log(clickeElIsLink);

			if(clickeElIsLink) {
				e.preventDefault();
				menuItemListener(clickeElIsLink);
			} else {
				var button = e.which || e.button;
				if(button === 1) {
					toggleMenuOff();
				}
			}
		});
	}

	/**
	 * Turns the custom context menu on.
	 */
	function toggleMenuOn() {
		if(menuState !== 1) {
			menuState = 1;
			//			menu.css('display', 'block');
			menu[0].classList.add(contextMenuActive);
		}
	}

	/**
	 * Turns the custom context menu off.
	 */
	function toggleMenuOff() {
		if(menuState !== 0) {
			menuState = 0;
			//			menu.css('display', 'none');
			menu[0].classList.remove(contextMenuActive);
		}
	}

	/**
	 * Positions the menu properly.
	 * 
	 * @param {Object} e The event
	 */
	function positionMenu(e) {
		clickCoords = menuService.getPosition(e);
		clickCoordsX = clickCoords.x;
		clickCoordsY = clickCoords.y;

		menuWidth = menu.offsetWidth + 4;
		menuHeight = menu.offsetHeight + 4;

		windowWidth = window.innerWidth;
		windowHeight = window.innerHeight;
		//				console.log(menu);

		if((windowWidth - clickCoordsX) < menuWidth) {
			menu[0].style.left = windowWidth - menuWidth + "px";
		} else {
			menu[0].style.left = clickCoordsX + "px";
		}

		if((windowHeight - clickCoordsY) < menuHeight) {
			menu[0].style.top = windowHeight - menuHeight + "px";
		} else {
			menu[0].style.top = clickCoordsY + "px";
		}
	};

	/**
	 * Dummy action function that logs an action when a menu item link is clicked
	 * 
	 * @param {HTMLElement} link The link that was clicked
	 */
	function menuItemListener(link) {
		var id = taskItemInContext.getAttribute("data-id");
		var action = link.getAttribute("menu-click");
		var content = taskItemInContext.firstElementChild.innerText;
		//		console.log(taskItemInContext.firstElementChild.innerText);
		//		console.log(link.getAttribute("menu-click"));
		//				console.log("Task ID - " + taskItemInContext.getAttribute("data-id"));
		switch(action) {
			case "show":
				$scope.showAlarm(id, content);
				break;
			case "track":
				$scope.trackAlarm(id);
				break;
			case "play":
				$scope.playAlarm(id);
				break;
			default:
				break;
		}
		toggleMenuOff();
	}

	$scope.showAlarm = function(id, alarm) {
		id = parseInt(id);
		console.log('id', id);

		$indexedDB.openStore('alerts', function(store) {
			store.find(id).then(function(item) {
				//				console.log(item);
				openSwal(item, alarm);
			}, function(e) {
				console.log(e);
			})
		});
	}

	function openSwal(obj, alarm) {
		valTransfer.setter(obj.coordinates);
		swal({
			html: true,
			width: 800,
			padding: 15,
			confirmButtonText: "Close"
		});

		vehiStatus.location(obj.coordinates, function(result) {
			//			console.log(result);
			if(obj.speed.parkTime >= 180) {
				$scope.speed = "Parking(" + vehiStatus.parkTime(obj.speed.parkTime) + ")";
			} else {
				$scope.speed = vehiStatus.speed(obj.speed.speed) + " (" + vehiStatus.direction(obj.speed.fangXiang) + ")";
			};
			$scope.local = result;
			$scope.$apply();
		});
		var html = "<h3> " + alarm + "</h3> <alert-map id='alert-map' style='height: 400px;'></alert-map>" + "<p class='alert-map-info'>Speed: {{speed}}; Mileage: " + obj.mileage + "</br> Location: {{local}} <p>";
		var target = document.getElementById('swal2-content');
		target.innerHTML = html;
		$compile(target)($scope);
	}

	$scope.trackAlarm = function(id) {
		id = parseInt(id);
		console.log('id', id);

		$indexedDB.openStore('alerts', function(store) {
			store.find(id).then(function(item) {
				//				console.log(item);
				var begin = new Date(item.armTime - (1000 * 30));
				begin = begin.toISOString().split('T')[0] + ' ' + begin.toTimeString().split(' ')[0];
				var end = new Date(item.armTime + (1000 * 30));
				end = end.toISOString().split('T')[0] + ' ' + end.toTimeString().split(' ')[0];
				var obj = {
					id: item.devIdno,
					start: begin,
					end: end,
					armInfo: {
						armType: item.armType,
						armTime: item.armTime
					}
				};

				$state.go('track', obj);
				$rootScope.$broadcast('closeModalPls');
			}, function(e) {
				console.log(e);
			})
		});
	}

	$scope.playAlarm = function(id) {
		id = parseInt(id);
		console.log('id', id);

		$indexedDB.openStore('alerts', function(store) {
			store.find(id).then(function(item) {
				//				console.log(item);
				var t = new Date(item.armTime);
				t = t.toISOString();
				var dat = t.split('T')[0];
				var obj = {
					id: item.devIdno,
					date: dat,
					start: valTransfer.covertTimeString(new Date(item.armTime)),
					end: valTransfer.covertTimeString(new Date(item.armTime)),
					timeBegin: item.armTime,
					timeEnd: item.armTime
				};
				
				$state.go('record', obj);
				$rootScope.$broadcast('closeModalPls');
			}, function(e) {
				console.log(e);
			})
		});
	}
	/**
	 * Listens for keyup events.
	 */
	$scope.keyupListener = function() {
//		window.onkeyup = function(e) {
//			//						console.log(e);
//			if(e.keyCode === 27) {
//				toggleMenuOff();
//			}
//		}
		angular.element(window).on('keyup', function(e) {
			if(e.keyCode === 27) {
				toggleMenuOff();
			}
		});
	}

	/**
	 * Window resize event listener
	 */
	$scope.resizeListener = function() {
		//		window.onresize = function(e) {
		//			//			console.log(e);
		//			toggleMenuOff();
		//		};
		angular.element(window).on('resize', function() {
			toggleMenuOff();
		});
	};

	/**
	 * Run the app.
	 */
	init();

}

menuService.$inject = ['$animate', '$injector', '$document', '$rootScope', '$sce', '$q'];

function menuService(SIDEMENU) {
	var menu = {
		clickInsideElement: clickInsideElement,
		getPosition: getPosition
	};

	/**
	 * Function to check if we clicked inside an element with a particular class
	 * name.
	 * 
	 * @param {Object} e The event
	 * @param {String} className The class name to check against
	 * @return {Boolean}
	 */
	function clickInsideElement(e, className) {
		var el = e.srcElement || e.target;
		//		console.log(angular.element(el));

		if(el.classList.contains(className)) {
			return el;
		} else {
			while(el = el.parentNode) {
				if(el.classList && el.classList.contains(className)) {
					return el;
				}
			}
		}

		return false;
	}

	/**
	 * Get's exact position of event.
	 * 
	 * @param {Object} e The event passed in
	 * @return {Object} Returns the x and y position
	 */
	function getPosition(e) {
		var posx = 0;
		var posy = 0;

		if(!e) var e = window.event;

		if(e.pageX || e.pageY) {
			posx = e.pageX;
			posy = e.pageY;
		} else if(e.clientX || e.clientY) {
			posx = e.clientX + document.body.scrollLeft +
				document.documentElement.scrollLeft;
			posy = e.clientY + document.body.scrollTop +
				document.documentElement.scrollTop;
		}

		return {
			x: posx,
			y: posy
		}
	}

	return menu;
}