sap.ui.define([
    "sap/ui/core/mvc/Controller",
    // 'sap/ui/model/json/JSONModel',
    // "sap/ui/core/Core",
    // "sap/m/Dialog",
    // "sap/m/Button",
    // "sap/m/Label",
    // "sap/m/library",
    "sap/m/MessageToast",
    "sap/m/TextArea",
    'sap/ui/export/Spreadsheet',
    'sap/ui/core/util/MockServer',
    'sap/ui/model/odata/v2/ODataModel'

],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, MessageToast, TextArea, Spreadsheet, MockServer, ODataModel) {
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
                this.initRichTextEditor(true); //per rich Text
                this.zinitRichTextEditor(true)

                //modello per tabella
                const oTabella1 = new sap.ui.model.json.JSONModel({
                    lista: [],
                });
                this.getView().setModel(oTabella1, "ModelloRich");

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
                    dataSource: aProducts,
                    fileName: "Info.xlsx" //per nominare il file di export

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
                var oBinding = this.getView().byId("Tabella").getBinding("items")
                oBinding.filter([]);
                this.getView().byId("Tabella").setShowOverlay(false);
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
            getSplitAppObj: function () {
                var result = this.byId("app");
                if (!result) {
                    Log.info("SplitApp object can't be found");
                }
                return result;
            },
            onPressDetailBack: function () {
                this.getSplitAppObj().to(this.createId("page"));
            },
            nuovoprospetto: function () {
                // this._oNavContainer.to(this.byId("prospetto"));
                this.getSplitAppObj().to(this.createId("prospetto"));
            },
            initRichTextEditor: function (bIsTinyMCE5) {
                var that = this,
                    sHtmlValue = '';
                sap.ui.require(["sap/ui/richtexteditor/RichTextEditor", "sap/ui/richtexteditor/library"],
                    function (RTE, library) {
                        var EditorType = library.EditorType;
                        that.oRichTextEditor = new RTE("myRTE", {
                            editorType: bIsTinyMCE5 ? EditorType.TinyMCE5 : EditorType.TinyMCE6,
                            width: "100%",
                            height: "400px",
                            customToolbar: true,
                            showGroupFont: true,
                            showGroupLink: true,
                            showGroupInsert: true,
                            value: sHtmlValue,
                            ready: function () {
                                bIsTinyMCE5 ? this.addButtonGroup("styleselect").addButtonGroup("table") : this.addButtonGroup("styles").addButtonGroup("table");
                            }
                        });

                        that.getView().byId("idVerticalLayout").addContent(that.oRichTextEditor);
                    });
            },
            //prova secondo


            zinitRichTextEditor: function (bIsTinyMCE5) {
                var that = this,
                    sHtmlValue = '';
                sap.ui.require(["sap/ui/richtexteditor/RichTextEditor", "sap/ui/richtexteditor/library"],
                    function (RTE, library) {
                        var EditorType = library.EditorType;
                        that.oRichTextEditor1 = new RTE("myRTE1", {
                            editorType: bIsTinyMCE5 ? EditorType.TinyMCE5 : EditorType.TinyMCE6,
                            width: "100%",
                            height: "400px",
                            customToolbar: true,
                            showGroupFont: true,
                            showGroupLink: true,
                            showGroupInsert: true,
                            value: sHtmlValue,
                            ready: function () {
                                bIsTinyMCE5 ? this.addButtonGroup("styleselect").addButtonGroup("table") : this.addButtonGroup("styles").addButtonGroup("table");
                            }
                        });

                        that.getView().byId("idVerticalLayout2").addContent(that.oRichTextEditor1);
                    });
            },
            saverich: function () {
                var numprosp = this.byId("numeroprospetto").getValue()
                var sprimorich = sap.ui.getCore().byId("myRTE").getValue()
                var ssecondorich = sap.ui.getCore().byId("myRTE1").getValue()
                // console.log(sprimorich,ssecondorich)

                var values = {
                    numpros1: numprosp,
                    primorich1: sprimorich,
                    secondorich1: ssecondorich
                }

                const tabella = this.getView().getModel("ModelloRich").getProperty("/lista") || [];
                tabella.push(values)
                this.getView().getModel("ModelloRich").setProperty("/lista", tabella)


            },
            //per nuova tabella
            nuovatabella: function () {
                this.getSplitAppObj().to(this.createId("tabellarisult"));
            },
            onPressDetailBack1: function () {
                this.getSplitAppObj().to(this.createId("prospetto"));
            },

            //per la dialog
            onMessageInformationDialogPress: function (event) {
                var dialog = this.byId("dialog");
                var item = event.getSource();
                dialog.setBindingContext(item.getBindingContext());
                dialog.open();
            },
            insert: function () {
                this.byId("dialog").close();
                var statoprev = this.byId("stato").getProperty("value")
                var numeropro = this.byId("numero").getProperty("value")
                var descprosp = this.byId("descrizionepres").getProperty("value")
                var nota = this.byId("nota").getProperty("value")

                if (statoprev != "" && numeropro != "" && descprosp != "") {
                    var values = {
                        AMMINISTRAZIONE: parseInt(statoprev),
                        PROSPETTO: descprosp,
                        DESCRIZIONE: numeropro,
                        NOTA: nota
                    }

                    let tabella = this.getView().getModel().getProperty("/lista/Prospetti")
                    tabella.unshift(values)
                    this.getView().getModel().setProperty("/lista/Prospetti", tabella)
                    //per sbiancare una volta avvenuto l'inserimento
                    this.byId("stato").setValue("")
                    this.byId("numero").setValue("")
                    this.byId("descrizionepres").setValue("")
                    this.byId("nota").setValue("")
                }

            },
            deletecamp: function () { //cancella i campi della di
                this.byId("stato").setValue("")
                this.byId("numero").setValue("")
                this.byId("descrizionepres").setValue("")
                this.byId("nota").setValue("")
            },
            closedialog: function () { //per chiudere la dialog
                this.byId("dialog").close()
            }

        });
    });
