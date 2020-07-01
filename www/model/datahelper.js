sap.ui.define([], function () {
	"use strict";

	return {

		oInitialAppSettings: {
			host: "192.168.1.3",
			exportFilename: "export.xls",
			exportFormat: "XLS",
			exportDeltaOnly: true,
			settingsPageLogin: "",
			settingsPagePassword: "",
			networkPrefix: "FPM"
		},

		readMeasuresFromDB: function (db) {
			var oParams = {
				operation: "GET",
				table: "measures"
			};
			return this._performDBOperation(db, oParams);
		},

		saveMeasureToDB: function (db, oMeasure) {
			var oParams = {
				operation: "ADD",
				table: "measures",
				data: oMeasure
			};
			return this._performDBOperation(db, oParams);
		},

		readNodesFromDB: function (db, settings) {
			var aDBOperations = [];
			var oParams = {
				operation: "GET",
				table: "nodes"
			};
			return this._performDBOperation(db, oParams).then(function (aNodes) {
				return aNodes;
			}.bind(this));
		},

		saveNodeToDB: function (db, oNode) {
			var oParams = {
				operation: "ADD",
				table: "nodes",
				data: oNode
			};
			return this._performDBOperation(db, oParams);
		},

		updateNodeInDB: function(db, oNode, index){
			var oParams = {
				operation: "UPD",
				table: "nodes",
				data: oNode
			};
			return this._performDBOperation(db, oParams);
		},

		readAppSettingsFromDB: function (db) {
			var oParams = {
				operation: "GET",
				table: "settings"
			};
			return this._performDBOperation(db, oParams).then(function (oSettings) {
				if (oSettings && oSettings[0]) { //if no settings found, initialize the settings in DB
					return oSettings[0];
				} else {
					return this.updateAppSettingsInDB(db, this.oInitialAppSettings);
				}
			}.bind(this));
		},

		updateAppSettingsInDB: function (db, oSettings) {
			var oParams = {
				operation: "PUT",
				table: "settings",
				data: oSettings
			};
			return this._performDBOperation(db, oParams);
		},

		_performDBOperation: function (db, params) {
			return new Promise(function (resolve, reject) {
				var transaction = db.transaction([params.table], "readwrite");
				var store = transaction.objectStore(params.table);
				var request;

				switch (params.operation) {
					case "ADD":
						request = store.add(params.data);
						break;
					case "GET":
						request = store.getAll();
						break;
					case "PUT":
						request = store.put(params.data, 1);
						break;
					case "UPD":
						request = store.put(params.data);
						break;
					default:
						break;
				}

				request.onerror = function (e) {
					console.log("Error", e.target.error.name);
					reject(e.target.error.name)
				}

				request.onsuccess = function (e) {
					console.log("Woot! Did it");
					if(typeof(e.target.result) === "object"){
						resolve(e.target.result);
					}else{
						resolve(params.data);
					}					
				}

			}.bind(this));
		},


		readCurrentMeasurementsFromDevice: function () {
			//cordovaHTTP.useBasicAuth("user", "password");
			return Promise.resolve({HostName: "wrweqerdeqwd"});
			return this.loadDataHttp({
				url: "http://192.168.3.1/json"
			});
		},

		loadDataHttp: function (oParams) {
			return new Promise(function (resolve, reject) {
				cordovaHTTP.get(oParams.url, {}, {}, function (response) {
					console.error(JSON.stringify(response));
					console.log("NEW REQUEST STATUS: " + response.status);
					if (parseInt(response.status) === 200) {
						resolve(response.data)
					} else {
						reject(response.error);
					}
				}, function (response) {
					console.error(JSON.stringify(response));
					reject(response.error);
				});
			});
		},

		loadData: function (oJSONModel, oParams) {
			return new Promise(function (resolve, reject) {
				oJSONModel._ajax({
					url: oParams.url,
					async: true,
					dataType: 'json',
					cache: true,
					data: oParams.data,
					headers: oParams.headers,
					type: oParams.type || "GET",
					success: function (data) {
						console.log("SUCCESS!!");
						console.log(data);
						console.log(JSON.parse(data));
						resolve(JSON.parse(data));
					},
					error: function (oXMLHttpRequest, sTextStatus, oError) {
						reject({
							request: oXMLHttpRequest,
							textStatus: sTextStatus,
							error: oError
						});
					}
				});
			});
		}
	};
});