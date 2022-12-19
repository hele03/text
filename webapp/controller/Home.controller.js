sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/ui/model/json/JSONModel',
    "sap/ui/core/Core",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Label",
    "sap/m/library",
    "sap/m/MessageToast",
    "sap/m/TextArea",
    'sap/ui/export/Spreadsheet',
    'sap/ui/core/util/MockServer',
    'sap/ui/model/odata/v2/ODataModel'

],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, Core, Dialog, Button, Label, mobileLibrary, MessageToast, TextArea, Spreadsheet, MockServer, ODataModel) {
        "use strict";


        return Controller.extend("zprogetto.controller.Home", {
            onInit: function () {
                //tabella
                $.ajax({
                    url: "/model/ModelHome.json",
                    type: "GET",
                    dataType: "json",
                    success: (data) => {
                        const oTabella = new sap.ui.model.json.JSONModel({
                            lista: { ...data },

                        });
                        // Assegnazione Model
                        this.getView().setModel(oTabella);
                    },
                    error: function (err) {
                        console.log(err);
                    },
                });

                //prova
                var oModello, oView;

                this._sServiceUrl = './localService';

                this._oMockServer = new MockServer({
                    rootUri: this._sServiceUrl + "/"
                });

                var sPath = sap.ui.require.toUrl('sap/ui/export/sample/localService');
                this._oMockServer.simulate(sPath + '/metadata.xml', sPath + '/mockdata');
                this._oMockServer.start();

                oModello = new ODataModel(this._sServiceUrl);

                oView = this.getView();
                oView.setModel(oModello);
            },
            onCancelPress: function () {
                this.byId("myDialog").close();
            },

            onOkPress: function () {
                this.byId("myDialog").close();
            },

            //per la modale
            onItemPress: function (event) {
                var dialog = this.byId("myDialog");
                var item = event.getSource();
                dialog.setBindingContext(item.getBindingContext());
                dialog.open();
            },

            //per l'export
            createColumnConfig: function () {
                return [
                    {
                        label: 'AMMINISTRAZIONE',
                        property: 'AMMINISTRAZIONE',
                        width: '25'
                    },
                    {
                        label: 'PROSPETTO',
                        property: 'PROSPETTO',
                        width: '25'
                    },
                    {
                        label: 'DESCRIZIONE',
                        property: 'DESCRIZIONE',
                        width: '25'
                    },
                    {
                        label: 'ANNO_FASE',
                        property: 'ANNO_FASE',
                        width: '25'
                    },
                    {
                        label: 'FASE',
                        property: 'FASE',
                        width: '25'
                    },
                    {
                        label: 'NOTA',
                        property: 'NOTA',
                    }];
            },
            onExport: function () {
                var aCols, aProducts, oSettings, oSheet;

                aCols = this.createColumnConfig();
                aProducts = this.getView().getModel().getProperty('/lista/Prospetti');

                oSettings = {
                    workbook: { columns: aCols },
                    dataSource: aProducts
                };

                oSheet = new Spreadsheet(oSettings);
                oSheet.build()
                    .then(function () {
                        MessageToast.show('Spreadsheet export has finished');
                    })
                    .finally(function () {
                        oSheet.destroy();
                    });
            },
            cerca: function () {
                // const bilancio = this.byId("descrizione").getSelectedItem().getProperty("text")
                const amministrazione = this.byId("amministrazione").getSelectedItem().getProperty("text")
                const prospetto = this.byId("progetto").getSelectedItem().getProperty("text")

                // const modello = this.getView().getModel();
                // let tables = modello.getProperty("/lista/Prospetti");
                const table = this.byId("Tabella");
                const binding = table.getBinding("items");
                const filter = [];
                filter.push(
                    
                    new sap.ui.model.Filter("AMMINISTRAZIONE", "EQ", amministrazione),
                    new sap.ui.model.Filter("PROSPETTO", "EQ", prospetto)
                );
                binding.filter(filter);
            },
            refresh: function (oControlEvent) {
                var oBinding=this.getView().byId("Tabella").getBinding("items")
                oBinding.filter([]);
                this.getView().byId("Tabella").setShowOverlay(false);ù
            },
            cancella: function () {
                var oSelected = this.byId("Tabella").getSelectedItem();

                if (oSelected) {
                    const amministrazione = oSelected
                        .getAggregation("cells")[0]
                        .getProperty("text");

                    const model = this.getView().getModel();
                    let table = model.getProperty("/lista/Prospetti");

                    const index = table.findIndex((table) => table.AMMINISTRAZIONE == amministrazione);

                    table.splice(index, 1);
                    model.setProperty("/lista/Prospetti", table);


                }
            },


        });
    });
