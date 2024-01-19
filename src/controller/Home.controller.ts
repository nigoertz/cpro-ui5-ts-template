import Event from 'sap/ui/base/Event';
import BaseController from './BaseController';
import { settingsModel, messageModel } from '../model/provider';
import {
  AppBinding,
  AppEventProvider,
  AppSortEventParameters,
} from '../@types/UI5Shims';
import Dialog from 'sap/m/Dialog';
import JSONModel from 'sap/ui/model/json/JSONModel';

/**
 * @namespace cpro.ui5.__kunde__.__projekt__.controller.Home
 */
export default class HomeController extends BaseController {

  private settingsTitle: string;
  private rollbackTitle: string;
  private collection: any;
  private oResourceBundle: any;

  onInit() {
    messageModel.register(this);
    settingsModel.register(this);
    this.createGridItems();

    this.getView().addEventDelegate({
      onAfterShow: this.onAfterShowHandler.bind(this)
   });
  }

  onAfterShowHandler() {
    this.collection = settingsModel.getCollection();
    this.createGridItems();
  }

  createGridItems(){
    this.collection = settingsModel.getCollection();

    this.oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
    this.settingsTitle = this.oResourceBundle.getText("grid-item-current");
    this.rollbackTitle = this.oResourceBundle.getText("grid-item-rollback");

    var gritItems = `{"items": [{
        "title": "${this.settingsTitle}",
        "icon": "sap-icon://action-settings",
        "function": "toSetting",
        "stateText": "${this.getStateText(1)}",
        "stateColorInfoLabel": ${this.getStateColorInfoLabel(1)},
        "stateColorHightlight": "${this.getStateColorHightlight(1)}"

      },{
        "title": "${this.rollbackTitle }",
        "icon": "sap-icon://undo",
        "function": "toRollback",
        "stateText": "${this.getStateText(2)}",
        "stateColorInfoLabel": ${this.getStateColorInfoLabel(2)},
        "stateColorHightlight": "${this.getStateColorHightlight(2)}"
      }]}`

    var oModel = new JSONModel(JSON.parse(gritItems));
    this.getView().setModel(oModel);
  }

  getStateText(id: int){
    let notPresent = this.oResourceBundle.getText("table-settings-column-not-present");
    let active = this.oResourceBundle.getText("table-settings-column-active");
    let inActive = this.oResourceBundle.getText("table-settings-column-inactive");
    return !this.collection.some(element => element.id === id) ? notPresent : this.collection.find(element => element.id === id && element.active) ? active : inActive
  }

  getStateColorInfoLabel(id: int){
    return !this.collection.some(element => element.id === id) ? 1 : this.collection.find(element => element.id === id && element.active) ? 0 : 3
  }

  getStateColorHightlight(id: int){
    return !this.collection.some(element => element.id === id) ? "Warning" : this.collection.find(element => element.id === id && element.active) ? "Success" : "Error"
  }

  onGridItemPress(oEvent: Event){
    var oButton = oEvent.getSource();
    var buttonText = oButton.getProperty("text");
    var path = this.determinePath(buttonText);
    this.getOwnerComponent().getRouter().navTo(path);      
  }

  determinePath(buttonText: string): string {
    if (buttonText === this.settingsTitle) {
      return this.collection.find(element => element.id === 1) ? "settings" : "new-settings";
    } else {
      return this.collection.find(element => element.id === 2) ? "rollback" : "new-rollback";
    }
  }
  
}