import Event from 'sap/ui/base/Event';
import BaseController from './BaseController';
import { settingsModel, messageModel } from '../model/provider';
import {AppBinding, AppEventProvider, AppSortEventParameters} from '../@types/UI5Shims';
import JSONModel from 'sap/ui/model/json/JSONModel';
import MessageToast from 'sap/m/MessageToast';
import Cookies from 'js-cookie';
import Dialog from 'sap/m/Dialog';

/**
 * @namespace cpro.ui5.__kunde__.__projekt__.controller.Home
 */
export default class HomeController extends BaseController {

  private settingsTitle: string;
  private rollbackTitle: string;
  private collection: any;
  private server: string;
  
  onInit() {
    messageModel.register(this);
    settingsModel.register(this);

    this.getView().addEventDelegate({
      onAfterShow: this.onAfterShowHandler.bind(this)
    });
  }

  onAfterShowHandler() {
    if (Cookies.get("access_token")) {
      this.createGridItems();
    } else {
      if (this.getView().getModel("i18n")) {
        this.getView().setModel(new JSONModel({ buttonEnabled: false }));
        let oDialog = this.getView().byId("login");
        this.getView().addDependent(oDialog);
        (oDialog as Dialog).open();
      } 
    } 
  }

  onInputChange(oEvent: Event){
    var urlVal = this.getView().byId("url").getValue();
    var usernameVal = this.getView().byId("username").getValue();
    var passwordVal = this.getView().byId("password").getValue();
    
    var isButtonEnabled = !(urlVal === "" || usernameVal === "" || passwordVal === "");
    this.getView().getModel().setProperty("/buttonEnabled", isButtonEnabled);
  }

  onGridItemPress(oEvent: Event){
    let path = this.determinePath(oEvent.getSource().getProperty("text"));
    this.getOwnerComponent().getRouter().navTo(path);      
  }

  determinePath(buttonText: string): string {
    if (buttonText === this.settingsTitle) {
      return this.collection.find(element => element.id === 1) ? "settings" : "new-settings";
    } else {
      return "rollback";
    }
  }

  onAcceptPress(){
    const context = this;
    this.server = this.standardizeServerURL(this.byId("url").getValue());
    const user = this.byId("username").getValue();
    const password = this.byId("password").getValue();

    // create token:
    $.ajax({
      type: "POST",
      url: this.server + "/auth/token",
      data: JSON.stringify({
        client_id: "node-red-admin",
        grant_type: "password", 
        scope: "*",
        username: user,
        password: password
      }),
      headers: {},
      contentType: "application/json",
      success: function (res, status, xhr) {
        Cookies.set('access_token', res.access_token, { expires: 7 });
        Cookies.set('current_server_url', context.server, { expires: 7 });
        context.byId("login").close();
        context.createGridItems();
      },
      error: function (jqXHR, textStatus, errorThrown) {
        context.MessageToast(jqXHR, textStatus, errorThrown);
      }
    });
    
  }

  createGridItems(){  
    var context = this; 
    context.server = Cookies.get('current_server_url');
    context.collection = settingsModel.getCollection();
    const oResourceBundle = context.getOwnerComponent().getModel("i18n").getResourceBundle();
    context.settingsTitle = oResourceBundle.getText("grid-item-current");
    context.rollbackTitle = oResourceBundle.getText("grid-item-rollback");
       
    // settings laden
    $.ajax({
      type: "GET",
      url: context.server + "/api/cpro/settings/systems/",
      headers: {
        Authorization: Cookies.get('access_token')
      },
      success: function (res, status, xhr) {
        if (res !== undefined && res !== null && Object.keys(res).length !== 0){
          settingsModel.addOrUpdateToCollection(1, res);
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        context.MessageToast(jqXHR, textStatus, errorThrown);
      }
    });

    // backup laden
    $.ajax({
      type: "GET",
      url: context.server + "/api/cpro/settings/systems/backup",
      headers: {
        Authorization: Cookies.get('access_token')
      },
      success: function (res, status, xhr) {
        if (res !== undefined && res !== null && Object.keys(res).length !== 0){
          settingsModel.addOrUpdateToCollection(2, res);
        
          var gritItems = `{"items": [{
            "title": "${context.settingsTitle}",
            "icon": "sap-icon://action-settings",
            "function": "toSetting",
            "visible": true
          },{
            "title": "${context.rollbackTitle }",
            "icon": "sap-icon://undo",
            "function": "toRollback",
            "visible": ${res !== undefined && res !== null && Object.keys(JSON.parse(res)).length !== 0}
          }]}`
  
          var oModel = new JSONModel(JSON.parse(gritItems));
          context.getView().setModel(oModel);
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        context.MessageToast(jqXHR, textStatus, errorThrown);
      }
    });
  }

  standardizeServerURL(inputUrl: string){
    // Add http:// if not present in the input
    if (!/^https?:\/\//i.test(inputUrl)) {
      inputUrl = 'http://' + inputUrl;
    }
  
    // Parse the input URL
    let url = new URL(inputUrl);
  
    // Get the scheme, hostname, and port
    let scheme = url.protocol.replace(':', '');
    let hostname = url.hostname;
    let port = url.port ? `:${url.port}` : '';
  
    // Construct the standardized URL
    let standardizedUrl = `${scheme}://${hostname}${port}`;
  
    return standardizedUrl;
  }
    
}