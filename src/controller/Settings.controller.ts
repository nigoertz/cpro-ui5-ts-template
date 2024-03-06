import BaseController from './BaseController';
import { settingsModel, messageModel } from '../model/provider';
import Event from 'sap/ui/base/Event';
import JSONModel from 'sap/ui/model/json/JSONModel';
import Helper from './Helper';
import ResizeHandler from 'sap/ui/core/ResizeHandler';
import MessageToast from 'sap/m/MessageToast';
import Cookies from 'js-cookie';

/**
 * @namespace cpro.ui5.settings_ui.controller.Settings
 */
export default class SettingsController extends BaseController {

  private settingsJSON: any;
  private routeName: string;

  onInit() {
    this.performInitalization();

    //Once initialized, values may change. By utilizing the onAfterShowHandler, we can easily 
    //reinitialize everytime we visit the view:
    this.getView().addEventDelegate({ onAfterShow: this.onAfterShowHandler.bind(this) });
  }

  onAfterShowHandler() {
    this.performInitalization();
    ResizeHandler.register(this.getView().getDomRef(), this.onResize.bind(this));
  }

  performInitalization(){
    settingsModel.register(this);
    messageModel.register(this);
    
    // Takes the url and splits it to it's route
    const parts = window.location.href.split("/");
    this.routeName = parts[parts.length - 1];
    
    // Sets the title of the Settings.view
    const titleMapping = {
      'settings': 'view-modify-settings',
      'new-settings': 'view-create-settings',
      'rollback': 'view-modify-rollback',
    };

    const oViewModel = new JSONModel({
      title: this.getOwnerComponent().getModel("i18n").getResourceBundle().getText(titleMapping[this.routeName]),
      editable: this.routeName === 'rollback' ? false : true
    });

    this.getView().setModel(oViewModel, "view");

    // Promise for JSON loading
    const getSettingsJSONPromise = new Promise<void>((resolve) => {
      this.getRouter().getRoute(this.routeName).attachPatternMatched((oEvent: Event) => {
        this.getSettingsJSON().then(() => {
          resolve();
        });
      }, this);
    });
  
    // Sets the flattend model for the TreeTable and the codeeditor
    getSettingsJSONPromise.then(() => {
      const oData = new Helper().flattenJSON(this.settingsJSON);
      const oModel = new JSONModel(oData);
      this.getView().setModel(oModel);
      this.loadTreeTable();
      this.onResize();
    }); 
  }
 
  async getSettingsJSON(): Promise<void> {
    let content = {};

    switch (this.routeName) {
      case 'new-settings':
        content = settingsModel.getCollection().find(element => element.id === 0)?.content;
        settingsModel.setModelFromCollection(0);
        break;
      case 'settings':
        content = settingsModel.getCollection().find(element => element.id === 1)?.content;
        settingsModel.setModelFromCollection(1);
        break;
      case 'rollback':
        content = settingsModel.getCollection().find(element => element.id === 2)?.content;
        settingsModel.setModelFromCollection(2);
        break;
    }

    if (content === undefined) {
      this.navToHome();
    } else {
      this.settingsJSON = content;
    }

    // Hides the code editor initially
    this.getView().getModel("todo").setProperty("/codeEditorVisible", false);
  }

  onUpdateValueInputField(oEvent: Event) {
    this.handleInputChange(oEvent, "value");
  }

  onUpdatePropertyInputField(oEvent: Event) {
    this.handleInputChange(oEvent, "property");
  }

  handleInputChange(oEvent: Event, propertyType: string) {
    const oInput = oEvent.getSource();
    const propertyName = (propertyType === "property") ? "property" : "value";
    oInput.getModel().setProperty(oInput.getBindingContext().getPath() + "/" + propertyName, oInput.getValue());
    this.loadTreeTable();
  }

  loadTreeTable(){
    const oTreeTable = this.getView().byId("TreeTableBasic");
    var unflattendJSON = new Helper().unflattenJSON(oTreeTable.getModel().oData);
    this.getView().getModel("todo").setProperty("/activeItem/content", JSON.stringify(unflattendJSON, null, 2));
  }
  
  toggleCodeEditor(){
    var oModel = this.getView().getModel("todo");
    var bCodeEditorVisible = oModel.getProperty("/codeEditorVisible");
    oModel.setProperty("/codeEditorVisible", !bCodeEditorVisible);
  }

  onSavePress(){
    const oDialog = this.byId("popupDialog") as any;
    oDialog.data("buttonPressed", "primary");
    oDialog.close();
  }

  onCancelSavePress(){
    const oDialog = this.byId("popupDialog") as any;
    oDialog.close();
  }

  onResetPress(){
    const oDialog = this.byId("resetDialog") as any;
    oDialog.data("buttonPressed", "primary");
    oDialog.close();
  }

  onCancelResetPress(){
    const oDialog = this.byId("resetDialog") as any;
    oDialog.close();
  }
 
  onSaveNew() {
    let oDialog = this.getView().byId("popupDialog");
   
    oDialog.attachAfterClose(() => {
      const buttonPressed = oDialog.data("buttonPressed");
      if (buttonPressed === "primary") {
        let content = this.getView().getModel("todo").getProperty("/activeItem/content");
        this.updateSettings(1, content);
      }
    });
  
    oDialog.open();
  }

  onReset(){
    let oDialog = this.getView().byId("resetDialog");

    oDialog.attachAfterClose(() => {
      const buttonPressed = oDialog.data("buttonPressed");
      if (buttonPressed === "primary") {
        let content = settingsModel.getCollection().find(e => e.id === 0).content;
        this.updateSettings(1, JSON.stringify(content, null, 2));
      }
    });

    oDialog.open();
  }

  updateSettings(id:int, content:any){
    var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();

    const routeNameMapping = {
      'new-settings': 1,
      'settings': 1,
      'rollback': 2,
    };
    
    let target = routeNameMapping[this.routeName];
    let url = target === 1 ? "/api/cpro/settings/systems" : "/api/cpro/settings/systems/revert-changes";

    console.log(url, target, content, id);

    $.ajax({
      type: "POST",
      url: Cookies.get('current_server_url') + url,
      data: content,
      headers: {
        Authorization: Cookies.get('access_token').value
      },
      contentType: "application/json",
      success: function (res, status, xhr) {
        settingsModel.addOrUpdateToCollection(id, content);
        MessageToast.show(oResourceBundle.getText("table-settings-column-active"));
      },
      error: function (jqXHR, textStatus, errorThrown) {
        MessageToast.show(oResourceBundle.getText(errorThrown));
      }
    });

  }

  onResize(){
    var rowHeight = 39;
    var innerWidth = 1280;
    
    var heightWithoutHEaderAndFooter = window.innerHeight - 88;
    var newTreeTableColumnCount = Math.round((heightWithoutHEaderAndFooter - (rowHeight * 2)) / rowHeight)
    var newEditorHeight = (newTreeTableColumnCount + 1) * rowHeight + 3;

    this.getView().getModel("todo").setProperty("/treeTableRowCount", newTreeTableColumnCount);
    this.getView().getModel("todo").setProperty("/codeEditorHeight", newEditorHeight.toString() + "px");
    this.getView().getModel("todo").setProperty("/treeTableColumnWidth",  (innerWidth / 4).toString() + "px");
    this.getView().getModel("todo").setProperty("/codeEditorWidth",  (innerWidth / 2).toString() + "px");
  }
  
}