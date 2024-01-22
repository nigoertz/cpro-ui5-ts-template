import BaseController from './BaseController';
import { settingsModel, messageModel } from '../model/provider';
import Event from 'sap/ui/base/Event';
import JSONModel from 'sap/ui/model/json/JSONModel';
import Helper from './Helper';

/**
 * @namespace cpro.ui5.__kunde__.__projekt__.controller.Settings
 */
export default class SettingsController extends BaseController {

  private settingsJSON: any;
  private routeName: string;

  onInit() {
    this.performInitalization();

    this.getView().addEventDelegate({
      onAfterShow: this.onAfterShowHandler.bind(this)
    });
  }

  onAfterShowHandler() {
    this.performInitalization();
  }

  performInitalization(){
    const parts = window.location.href.split("/");
    this.routeName = parts[parts.length - 1];

    settingsModel.register(this);
    messageModel.register(this);

    let route = this.getRouter().getRoute(this.routeName);
    let title;
    let isDeleteButtonVisible = true;
    const oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();

    switch (this.routeName) {
      case 'settings':
        title = oResourceBundle.getText("view-modify-settings");
        break;
      case 'new-settings':
        title = oResourceBundle.getText("view-create-settings");
        isDeleteButtonVisible = false;
        break;
      case 'rollback':
        title = oResourceBundle.getText("view-modify-rollback");
        break;
      case 'new-rollback':
        title = oResourceBundle.getText("view-create-rollback");
        isDeleteButtonVisible = false;
        break;
    }

    const oViewModel = new JSONModel({
      title: title,
      isDeleteButtonVisible: isDeleteButtonVisible,
    });

    this.getView().setModel(oViewModel, "view");

    const getSettingsJSONPromise = new Promise<void>((resolve) => {
      route.attachPatternMatched((oEvent: Event) => {
        this.getSettingsJSON(oEvent).then(() => {
          resolve();
        });
      }, this);
    });
  
    getSettingsJSONPromise.then(() => {
      const oData = new Helper().flattenJSON(this.settingsJSON);
      const oModel = new JSONModel(oData);
      this.getView().setModel(oModel);
    });
  }

  async getSettingsJSON(oEvent: Event): Promise<void> {
    const collection = await settingsModel.getCollection();

    switch (this.routeName) {
      case 'settings':
        settingsModel.setModelFromCollection(1);
        this.settingsJSON = collection[1]?.content;
        break;
      case 'new-settings':
        settingsModel.setModelFromCollection(0);
        this.settingsJSON = collection[0]?.content;
        break;
      case 'rollback':
        settingsModel.setModelFromCollection(2);
        this.settingsJSON = collection[2]?.content;
        break;
      case 'new-rollback':
        settingsModel.setModelFromCollection(0);
        this.settingsJSON = collection[0]?.content;
        break;
    }

    this.getView().getModel("todo").setProperty("/codeEditorVisible", false);
  }

  onUpdateInputField(oEvent: Event) {
    this.handleInputChange(oEvent, "value");
  }

  onUpdatePropertyInputField(oEvent: Event) {
    this.handleInputChange(oEvent, "property");
  }

  handleInputChange(oEvent: Event, propertyType: string) {
    const oInput = oEvent.getSource();
    const sValue = oInput.getValue();
    const oContext = oInput.getBindingContext();
    const sPath = oContext.getPath();
    const propertyName = (propertyType === "property") ? "property" : "value";

    oInput.getModel().setProperty(sPath + "/" + propertyName, sValue);

    const oTreeTable = this.getView().byId("TreeTableBasic");
    var unflattendJSON = new Helper().unflattenJSON(oTreeTable.getModel().oData);
    this.getView().getModel("todo").setProperty("/activeItem/content", JSON.stringify(unflattendJSON, null, 2));
  }

  toggleCodeEditor(){
    var oModel = this.getView().getModel("todo");
    var bCodeEditorVisible = oModel.getProperty("/codeEditorVisible");
    oModel.setProperty("/codeEditorVisible", !bCodeEditorVisible);
  }

  onActivate() {
    var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
    this.openDialog(
      oResourceBundle.getText(this.routeName === "rollback" || this.routeName === "new-rollback" ? "dialog-text-activate-rollback" : "dialog-text-activate-setting"),
      oResourceBundle.getText("label-activate"),
      oResourceBundle.getText("label-cancel"),
      "Emphasized",
      "Transparent",
      (buttonPressed) => {
        if (buttonPressed === "primary") {
          let content = this.getView().getModel("todo").getProperty("/activeItem/content");

          switch (this.routeName) {
            case 'new-settings':
              settingsModel.addOrUpdateToCollection(1, content);
              settingsModel.setSettingsActive(1);
              break;
            case 'new-rollback':
              settingsModel.addOrUpdateToCollection(2, content);
              settingsModel.setSettingsActive(2);
              break;
            case 'settings':
              settingsModel.setSettingsActive(1);
              break;
            case 'rollback':
              settingsModel.setSettingsActive(2);
              break;
          }
          this.navToHome();
        }
    });
  }

