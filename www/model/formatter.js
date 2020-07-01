sap.ui.define([
	] , function () {
		"use strict";

		return {

			/**
			 * Rounds the number unit value to 2 digits
			 * @public
			 * @param {string} sValue the number string to be rounded
			 * @returns {string} sValue with 2 digits rounded
			 */
			formatConnectionStatus : function (sValue) {
				if (!sValue) {
					return "Не подключен";
				}else{
					return "Подключен к " + sValue;
				}
			},

			formatConnectionState : function (sValue) {
				if (!sValue) {
					return "Warning";
				}else{
					return "Success";
				}
			},

			formatLastReadDate : function (unixtime) {
				return unixtime !== undefined ? new Date(unixtime).toDateString() : "";
			},

			formatReadStatus : function (unixtime) {
				if(unixtime !== undefined){
					var delta = new Date().getTime() - unixtime;
					if(delta < 24 * 3600 * 1000){
						return "Посещено";
					}else{
						return "Не посещено"
					}
				}
				return "";
			},

			formatReadStatusState : function (unixtime) {
				if(unixtime !== undefined){
					var delta = new Date().getTime() - unixtime;
					if(delta < 24 * 3600 * 1000){
						return "Success";
					}else{
						return "Error"
					}
				}
				return "Warning";
			}

		};

	}
);