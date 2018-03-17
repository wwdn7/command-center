angular
	.module('PVision')
	.factory('pouchdbCtrl', ["$rootScope", "Host", "vehicleInfoServices", "$localStorage", pouchdbCtrl]);

function pouchdbCtrl($rootScope, Host, vehicleInfoServices, $localStorage) {
	var db = {
		createDatabase: createDatabase,
		alert: alert,
		findLastSunday: findLastSunday
	};

	var info = vehicleInfoServices;

	//find week info
	var thisWeekBegin = info.findDate().monday() + " 00:00:00";
	var thisWeekEnd = info.findDate().today() + " " + info.findDate().time();
	var lastWeekBegin = info.findDate().lastMonday() + " 00:00:00";
	var lastWeekEnd = info.findDate().lastSunday() + " 23:59:59";
	
	function createDatabase(records, type, isLastWeek) {
		//run last week database 
		if(isLastWeek) {
			$rootScope.lastWeekDB.info().then(function(details) {
					//database does not exist 
					if(details.doc_count == 0) {
						$rootScope.lastWeekDB.put({
							_id: type,
							records: records
						});
					} else {
						//exists, need to update 
						$rootScope.lastWeekDB.get(type).then(function(doc) {
							if(doc.records !== records) {
								console.log('last week alert record number updated!', type, records);
								return $rootScope.lastWeekDB.put({
									_id: type,
									_rev: doc._rev,
									records: records
								});
							}
						}).catch(function(err) {
							console.log(err);
						});
					};
				})
				.catch(function(err) {
					console.log('error: ' + err);
					return;
				});
		} else {
			//run this week database 
			$rootScope.thisWeekDB.info().then(function(details) {
					//          console.log(details); 
					//database does not exist 
					if(details.doc_count == 0) {
						$rootScope.thisWeekDB.put({
							_id: type,
							records: records
						});
					} else {
						//exists, need to update 
						$rootScope.thisWeekDB.get(type).then(function(doc) {
							if(doc.records !== records) {
								console.log('current week alert record number updated!', type, records);
								return $rootScope.thisWeekDB.put({
									_id: type,
									_rev: doc._rev,
									records: records
								});
							}
						}).catch(function(err) {
							console.log('why error?', err);
						});
					};
				})
				.catch(function(err) {
					console.log('error: ' + err);
					return;
				});
		};
	};
	
	function alert(ids, type, records, isLastWeek, startTime) {
		var url = Host + "/VehicleApiAction_alarmDetail.action";
		
		if(records < 1) {
			records = 1;
		}
		
		if(isLastWeek) {
			if(startTime){
				lastWeekBegin = startTime;
			}
			var params = {
				jsession: $localStorage.currentUser.token,
				alarmTypeValue: type,
				devIdnos: ids,
				begintime: lastWeekBegin,
				endtime: lastWeekEnd,
				pageRecords: records,
//				toMap: 1
			};
		} else {
			if(startTime){
				thisWeekBegin = startTime;
			}
			var params = {
				jsession: $localStorage.currentUser.token,
				alarmTypeValue: type,
				devIdnos: ids,
				begintime: thisWeekBegin,
				endtime: thisWeekEnd,
				pageRecords: records,
//				toMap: 1
			};
		};
//		console.log(params);
		return info.returnHttp(url, params);
	};
	
	function findLastSunday(){
		var date = new Date(lastWeekEnd);
		date = date.getTime();
		return date;
	}

	return db;
};