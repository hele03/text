sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/ui/model/json/JSONModel',
    'sap/ui/core/util/MockServer',
	'sap/ui/export/Spreadsheet',
	'sap/ui/model/odata/v2/ODataModel'
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, MockServer, Spreadsheet,ODataModel) {
        "use strict";

        return Controller.extend("zprogetto.controller.Home", {
            onInit: function () {
                //tabella
                $.ajax({
                    url: "https://jsonplaceholder.typicode.com/users",
                    type: "GET",
                    dataType: "json",
                    success: (data) => {
                        const oTabella = new sap.ui.model.json.JSONModel({
                            lista: [...data],
                        });
                        // Assegnazione Model
                        this.getView().setModel(oTabella, "Modello");
                    },
                    error: function (err) {
                        console.log(err);
                    },
                });

                var oData = {
                    "SelectedProduct": "HT-1001",
                    "ProductCollection": [
                        {
                            "ProductId": "Mare",
                            "Name": "Mare",
                            "Icon": "sap-icon://umbrella"
                        },
                        {
                            "ProductId": "Montagna",
                            "Name": "Montagna",
                            "Icon": "sap-icon://background"
                        },
                        {
                            "ProductId": "Lago",
                            "Name": "Lago",
                            "Icon": "sap-icon://heating-cooling"
                        },
                    ]
                };
                var oModel = new JSONModel(oData);
                this.getView().setModel(oModel);
            },
            //per l'export
            createColumnConfig: function() {
                var aCols = [];
    
                aCols.push({
                    label: 'Full name',
                    property: ['Lastname', 'Firstname'],
                    type: 'string',
                    template: '{0}, {1}'
                });
    
                aCols.push({
                    label: 'ID',
                    type: 'number',
                    property: 'UserID',
                    scale: 0
                });
    
                aCols.push({
                    property: 'Firstname',
                    type: 'string'
                });
    
                aCols.push({
                    property: 'Lastname',
                    type: 'string'
                });
    
                aCols.push({
                    property: 'Birthdate',
                    type: 'date'
                });
    
                aCols.push({
                    property: 'Salary',
                    type: 'number',
                    scale: 2,
                    delimiter: true
                });
    
                aCols.push({
                    property: 'Currency',
                    type: 'string'
                });
    
                aCols.push({
                    property: 'Active',
                    type: 'boolean',
                    trueValue: 'YES',
                    falseValue: 'NO'
                });
    
                return aCols;
            },
            onExport: function () {
                var aCols, oRowBinding, oSettings, oSheet, oTable;

                if (!this._oTable) {
                    this._oTable = this.byId('Tabella');
                }

                oTable = this._oTable;
                oRowBinding = oTable.getBinding('items');

                aCols = this.createColumnConfig();

                var oModel = oRowBinding.getModel();

                oSettings = {
                    workbook: {
                        columns: aCols,
                        hierarchyLevel: 'Level'
                    },
                    dataSource: {
                        type: 'odata',
                        dataUrl: oRowBinding.getDownloadUrl ? oRowBinding.getDownloadUrl() : null,
                        serviceUrl: this._sServiceUrl,
                        headers: oModel.getHeaders ? oModel.getHeaders() : null,
                        count: oRowBinding.getLength ? oRowBinding.getLength() : null,
                        useBatch: true
                    },
                    worker: false
                };

                oSheet = new Spreadsheet(oSettings);
                oSheet.build().finally(function () {
                    oSheet.destroy();
                });
            },
        });
    });
