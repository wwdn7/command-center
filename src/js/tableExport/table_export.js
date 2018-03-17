angular
	.module('tableExport', [])
	.constant('widthSettings', [
		["5%", "25%", "40%", "20%", "10%"],
		["5%", "25%", "30%", "10%", "10%", "10%", "10%"],
		["5%", "25%", "25%", "10%", "35%"],
		["5%", "25%", "25%", "10%", "35%"],
		["5%", "30%", "25%", "40%"]
	])
	.factory('exportService', ['vehicleInfoServices', '$q', 'allDevIDs', 'widthSettings', exportService])
	.directive('multiTableExport', ['exportService', 'swal', '$compile', multiTableExport])
	.directive('tableExport', ['exportService', 'swal', '$compile',
		function(exportService, swal, $compile) {
			return {
				restrict: 'E',
				template: '<div class="export-btn" ng-click="exportTable()"><span class="fa-stack fa-lg"><i class="fa fa-circle fa-stack-2x"></i><i class="fa fa-download fa-stack-1x fa-inverse"></i></span></div>',
				link: function(scope, element, attrs) {

					scope.toExcel = function() {
						swal.showLoading();
						exportService.geocodeAll().then(function() {
							exportService.exportXlsx();
							swal.closeModal();
						}, function(err) {
							console.log(err);
							swal(
								'Failed',
								'Something went wrong',
								'error'
							);
						});
					};

					scope.toPDF = function() {
						swal.showLoading();
						exportService.geocodeAll().then(function() {
							exportService.exportPDF();
							swal.closeModal();
						}, function(err) {
							swal(
								'Failed',
								'Something went wrong',
								'error'
							);
						});
						//						exportService.exportPDF();
					}

					scope.exportTable = function() {
						swal({
							title: 'Export File',
							text: 'Please select file format you want to choose',
							showConfirmButton: false,
							//							showCancelButton: true,
							//							cancelButtonText: 'Close'
						});

						var html = '<div class="detail-button export">' +
							'<div class="btns-link"><button class="btn"" ng-click="toExcel()">' +
							'<i class="fa fa-file-excel-o fa-fw" aria-hidden="true"></i>Download Excel</button></div>' +
							'<div class="btns-link"><button class="btn"" ng-click="toPDF()">' +
							'<i class="fa fa-file-pdf-o fa-fw" aria-hidden="true"></i>Download PDF</button></div>' +
							'</div>';

						var target = angular.element('.swal2-content');
						target.append(html);

						//						 console.log(angular.element('.swal2-content'));
						$compile(target)(scope);
						//						exportService.exportXlsx();
					}
				}
			};
		}
	]);

function multiTableExport(exportService, swal, $compile) {
	return {
		restrict: 'E',
		template: '<div class="export-btn multi" ng-click="exportTable()"><span class="fa-stack fa-lg"><i class="fa fa-circle fa-stack-2x"></i><i class="fa fa-download fa-stack-1x fa-inverse"></i></span></div>',
		link: function(scope, element, attrs) {

			var headers = [];

			angular.element('.widget-body').ready(function() {
				var header = angular.element('li.uib-tab');
				for(var i = 0; i < header.length; i++) {
					headers.push(header[i].innerText.slice(0, -1));
				}
			});

			scope.toExcel = function() {
				swal.showLoading();

				var wb = {
					SheetNames: [],
					Sheets: {}
				};

				var table = angular.element('table');

				for(var t = 0; t < table.length; t++) {
					//get table data
					var content = angular.copy(angular.element('table')[t]);

					//remove column number and option
					exportService.formatTable(content);

					//convert to work sheet
					var ws = XLSX.utils.table_to_sheet(content);
					if(t == 0) {

						var docend = ws['!ref'].split(':')[1];
						var duration = "A" + docend.substr(1);
						//						console.log(ws['!ref'].split(':')[1], duration);

						if(exportService.getDuration()) {
							ws[duration] = {
								t: 's',
								v: 'Total Duration: ' + exportService.getDuration(),
							}
						}
					}

					//push to work book
					wb.SheetNames.push(headers[t]);
					wb.Sheets[headers[t]] = ws;
					//console.log(headers,ws, ws['!ref']);
				}

				exportService.exportMulXlsx(wb);
				swal.closeModal();
			};

			scope.toPDF = function() {
				swal.showLoading();
				exportService.exportMulPDF(headers);
				swal.closeModal();
			}

			scope.exportTable = function() {
				swal({
					title: 'Export File',
					text: 'Please select file format you want to choose',
					showConfirmButton: false,
					//							showCancelButton: true,
					//							cancelButtonText: 'Close'
				});

				var html = '<div class="detail-button export">' +
					'<div class="btns-link"><button class="btn"" ng-click="toExcel()">' +
					'<i class="fa fa-file-excel-o fa-fw" aria-hidden="true"></i>Download Excel</button></div>' +
					'<div class="btns-link"><button class="btn"" ng-click="toPDF()">' +
					'<i class="fa fa-file-pdf-o fa-fw" aria-hidden="true"></i>Download PDF</button></div>' +
					'</div>';

				var target = angular.element('.swal2-content');
				target.append(html);

				//						 console.log(angular.element('.swal2-content'));
				$compile(target)(scope);
				//						exportService.exportXlsx();
			}
		}
	};
}

