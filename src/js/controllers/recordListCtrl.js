var list = angular.module('PVision');

list.controller('recordListCtrl', ["$scope", "valTransfer", "vehicleInfoServices", "$window", "$rootScope", "$state", "$timeout", "swal", "$compile", "MediaHost",
	function($scope, valTransfer, vehicleInfoServices, $window, $rootScope, $state, $timeout, swal, $compile, MediaHost) {

		$scope.play = function(id, path, chn, filelen, date, begin, end) {
			//		console.log(id, path, chn, filelen, date, begin, end);
			var data = {
				id: id,
				path: path,
				chn: chn,
				filelen: filelen,
				date: date,
				begin: begin,
				end: end
			}
			//			$timeout(function() {
			$scope.$emit('playTheRecord', data);
			//			}, 100);
		};

		$scope.download = function(val) {
			var data = {
				id: val.szDevIDNO,
				path: val.szFile,
				chn: val.nChannel,
				filelen: val.nFileLen,
				date: val.apiDate,
				begin: val.uiBegintime,
				end: val.uiEndtime,
				offset: val.nFileOffset
			};

			var passVal = {
				callBegin: val.callBegin,
				callEnd: val.callEnd
			};

			valTransfer.setter(passVal);
			//		console.log(val);
			var filenarr = data.path.split('/');
			var filename = filenarr[filenarr.length - 1];
			//		console.log(filename);
			//		console.log('http://test.pvcameras.com:8088/GrecDownload.grec?' +'?DevIDNO=' + data.id + '&Channel=' + data.chn + '&FileLen=' + data.filelen + '&AlarmInfo=0&FileType=0&Offset=' + data.offset + '&Location=1&ServerID=0&Date='+ data.date + '&Begintime=' + data.begin + '&Endtime=' + data.end + '&FileName=' + data.path);
			swal({
				title: 'Please Select Download Time',
				type: 'info',
				showCancelButton: true,
				confirmButtonColor: "#DD6B55",
				confirmButtonText: "Download",
				cancelButtonText: "Cancel",
				html: true,
				allowOutsideClick: false,
				animation: false,
				customClass: 'animated bounce',
				preConfirm: function() {
					return new Promise(function(resolve) {
						resolve({
							begin: $scope.beginTime,
							end: $scope.endTime
						})
					})
				}
			}).then(function(result) {
				var data = {
					id: val.szDevIDNO,
					path: val.szFile,
					chn: val.nChannel,
					filelen: val.nFileLen,
					date: val.apiDate,
					begin: getSeconds(result.begin),
					end: getSeconds(result.end),
					offset: val.nFileOffset
				};
				//			console.log(typeof $scope.beginTime, $scope.min.getTime(), $scope.endTime, $scope.max);
				if($scope.beginTime.getTime() === $scope.min.getTime() && $scope.endTime.getTime() === $scope.max.getTime()) {
					$window.open( MediaHost + '/' + filename + '?DevIDNO=' + data.id + '&Channel=' + data.chn + '&FileLen=' + data.filelen + '&AlarmInfo=0&FileType=0&Offset=' + data.offset + '&Location=1&ServerID=0&Date=' + data.date + '&Begintime=' + data.begin + '&Endtime=' + data.end + '&FileName=' + data.path, '_blank');
				} else {
					$window.open( MediaHost + '/GrecDownload.grec?' + 'DevIDNO=' + data.id + '&Channel=' + data.chn + '&FileLen=' + data.filelen + '&AlarmInfo=0&FileType=0&Offset=' + data.offset + '&Location=1&ServerID=0&Date=' + data.date + '&Begintime=' + data.begin + '&Endtime=' + data.end + '&FileName=' + data.path, '_blank');
				};
				//			console.log($scope.beginTime, $scope.max);
				//			vehicleInfoServices.downloadVideoSegment(data);
			});
			var html = "<time-picker id='time-picker'></time-picker>";
			var target = document.getElementById('swal2-content');
			target.innerHTML = html;
			angular.element('.swal2-buttonswrapper')[0].style.marginTop = "0";
			$compile(target)($scope);

			//		vehicleInfoServices.downloadVideo(data);
			//		$timeout(function(){$rootScope.$broadcast('deviceChange', id);},100);
		};

		$scope.track = function(id, begin, end) {

			var obj = {
				id: id,
				start: begin,
				end: end
			};

			$state.go('track', obj);

			$timeout(function() {
				$rootScope.$broadcast('beforeLoading');
			}, 100);
		};

		function getSeconds(time) {
			var tempTime = new Date(time);
			var hour = tempTime.getHours();
			var minute = tempTime.getMinutes();
			var seconds = tempTime.getSeconds();
			return((hour * 3600) + (minute * 60) + seconds);
		};

	}
]);