import BaseModel from './BaseModel';

interface Settings {
  id: number;
  content: string;
}

let collection:object = [];

/**
 * @namespace cpro.ui5.__kunde__.__projekt__.model.Settings
 */
export default class SettingsModel extends BaseModel<Settings> {
  setModelFromCollection(id: number) {
    const activeTodo = this.getCollection().find((todo) => {
      return +todo.id == +id;
    });
    return this.setActiveItem({ ...activeTodo });
  }

  public addOrUpdateToCollection(id: int, content: string) {
    const existingEntry = collection.find((item) => item.id === id);

    if (!existingEntry) {
      const newSettings: Settings = {
        id: id,
        content: content
      }
      collection.push(newSettings);
    } else {
      existingEntry.content = content;
    }

    this.setCollection(collection);
  }

  public getCollection(){
    return collection;
  }
}
