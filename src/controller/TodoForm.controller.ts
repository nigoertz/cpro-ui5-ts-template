import BaseController from './BaseController';
import { settingsModel, messageModel } from '../model/provider';
import MessageToast from 'sap/m/MessageToast';
import Core from 'sap/ui/core/Core';
import JSONModel from 'sap/ui/model/json/JSONModel';
import Helper from './Helper';
import InputBase from 'sap/m/InputBase';

interface AppFormError {
  errorFieldTitle: string;
}

/**
 * @namespace cpro.ui5.__kunde__.__projekt__.controller.TodoForm
 */
export default class TodoFormController extends BaseController {
  onInit() {
    this.performInitalization();
  }

  performInitalization(){
    settingsModel.register(this);
    messageModel.register(this);
    const jsonData = JSON.parse(settingsModel.getProperty('/form').content);
    const oData = new Helper().flattenJSON(jsonData);
    const oModel = new JSONModel(oData);
    this.getView().setModel(oModel);

    // Set the default title as a placeholder
    const initialForm = settingsModel.getProperty('/form');

    const codeEditorContent = this.getView().byId('CodeEditorBasic');
    codeEditorContent.setValue(codeEditorContent.content);

    const todoTitleInput = this.getView().byId('todoTitle');
    todoTitleInput.setPlaceholder(initialForm.title);
  }

  onUpdateInputField(oEvent: Event) {
    const oInput = oEvent.getSource();
    const sValue = oInput.getValue();

    // Get the binding context to determine the path
    const oContext = oInput.getBindingContext();
    const sPath = oContext.getPath();

    // Update the model directly
    oInput.getModel().setProperty(sPath + "/value", sValue);

    // Rest of your code...
    var unflattendJSON = "{}";
    const oTreeTable = this.getView().byId("TreeTableBasic");
    unflattendJSON = new Helper().unflattenJSON(oTreeTable.getModel().oData);

    this.getView().getModel("todo").setProperty("/form/content", JSON.stringify(unflattendJSON, null, 2));
  }

  onPressAcceptButton() {
    const formErrors = this.handlesettingsFormValidation();
    if (formErrors.length === 0) {
      settingsModel.addToCollection(3);
      MessageToast.show('Setting added!');
      messageModel.addSuccessMessage({ message: 'Setting added successfully' });
      return this.navToHome();
    }

    formErrors.forEach((error) => {
      messageModel.addErrorMessage({
        message: `Form errors at ${error.errorFieldTitle}`,
        description: `Error title▹ ${error.errorFieldTitle}`,
      });
    });
    MessageToast.show('Could not create Setting!');
  }

  onPressRejectButton(){
    this.performInitalization();
    this.navToHome();
  }

  handlesettingsFormValidation() {
    const settingsFormFields = Core.byFieldGroupId(
      'todoFormInput',
    ) as InputBase[];
    const settingsFormErrors: AppFormError[] = [];

    const checkFieldForValidity = (formField: InputBase) => {
      const isRequiredField = formField.getProperty('required');
      const isInvalidField = formField.getProperty('valueState') === 'Error';
      const isEmptyField = formField.getProperty('value').length === 0;
      return isRequiredField && (isInvalidField || isEmptyField);
    };

    const addEntryToFormErrors = (formField: InputBase) => {
      settingsFormErrors.push({
        errorFieldPlaceholder: formField.getProperty('placeholder'),
        errorFieldDescription: formField.getProperty('valueStateText'),
        errorFieldGroupIds: formField.getProperty('fieldGroupIds'),
        errorFieldId: formField.getId(),
      });
    };

    settingsFormFields
      .filter((formField: InputBase) => {
        return !formField.getId().includes('popup');
      })
      .forEach((formField: InputBase) => {
        const isInvalidFormInput = checkFieldForValidity(formField);

        if (isInvalidFormInput) {
          addEntryToFormErrors(formField);
        }
      });

    return settingsFormErrors;
  }
}