  onConvert(){
    var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
    this.openDialog(
      oResourceBundle.getText(this.routeName === "rollback" || this.routeName === "new-rollback" ?
        "dialog-text-use-as-setting" : 
        "dialog-text-use-as-rollback"
      ),
      oResourceBundle.getText("label-convert"),
      oResourceBundle.getText("label-cancel"),
      "Emphasized",
      "Transparent",
      (buttonPressed) => {
        if (buttonPressed === "primary") {
          let content = this.getView().getModel("todo").getProperty("/activeItem/content");

          switch (this.routeName) {
            case 'new-settings':
              settingsModel.addOrUpdateToCollection(2, content);
              break;
            case 'new-rollback':
              settingsModel.addOrUpdateToCollection(1, content);
              break;
            case 'settings':
              settingsModel.addOrUpdateToCollection(2, content);
              break;
            case 'rollback':
              settingsModel.addOrUpdateToCollection(1, content);
              break;
          }
          this.navToHome();
        }
      }
    );
  }

  onDelete(){
    var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
    this.openDialog(
      oResourceBundle.getText(this.routeName === "rollback" || this.routeName === "new-rollback" ?
        "dialog-text-delete-rollback" : 
        "dialog-text-delete-setting"
      ),
      oResourceBundle.getText("label-delete"),
      oResourceBundle.getText("label-cancel"),
      "Reject",
      "Emphasized",
      (buttonPressed) => {
        if (buttonPressed === "primary") {
          switch (this.routeName) {
            case 'settings':
              settingsModel.deleteFromCollection(1);
              break;
            case 'rollback':
              settingsModel.deleteFromCollection(2);
              break;
          }
          this.navToHome();
        }
      }
    );
  }

  onSave() {
    var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
    this.openDialog(
      oResourceBundle.getText("dialog-text-accept-changes"),
      oResourceBundle.getText("label-save"),
      oResourceBundle.getText("label-cancel"),
      "Accept",
      "Default",
      (buttonPressed) => {
        if (buttonPressed === "primary") {

          let content = this.getView().getModel("todo").getProperty("/activeItem/content");
          
          switch (this.routeName) {
            case 'new-settings':
              settingsModel.addOrUpdateToCollection(1, content);
              break;
            case 'new-rollback':
              settingsModel.addOrUpdateToCollection(2, content);
              break;
            case 'settings':
              settingsModel.addOrUpdateToCollection(1, content);
              break;
            case 'rollback':
              settingsModel.addOrUpdateToCollection(2, content);
              break;
          }
          this.navToHome();
        }
      }
    );
  }

  onReject(){
    var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
    this.openDialog(
      oResourceBundle.getText("dialog-text-discard-changes"),
      oResourceBundle.getText("label-discard"),
      oResourceBundle.getText("label-cancel"),
      "Reject",
      "Emphasized",
      (buttonPressed) => {
        if (buttonPressed === "primary") {
            this.performInitalization();
            this.navToHome();
        } 
      }
    );
  }

  openDialog(
    title: string,
    emphasizedButtonText: string,
    rejectButtonText: string,
    typePrimary: string,
    typeSecondary: string,
    callback: (buttonPressed: string) => void) {
    const oView = this.getView();
    let oDialog = oView.byId("popupDialog");

    var oSettingsData = {
        title: title,
        emphasizedButtonText: emphasizedButtonText,
        rejectButtonText: rejectButtonText,
        typePrimary: typePrimary,
        typeSecondary: typeSecondary
    };

    var oSettingsModel = new JSONModel(oSettingsData);
    oDialog.setModel(oSettingsModel, "settings");

    oDialog.attachAfterClose(() => {
        const buttonPressed = oDialog.data("buttonPressed");
        callback(buttonPressed);
    });

    oDialog.open();
  }

  onPrimaryPress(){
    const oDialog = this.byId("popupDialog") as any;
    oDialog.data("buttonPressed", "primary");
    oDialog.close();
  }

  onSecondaryPress(){
    const oDialog = this.byId("popupDialog") as any;
    oDialog.data("buttonPressed", "secondary");
    oDialog.close();
  }
}