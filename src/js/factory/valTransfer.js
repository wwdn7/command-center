angular
	.module('PVision')
	.factory('valTransfer', valTransfer);

function valTransfer() {
	var service = {
		getter: getter,
		setter: setter,
		covertTimeString: covertTimeString
	}

	var data = {};

	function setter(val) {
		data = val;
	}

	function getter() {
		return data;
	}

	function covertTimeString(date) {
		var hr = date.getHours();
		var min = date.getMinutes();
		var sec = date.getSeconds();
		return(hr * 3600 + min * 60 + sec);
	}

	return service;
}