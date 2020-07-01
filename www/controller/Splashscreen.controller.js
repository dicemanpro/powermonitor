sap.ui.define([
    "com/ok40/powermon/controller/BaseController"
], function(BaseController){
    
"use strict";

return BaseController.extend("com.ok40.powermon.controller.Splashscreen", {
    
    onInit: function() {

        if (window.hasOwnProperty("cordova")) {
            document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
        } else {
            this.getRouter().getRoute("splashscreen").attachPatternMatched(this.onDeviceReady, this);
        }        
    }, 

    onDeviceReady: function() {

        var oComp = this.getOwnerComponent();

        // check for availability and permission on microphone
        //this._prepareSpeechRecognition();

        if(!oComp.pIndexDBReady){
            oComp.pIndexDBReady = this._prepareIndexDB(); 
        }        

        this.getRouter().navTo("main");
    }
});
});