function exportService(vehicleInfoServices, $q, allDevIDs, widthSettings) {
	var service = {
		setDuration: setDuration,
		getDuration: getDuration,
		setOption: setOption,
		getOption: getOption,
		exportXlsx: exportXlsx,
		exportPDF: exportPDF,
		geocodeAll: geocodeAll,
		formatTable: formatTable,
		exportMulXlsx: exportMulXlsx,
		exportMulPDF: exportMulPDF
	};

	var options = {};

	var total_duration = "";

	function setDuration(num) {
		total_duration = num;
	}

	function getDuration() {
		return total_duration;
	}

	function s2ab(s) {
		var buf = new ArrayBuffer(s.length);
		var view = new Uint8Array(buf);
		for(var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
		return buf;
	}

	function setOption(obj) {
		options = obj;
	}

	function getOption() {
		return options;
	}

	function exportXlsx() {
		var ExportButtons = angular.element('table');

		var instance = new TableExport(ExportButtons, getOption());
		//                                        // "id" of selector    // format
		var exportData = instance.getExportData()['export-table']['xlsx'];

		//                   // data          // mime              // name              // extension
		instance.export2file(exportData.data, exportData.mimeType, exportData.filename, exportData.fileExtension);
	}

	function exportPDF() {

		var pdfContent = {
			pageOrientation: 'landscape',
			pageMargins: [20, 40],
			content: [],
			styles: {
				header: {
					fontSize: 18,
					bold: true,
					alignment: 'center',
					margin: [0, 0, 0, 15]
				},
				table: {
					margin: 5
				}
			}
		};

		pdfContent.content.push({
			text: getOption().filename.toUpperCase() + ' TABLE',
			style: 'header'
		});

		var header = [];
		pdfContent.content.push({
			style: 'table',
			table: {
				widths: [],
				body: []
			}
		});
		var he = angular.element('thead tr th');
		var hw = [];
		var ignoreCol = [];

		for(var i = 0; i < he.length; i++) {
			var title = he[i].outerText;

			if(title !== 'Options' && title !== 'Status') {
				header.push({
					text: title,
					fillColor: '#cccccc'
				});
				hw.push('auto');
			} else {
				ignoreCol.push(i);
			}
		};
		pdfContent.content[1].table.body.push(header);
		pdfContent.content[1].table.widths = hw;

		var source = angular.element('tbody tr');

		for(var j = 0; j < source.length; j++) {
			var li = [];
			//			console.log(Array.from(source[j].cells) instanceof Array);
			var cell = Array.from(source[j].cells);
			cell = cell.filter(function(cell, l) {

				var isIgnore = ignoreCol.some(function(index) {
					return index === l;
				});

				return !isIgnore;
			});

			for(var k = 0; k < cell.length; k++) {
				var col = cell[k].innerText;
				li.push(col);
			}

			pdfContent.content[1].table.body.push(li);
		}
		//		console.log(pdfContent);
		pdfMake.createPdf(pdfContent).download(getOption().filename + '.pdf');
	}

	function geocodeAll() {
		var header = Array.from(angular.element('thead tr th'));
		var source = Array.from(angular.element('tbody tr'));
		var localCol;

		var hasLocation = header.some(function(th, i) {
			if(th.innerText.trim() === "Location") {
				localCol = i;
				return true;
			}
		});

		var coordinates = [];
		var rowIndexArr = [];
		var deferred = $q.defer();

		if(hasLocation) {

			source.map(function(tr, index) {

				var findLocal = tr.cells[localCol].innerText;
				var isLocated = findLocal.split(', ');
				//								console.log(findLocal);

				if(isLocated.length == 2) {
					//					var lat = isLocated[1].replace(".", "");
					//					var lng = isLocated[0].replace(".", "");
					var lat = isLocated[1];
					var lng = isLocated[0];
					if(!isNaN(lat) && !isNaN(lng)) {
						//						if(lng.length < 8) {
						//							var zero = "";
						//							for(var k = 0; k < (8 - lng.length); k++) {
						//								zero = zero + "0";
						//							}
						//							lng = lng + zero;
						//						}
						coordinates.push({
							lat: (lat * 1000000).toFixed(0),
							lng: (lng * 1000000).toFixed(0)
						});
						rowIndexArr.push(tr.rowIndex);
					}
				}
			});
			//									console.log(coordinates, rowIndexArr);
			if(coordinates.length > 0) {
				var coorArray = [],
					rowArray = [],
					chunk = 100;

				for(var i = 0, j = coordinates.length; i < j; i += chunk) {
					coorArray.push(coordinates.slice(i, i + chunk));
					rowArray.push(rowIndexArr.slice(i, i + chunk));
				}

				//				console.log(coorArray, rowArray);
				var promises = [];
				coorArray.map(function(coor, i) {
					//					console.log(coor, i);
					var def = $q.defer();
					vehicleInfoServices.getLocation(coor).then(function(result) {
						if(result.data.result == 0) {
							var src = angular.element('tbody tr');

							for(var j = 0; j < rowArray[i].length; j++) {
								//					console.log(src[rowIndexArr[j]].cells[localCol].innerHTML, result.data.location[j]);
								src[rowArray[i][j] - 1].cells[localCol].innerHTML = result.data.location[j];
							};
							//				console.log(result, src);
							def.resolve(result);
						} else {
							def.reject('something wrong');
						}

					});
					promises.push(def.promise);
				});

				return $q.all(promises);

			} else {
				deferred.resolve(true);
				return deferred.promise;
			}

		} else {
			deferred.resolve(true);
			return deferred.promise;
		}
	}

	function formatTable(table) {
		for(var i = 0; i < table.children.length; i++) {
			for(var j = 0; j < table.children[i].children.length; j++) {
				var tr = table.children[i].children[j];
				//								console.log(angular.element(tr), tr.childElementCount);
				if(tr.childElementCount > 1) {
					tr.deleteCell(tr.childElementCount - 1);
					tr.deleteCell(0);
				}
			}
		}
	}

	function exportMulXlsx(wb) {

		//		console.log(options);

		var name = allDevIDs.deviceMap.get(options.id);
		var start = options.start.replace(':', '-').replace(':', '-');
		var end = options.end.replace(':', '-').replace(':', '-');

		var blob = new Blob([s2ab(XLSX.write(wb, {
			bookType: 'xlsx',
			type: 'binary'
		}))], {
			type: "application/octet-stream"
		});

		saveAs(blob, name + '(' + options.id + ")_" + start + "_" + end + ".xlsx");
	}

	function exportMulPDF(headers) {

		var pdfContent = {
			pageOrientation: 'landscape',
			pageMargins: [20, 40],
			content: [],
			styles: {
				header: {
					fontSize: 18,
					bold: true,
					alignment: 'center',
					margin: [0, 0, 0, 15]
				},
				table: {
					margin: 0
				}
			}
		};

		var table = angular.element('table');

		function getPageBreak(t) {
			if(t > 0) {
				return 'before';
			} else {
				return '';
			}
		};

		for(var t = 0; t < table.length; t++) {

			pdfContent.content.push({
				text: headers[t].toUpperCase() + ' TABLE',
				style: 'header',
				pageBreak: getPageBreak(t)
			});
			//get table data
			var content = angular.copy(angular.element('table')[t]);

			var header = [];

			pdfContent.content.push({
				style: 'table',
				table: {
					widths: [],
					body: []
				}
			});

			var he = content.children[0].children[0].cells;

			for(var i = 0; i < he.length; i++) {
				var title = he[i].outerText.replace(/(\r\n|\n|\r)/gm, "");

				if(title !== 'Options') {
					header.push({
						text: title,
						fillColor: '#cccccc'
					});
				}
			};

			var index = t + 1;
			pdfContent.content[index * 2 - 1].table.body.push(header);
			pdfContent.content[index * 2 - 1].table.widths = widthSettings[t];

			var source = content.children[1].children;
			//			console.log(angular.element(source));
			for(var j = 0; j < source.length; j++) {
				var li = [];
				//			console.log(Array.from(source[j].cells) instanceof Array);
				if(source[j].cells.length > 1) {
					var cell = Array.from(source[j].cells);

					for(var k = 0; k < cell.length - 1; k++) {
						var col = cell[k].innerText;
						li.push(col);
					}

					pdfContent.content[index * 2 - 1].table.body.push(li);
				} else {
					if(source.length <= 1) {
						var li = [];
						li.push({
							text: 'no record found',
							colSpan: widthSettings[t].length
						});

						widthSettings[t].map(function(b, i) {
							if(i > 0) {
								li.push('');
							}
						});

						pdfContent.content[index * 2 - 1].table.body.push(li);
					}
				}
			}

			if(t == 0) {
				var li = [];
				li.push({
					text: 'Total Duration: ' + getDuration(),
					colSpan: widthSettings[t].length
				});

				widthSettings[t].map(function(b, i) {
					if(i > 0) {
						li.push('');
					}
				});

				pdfContent.content[index * 2 - 1].table.body.push(li);
			}
		}
		var name = allDevIDs.deviceMap.get(options.id);
		var start = options.start.replace(':', '-').replace(':', '-');
		var end = options.end.replace(':', '-').replace(':', '-');
//		console.log(pdfContent);
		pdfMake.createPdf(pdfContent).download(name + '(' + options.id + ")_" + start + "_" + end + '.pdf');
	}

	return service;
}