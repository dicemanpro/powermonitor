sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "com/ok40/powermon/util/SpeechRecognition",
    "com/ok40/powermon/util/formatter",
    "com/ok40/powermon/model/datahelper"
], function (Controller, SpeechRecognition, formatter, datahelper) {
    "use strict";

    return Controller.extend("com.ok40.powermon.controller.BaseController", {

        formatter: formatter,

        getRouter: function () {
            return sap.ui.core.UIComponent.getRouterFor(this);
        },

        getModel: function (sName) {
            return this.getView().getModel(sName);
        },

        setModel: function (oModel, sName) {
            return this.getView().setModel(oModel, sName);
        },

        getResourceBundle: function () {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },

        getSettings: function () {
            return this.getModel("ui").getProperty("/settings");
        },

        readNetworkMap: function () {
			var db = this.getOwnerComponent().db;
			datahelper.readNodesFromDB(db, this.getSettings()).then(function (aNodes) {
				this.getModel("ui").setProperty("/nodes", aNodes);
			}.bind(this)).catch(function (e) {
				console.log(e);
			});
        },
        
        readAppSettings: function () {
			var oModel = this.getModel("ui");
			var db = this.getOwnerComponent().db;
			return datahelper.readAppSettingsFromDB(db).then(function (oSettings) {
				oModel.setProperty("/settings", oSettings);
			}.bind(this));
		},

        _prepareIndexDB: function () {
            return new Promise(function (resolve, reject) {
                var db = indexedDB.open("powermonDB", 6);

                var oComp = this.getOwnerComponent();

                db.onupgradeneeded = function (e) {
                    console.log("Upgrading...");
                    var thisDB = e.target.result;
                    if (!thisDB.objectStoreNames.contains("measures")) {
                        thisDB.createObjectStore("measures", { keyPath: "unixtime" });
                    }
                    if (!thisDB.objectStoreNames.contains("nodes")) {
                        thisDB.createObjectStore("nodes", { keyPath: "NodeId" });
                    }
                    if (!thisDB.objectStoreNames.contains("settings")) {
                        thisDB.createObjectStore("settings");
                    }
                    resolve(e.target.result);
                }

                db.onsuccess = function (e) {
                    console.log("Success!");
                    oComp.db = e.target.result;
                    resolve(e.target.result);
                }

                db.onerror = function (e) {
                    console.log("Error");
                    console.dir(e);
                    reject();
                }
            }.bind(this));
        }


    });
}
);