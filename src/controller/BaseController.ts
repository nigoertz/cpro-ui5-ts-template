import Router from 'sap/f/routing/Router';
import Controller from 'sap/ui/core/mvc/Controller';
import { configModel } from '../model/provider';
import { AppUserLanguage } from '../model/Config.model';
import Event from 'sap/ui/base/Event';
import Popover from 'sap/m/Popover';
import Fragment from 'sap/ui/core/Fragment';

/**
 * @namespace cpro.ui5.settings_ui.controller.BaseController
 */
export default class BaseController extends Controller {
  private settingsPopoverPath: string =
    'cpro/ui5//__projekt__/view/Fragments/Settings';
  private messagesPopoverPath: string =
    'cpro/ui5//__projekt__/view/Fragments/Messages';

  private popovers: Record<string, Popover> = {};

  public getAppResourceBundleText(identifier: string): string {
    return (
      this.getOwnerComponent()
        .getModel('i18n')
        // @ts-ignore
        .getResourceBundle()
        .getText(identifier)
    );
  }
  public getRouter(): Router {
    // @ts-ignore
    return this.getOwnerComponent().getRouter();
  }

  public navToHome(): void {
    this.getRouter().navTo('home');
  }

  public navToAbout(): void {
    this.getRouter().navTo('about');
  }

  public navToNewTodoForm(): void {
    this.getRouter().navTo('todo-form');
  }

  protected toggleDarkTheme(): void {
    this.getView().setBusy(true);
    configModel.toggleFioriTheme();
    this.getView().setBusy(false);
  }

  protected setLanguage(languageName: AppUserLanguage) {
    configModel.setLanguage(languageName);
  }

  private async openSettings(event: Event) {
    const button = event.getSource();
    const view = this.getView();

    if (!this.popovers[this.settingsPopoverPath]) {
      this.popovers[this.settingsPopoverPath] = (await Fragment.load({
        name: this.settingsPopoverPath,
        controller: this,
      })) as Popover;
      view.addDependent(this.popovers[this.settingsPopoverPath]);
    }
    this.popovers[this.settingsPopoverPath].openBy(button, true);
  }

  private closeSettings() {
    this.popovers[this.settingsPopoverPath].close();
  }

  private async toggleMessageManager(event: Event) {
    const button = event.getSource();
    const view = this.getView();

    if (!this.popovers[this.messagesPopoverPath]) {
      this.popovers[this.messagesPopoverPath] = (await Fragment.load({
        name: this.messagesPopoverPath,
        controller: this,
      })) as Popover;
      view.addDependent(this.popovers[this.messagesPopoverPath]);
    }
    this.popovers[this.messagesPopoverPath].openBy(button, true);
  }
}
