sap.ui.define([], function() {
	"use strict";

	return {

		/**
		 * Rounds the number unit value to 2 digits
		 * @public
		 * @param {string} sValue the number string to be rounded
		 * @returns {string} sValue with 2 digits rounded
		 */
		mapMeasurementData: function(object, sCurrentPoint) {
			console.log("MAPPER DATA:");
			var a =  {
				unixtime: parseInt("" + object.UNIXTIME + "000"),
				point: sCurrentPoint,
				host: object.HostName,
				sum: object.KWHCNT0,
				counter1: object.KWHCNT1,
				counter2: object.KWHCNT2,
				counter3: object.KWHCNT3
			};
			console.log(a.unixtime);
			console.log(a.point);
			console.log(a.host);
			console.log(a.sum);
			console.log(a.counter1);
			console.log(a.counter2);
			console.log(a.counter3);
			return a;
		}
	};
});