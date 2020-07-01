sap.ui.define([
	"com/ok40/powermon/controller/BaseController",
	"com/ok40/powermon/model/formatter",
	"com/ok40/powermon/model/datahelper",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function (
	BaseController, formatter, datahelper, MessageToast, MessageBox) {
	"use strict";

	return BaseController.extend("com.ok40.powermon.controller.Settings", {

		formatter: formatter,

		onInit: function () {
			this.getRouter().getRoute("settings").attachPatternMatched(this._onObjectMatched, this);
		},

		onNavBack: function () {
			this.getRouter().navTo("main", {}, true);
		},

		_onObjectMatched: function () {
			var oComp = this.getOwnerComponent();
			oComp.pIndexDBReady.then(this.readAppSettings.bind(this)).then(function () {
				this.readNetworkMap();
			}.bind(this)).catch(function (e) {
				console.log(e);
			});
		},

		onSettingsChanged: function () {
			this.saveSettingsToDB();
		},

		saveSettingsToDB: function () {
			var db = this.getOwnerComponent().db;
			datahelper.updateAppSettingsInDB(db, this.getSettings()).then(function () {
				MessageToast.show("Настройки сохранены");
			}.bind(this)).catch(function (e) {
				console.log(e);
			});
		},

		onNodeStatusChange: function(oEvent){
			var oNode = oEvent.getSource().getBindingContext("ui").getObject();
			this.updateNodeInDB(oNode);
		},

		onNodeDelete: function(oEvent){
			var oNode = oEvent.getParameter("listItem").getBindingContext("ui").getObject();

			MessageBox.warning("Вы точно хотите удалить устройство " + oNode.NodeName + " из вашей сети энергомониторов?", {
				icon: MessageBox.Icon.WARNING,
				title: "Удалить устройство?",
				actions: [MessageBox.Action.YES, MessageBox.Action.NO],
				onClose: function (sAction) {
					if(sAction === MessageBox.Action.YES){
						oNode.Status = "DELETED";
						this.updateNodeInDB(oNode);
					}
				}.bind(this)
			});
		},

		updateNodeInDB: function(oObj){
			var db = this.getOwnerComponent().db;
			datahelper.updateNodeInDB(db, oObj).then(function () {
				this.readNetworkMap();
				MessageToast.show("Настройки сохранены");
			}.bind(this)).catch(function (e) {
				console.log(e);
			});
		}

	});

});