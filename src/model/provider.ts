import SettingsModel from './Settings.model';
import ConfigModel from './Config.model';
import MessageModel from './Message.model';

const settingsModel = new SettingsModel('todo');
const configModel = new ConfigModel('config');
const messageModel = new MessageModel('messages');

export { settingsModel, configModel, messageModel };
