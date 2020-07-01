sap.ui.define([
	"sap/ui/core/UIComponent",
	"com/ok40/powermon/model/models"
], function(UIComponent, models) {
	"use strict";
	
	return UIComponent.extend("com.ok40.powermon.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function() {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// set the device model
			this.setModel(models.createDeviceModel(), "device");

			// set the config model
			this.setModel(models.createConfigModel(), "config");

			// create the views based on the url/hash
			this.getRouter().initialize();

			this.getRouter().navTo("splashscreen");
		}, 

	});
});