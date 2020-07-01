sap.ui.define([
	"com/ok40/powermon/controller/BaseController",
	"com/ok40/powermon/util/SpeechRecognition",
	"sap/ui/model/json/JSONModel",
	"com/ok40/powermon/model/formatter",
	"com/ok40/powermon/model/mapper",
	"com/ok40/powermon/model/datahelper",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/export/library",
	"sap/ui/export/Spreadsheet"
], function (BaseController, SpeechRecognition, JSONModel, formatter, mapper, datahelper, MessageBox, MessageToast, exportLibrary, Spreadsheet) {

	"use strict";

	var EdmType = exportLibrary.EdmType;

	return BaseController.extend("com.ok40.powermon.controller.Record", {

		formatter: formatter,

		onInit: function () {
			this.getRouter().getRoute("main").attachPatternMatched(this._onRouteMatched, this);
		},



		onNavToSettings: function () {
			this.getRouter().navTo("settings", {}, true);
		},

		_onRouteMatched: function () {
			var oComp = this.getOwnerComponent();

			this.getModel("ui").setProperty("/network", undefined);
			this.checkNetworkConnectivity();
			if(!oComp.pIndexDBReady){
				oComp.pIndexDBReady = this._prepareIndexDB();
			}						
			oComp.pIndexDBReady.then(this.readAppSettings.bind(this)).then(function () {
				this.readStoredMeasures();
				this.readNetworkMap();
			}.bind(this)).catch(function (e) {
				console.log(e);
			});
		},

		checkNetworkConnectivity: function(){
			var sNetwork;
			if(this.getRouter().getHashChanger().getHash() === "main"){
				if (window.WifiWizard2) {
					WifiWizard2.getConnectedSSID().then(function (ssid) {					
						sNetwork = this.getModel("ui").getProperty("/network");
						if(ssid !== sNetwork){
							this.getModel("ui").setProperty("/network", ssid);
							this.onNewNetworkDetected()
						}else{
							setTimeout(() => {
								this.checkNetworkConnectivity();
							}, 1000);
						}
					}.bind(this));
				}else{
					setTimeout(() => {
						this.checkNetworkConnectivity();
					}, 1000);
				}	
			}					
		},

		onTryReconnect: function () {
			if (window.WifiWizard2) {
				WifiWizard2.getConnectedSSID().then(function (a) {
					console.log(a);
					this.getModel("ui").setProperty("/network", a);
				}.bind(this)).catch(function (e) {
					console.log(e);
				});
			}
		},

		readStoredMeasures: function () {
			var oModel = this.getModel("ui");
			var aList = [];
			var db = this.getOwnerComponent().db;
			datahelper.readMeasuresFromDB(db).then(function (oMeasures) {
				oMeasures.forEach(function (m) {
					aList.push(m);
				}.bind(this));
				oModel.setProperty("/list", aList);
			}.bind(this)).catch(function (e) {
				console.log(e);
			});
		},





		onAddRecordText: function () {
			var oMeasure = {
				unixtime: 1589314320314,
				point: "FPM00",
				host: "sghlakdi",
				sum: "453.15",
				counter1: "454.12",
				counter2: "333.13",
				counter3: "979.11"
			};
			var db = this.getOwnerComponent().db;
			datahelper.saveMeasureToDB(db, oMeasure).catch(function (e) {
				console.log(e);
			});
		},

		onNewNetworkDetected: function(){
			//прочитать префикс
			//прочитать имя сети
			//прочитать список сетей из БД
			//если имя = префикс И сети нет в базе, месадж бокс с вопросом
			var bFound = false;
			var sPrefix = this.getSettings().networkPrefix;
			var oNetworkName = this.getModel("ui").getProperty("/network") || "FPM19";
			var aNodes = this.getModel("ui").getProperty("/nodes");
			var oNode, oFoundNode;

			if(oNetworkName.includes(sPrefix)){
				datahelper.readCurrentMeasurementsFromDevice().then(function (oData) {
					if(aNodes.length > 0){
						oFoundNode = !!aNodes.find(function(n){
							return oData.HostName === n.NodeId;
						});
					}					
					//добавить кейс когда айдишник совпал но имя сети иное
					if(!oFoundNode){
						MessageBox.information("Добавить новое устройство " + oNetworkName + " к вашей сети энергомониторов?", {
							icon: MessageBox.Icon.INFORMATION,
							title: "Обнаружено новое устройство",
							actions: [MessageBox.Action.YES, MessageBox.Action.NO],
							emphasizedAction: MessageBox.Action.YES,
							onClose: function (sAction) {
								if(sAction === MessageBox.Action.YES){
									oNode = {
										NodeName: oNetworkName,
										NodeId: oData.HostName,
										LastRead: new Date().getTime(),
										Status: "ACTIVE"								
									};
									datahelper.saveNodeToDB(this.getOwnerComponent().db, oNode).then(function(){
										MessageToast.show("Устройство добавлено к сети");
										this.readNetworkMap();
									}.bind(this));
								}
								MessageToast.show("Action selected: " + sAction);
							}.bind(this)
						});
					}
				}.bind(this)).catch(function (e, f) {
					console.log(JSON.stringify(e));
					console.log(f);
				});
			}else{
				MessageToast.show("Вы подключены к сети, не содержащей '" + sPrefix + "'");
			}
		},

		onReadMeasurementsPressed: function () {
			var oMeasure;
			var oModel = this.getModel("ui");
			var aList = oModel.getProperty("/list") || [];
			console.log("eto LIST: " + JSON.stringify(aList));
			var oNetwork = oModel.getProperty("/network");
			console.log("eto NETWORK: " + oNetwork);
			datahelper.readCurrentMeasurementsFromDevice(oModel).then(function (oData) {
				oMeasure = mapper.mapMeasurementData(oData, oNetwork)
				aList.push(oMeasure);
				oModel.setProperty("/list", aList);
				return datahelper.saveMeasureToDB(oMeasure);
			}.bind(this)).catch(function (e, f) {
				console.log(JSON.stringify(e));
				console.log(f);
			});
		},

		onExport: function(){
			var oSettings, oSheet, oTable;

			var oRowBinding = this.byId('table').getBinding('items');
			var oModel = oRowBinding.getModel();

			oSettings = {
				workbook: {
					columns: this.createColumnConfig()
				},
				dataSource: oModel.getProperty("/list"),
				fileName: 'Table export sample.xlsx',
				worker: false
			};

			oSheet = new Spreadsheet(oSettings);
			oSheet.build().finally(function() {
				oSheet.destroy();
			});
		},

		createColumnConfig: function() {
			var aCols = [];

			aCols.push({
				label: 'Дата',
				type: EdmType.Number,
				property: 'unixtime'
			});

			aCols.push({
				label: 'Измеритель',
				property: 'point',
				type: EdmType.String
			});

			aCols.push({
				label: 'Сумма',
				property: 'sum',
				type: EdmType.String
			});

			aCols.push({
				label: 'Счётчик1',
				property: 'counter1',
				type: EdmType.String
			});

			aCols.push({
				label: 'Счётчик2',
				property: 'counter2',
				type: EdmType.String

			});

			aCols.push({
				label: 'Счётчик3',
				property: 'counter3',
				type: EdmType.String
			});

			return aCols;
		}

	});
});
