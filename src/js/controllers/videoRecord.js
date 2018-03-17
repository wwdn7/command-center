angular
	.module('PVision')
	.controller('videoRecord', ['$timeout', '$scope', 'vehicleInfoServices', '$rootScope', '$stateParams', 'swal', '$interval', '$compile', '$localStorage', 'IPAddr', '$window',
		function($timeout, $scope, vehicleInfoServices, $rootScope, $stateParams, swal, $interval, $compile, $localStorage, IPAddr, $window) {
			//			console.log($stateParams);

			//request stop play video
			$scope.$on('$locationChangeStart', function() {
				//				console.log('switch page?', $scope.url);
				stopPlay($scope.url);
				$scope.url = "";
			});

			$scope.$on('$destroy', function() {
				if($scope.buff) {
					$interval.cancel($scope.buff);
				}
				videojs('record-video').dispose();
			});

			function stopPlay(url) {
				if(url) {
					var toStop = url.replace('Playback', 'StopPlay');
					console.log(toStop);
					vehicleInfoServices.returnHttp(url).then(function(stop) {
						console.log('Play back stopped?', stop);
					});
				};
			};

			function getVideoHeight() {
				return videojs('record-video').currentHeight();
			};

			function getBufferPercent() {
				return(videojs('record-video').bufferedPercent() * 100).toFixed(1);
			};

			function getIsFullScr() {
				return videojs('record-video').isFullscreen();
			};

			$scope.$watch(getIsFullScr, function(bol) {
				//if user return from fullscreen set height again
				$timeout(function() {
					setHeight(getVideoHeight());
				}, 100);
			});

			//			angular.element(document)[0].addEventListener('webkitfullscreenchange', function(e) {
			//				$timeout(function() {
			//					setHeight(getVideoHeight());
			//				}, 100);
			//			});

			angular.element(document).keyup(function(e) {
				if(e.keyCode === 123) {
					$timeout(function() {
						setHeight(getVideoHeight());
					}, 100);
				}
			});

			//			var unbind = $scope.$watch(getVideoHeight, function(val){
			//				if(val){
			//					setHeight(val);
			//					console.log('height setted', val);
			//					unbind();
			//				};
			//			});

			//			videojs('record-video').ready(function() {
			//				//				$timeout(function() {
			//				setHeight(getVideoHeight());
			//				//				}, 1000)
			//			})

			angular.element('.video-js').ready(function() {
				$timeout(function() {
					setHeight(getVideoHeight());
				}, 0);
			});

			//			angular.element(function() {
			//				$timeout(function() {
			//					setHeight(getVideoHeight());
			//				}, 0)
			//			});

			//			$window.onresize = function() {
			//				setHeight(getVideoHeight());
			//			};

			angular.element(window).on('resize', function() {
				setHeight(getVideoHeight());
			});

			//TODO disable record function and popup alert message
			if($stateParams.date) {
				//				console.log('date is defined');
				if($localStorage.currentUser.valueOf().playback == 641) {
					//					console.log('call api');
					//load info from track page
					callAPI($stateParams);
				} else {
					//					console.log('not permitted');
					swal({
						title: "Please upgrade your monthly plan",
						text: 'Not Allowed',
						type: "info",
						confirmButtonColor: '#d33',
						confirmButtonText: 'OK'
					});
					$rootScope.$broadcast('afterLoading');
				}
			};

			function loadBuffer() {
				$scope.percent = getBufferPercent();
				$scope.buff = $interval(function() {
					$scope.percent = getBufferPercent();
				}, 10);
				var buffer = angular.element("<span>{{percent}}%</span>");
				buffer.addClass("loading-percent");
				var spinner = angular.element('.vjs-loading-spinner');
				spinner.append(buffer);
				$compile(spinner)($scope);
			};

			function setHeight(height) {
				//		console.log(document.getElementById('record-result').offsetHeight, videojs('record-video').currentHeight());
				//		var height = videojs('record-video').currentHeight();
				//		videojs('record-video').height();
				$timeout(function() {
					if(document.getElementById('record-result')) {
						document.getElementById('record-result').style.height = height - 11 + "px";
					};
				}, 0);

				//		var heheda = videojs('record-video');
				//		console.log("currentHW: ", heheda.currentHeight(), heheda.currentWidth());
				//		console.log("buffer, videoHW: ", heheda.bufferedPercent(), heheda.videoHeight(), heheda.videoWidth());
			};

			//load play records
			$scope.$on('RecordQuery', function(event, d) {
				if($localStorage.currentUser.valueOf().playback == 641) {
					callAPI(d);
				} else {
					//TODO create sweet alert here as well and its done hahahahaha
					swal({
						title: "Please upgrade your monthly plan",
						text: 'Not Allowed',
						type: "info",
						confirmButtonColor: '#d33',
						confirmButtonText: 'OK'
					});
					$rootScope.$broadcast('afterLoading');
				}
			});

			function mapChannelName(channelNum, channelNameArray) {
				switch(true) {
					case(channelNum === 0 && channelNameArray.length > 0):
						return channelNameArray[0];
					case(channelNum === 1 && channelNameArray.length >= 1):
						return channelNameArray[1];
					case(channelNum === 2 && channelNameArray.length >= 2):
						return channelNameArray[2];
					case(channelNum === 3 && channelNameArray.length >= 3):
						return channelNameArray[3];
					case(channelNum === 4 && channelNameArray.length >= 4):
						return channelNameArray[4];
					case(channelNum === 5 && channelNameArray.length >= 5):
						return channelNameArray[5];
					case(channelNum === 6 && channelNameArray.length >= 6):
						return channelNameArray[6];
					case(channelNum === 7 && channelNameArray.length >= 7):
						return channelNameArray[7];
					case(channelNum === 8 && channelNameArray.length >= 8):
						return channelNameArray[8];
					case(channelNum === 9 && channelNameArray.length >= 9):
						return channelNameArray[9];
					case(channelNum === 10 && channelNameArray.length >= 10):
						return channelNameArray[10];
					case(channelNum === 11 && channelNameArray.length >= 11):
						return channelNameArray[11];
					default:
						return "x";
				};
			};

			function callAPI(d) { // d is vehicle object
				vehicleInfoServices.record(d.id, d.date, d.start, d.end).then(function(response) {
					//					console.log(response);
					$rootScope.$broadcast('afterLoading');
					$scope.chnName = [];
					if(response.data.result == 0 && response.data.FileCount !== 0) {
						$rootScope.items.some(function(val) {
							if(d.id === val.devStatus.devIdno) {
								$scope.chnName = val.devInfo.chnName.split(',');
								return $scope.devicename = val.devInfo.userAccount.name;
							}
						});
						$scope.records = [];
						//						$scope.records = response.data.Files;
						response.data.Files.map(function(val, i) {
							var beginTime = calTime(val.uiBegintime);
							var endTime = calTime(val.uiEndtime);
							var duration = calTime(val.uiEndtime - val.uiBegintime);
							var Date = formatDate(val.nDay) + '/' + formatDate(val.nMonth) + '/' + val.nYear;
							var apiDate = val.nYear + '-' + formatTime(val.nMonth) + '-' + formatTime(val.nDay);
							var callBegin = val.nYear + '-' + formatTime(val.nMonth) + '-' + formatTime(val.nDay) + " " + beginTime;
							var callEnd = val.nYear + '-' + formatTime(val.nMonth) + '-' + formatTime(val.nDay) + " " + endTime;
							var size = ((val.nFileLen / 1024) / 1024).toFixed(3) + 'mb';
							var nChannelName = mapChannelName(val.nChannel, $scope.chnName);
							// console.log(val.nChannel, mapChannelName(val.nChannel, $scope.chnName), $scope.chnName);
							$scope.records.push({
								beginTime: beginTime,
								endTime: endTime,
								duration: duration,
								Date: Date,
								apiDate: apiDate,
								callBegin: callBegin,
								callEnd: callEnd,
								size: size,
								nChannelName: nChannelName,
								nChannel: val.nChannel,
								szFile: val.szFile,
								nFileLen: val.nFileLen,
								szDevIDNO: val.szDevIDNO,
								nFileOffset: val.nFileOffset,
								uiBegintime: val.uiBegintime,
								uiEndtime: val.uiEndtime
							});
						});
						// console.log("print vehicle object d ", d);
						// console.log("print root scope", $rootScope.items[5].devInfo.chnName, $scope.chnName);
						//						console.log("records: ", $scope.records);
					} else if(response.data.result == 1) {
						swal({
							title: "Device Not Available",
							text: '', //response.data.Msg,
							type: "info",
							confirmButtonColor: '#d33',
							confirmButtonText: 'OK'
						});
					} else {
						swal({
							title: "No Result Found",
							text: "Please try again later",
							type: "info",
							confirmButtonColor: '#d33',
							confirmButtonText: 'OK'
						});
					}
					angular.element(document).find('button.btn.btn-primary').prop('disabled', false);
				});
			};

			function calTime(time) {

				var hour = formatTime((time - time % 3600) / 3600);
				var mins = formatTime(parseInt((time % 3600) / 60));
				var secs = formatTime((time % 3600) % 60);

				return hour + ':' + mins + ':' + secs;
			};

			function formatTime(num) {
				return num.toString().length > 1 ? num.toString() : '0' + num;
			};

			function formatDate(dat) {
				if(dat.toString().length == 1) {
					return "0" + dat.toString();
				} else {
					return dat.toString();
				}
			};

			//			$scope.url = "";
			$scope.$on('playTheRecord', function(event, data) {
				//				console.log('switch video?', $scope.url);
				stopPlay($scope.url);

				var duration = data.end - data.begin;
				$scope.url = "";
				$scope.url = "http://" + IPAddr + ":8088/Playback.flv?DevIDNO=" + data.id + "&Channel=" + data.chn + "&FileLen=" + data.filelen + "&AlarmInfo=0&FileType=0&Offset=0&Location=1&ServerID=0&Date=" + data.date + "&uiBegintime=" + data.begin + "&uiEndtime=" + data.end + "&FileName=" + data.path;
//				console.log($scope.url);
				//			var url = "http://91.192.192.215:8088/Playback.m3u8?DevIDNO=" + data.id + "&Channel=" + data.chn + "&FileLen=" + data.filelen + "&AlarmInfo=0&FileType=0&Offset=0&Location=1&ServerID=0&Date=" + data.date + "&Begintime=0&Endtime=" + data.end + "&FileName=" + data.path;
				//			$scope.videoSrcUrl = $sce.trustAsResourceUrl(url);
				//			$scope.videoSrcUrl = url;
				//				videojs('record-video',{techOrder: ["flash","html5"]});
				videojs('record-video').ready(function() {
					this.reset();
					this.duration = function() {
						return duration;
					}
					this.src({
						type: "video/x-flv",
						src: $scope.url
					});
					//				this.load();
					this.play();
					this.watermark({
						image: "img/watermark.png",
						fadeTime: null
					});
					loadBuffer();
					//				console.log("client width: ", this.currentWidth());
				});
			});

		}
	])
	.filter("trustUrl", ["$sce", function($sce) {
		return function(recordingUrl) {
			return $sce.trustAsResourceUrl(recordingUrl);
		};
	}]);