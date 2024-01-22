import BaseModel from './BaseModel';

interface Settings {
  id: number;
  content: string;
  active: boolean;
}

let collection = [
  {
    id: 0,
    content: `{
  "sap": {
    "dev": {
      "url": "",
      "username": "",
      "password": "",
      "client": ""
    },
    "qas": {
      "url": "",
      "username": "",
      "password": "",
      "client": ""
    },
    "staging": {
      "url": "",
      "username": "",
      "password": "",
      "client": ""
    },
    "integration": {
      "url": "",
      "username": "",
      "password": "",
      "client": ""
    },
    "prod": {
      "url": "",
      "username": "",
      "password": "",
      "client": ""
    }
  },
  "shipcloud": {
    "dev": {
      "url": "",
      "username": "",
      "password": "",
      "apikey": ""
    }
  }
    }`,
    active: false,
  },

  /*
  {
    id: 1,
    content: `{
  "sap": {
    "dev": {
      "url": "settings-url",
      "username": "",
      "password": "",
      "client": ""
    },
    "qas": {
      "url": "",
      "username": "",
      "password": "",
      "client": ""
    },
    "staging": {
      "url": "",
      "username": "",
      "password": "",
      "client": ""
    },
    "integration": {
      "url": "",
      "username": "",
      "password": "",
      "client": ""
    },
    "prod": {
      "url": "",
      "username": "",
      "password": "",
      "client": ""
    }
  },
  "shipcloud": {
    "dev": {
      "url": "",
      "username": "",
      "password": "",
      "apikey": ""
    }
  }
        }`,
    active: false,
  },

  {
    id: 2,
    content: `{
  "sap": {
    "dev": {
      "url": "rollback-url",
      "username": "",
      "password": "",
      "client": ""
    },
    "qas": {
      "url": "",
      "username": "",
      "password": "",
      "client": ""
    },
    "staging": {
      "url": "",
      "username": "",
      "password": "",
      "client": ""
    },
    "integration": {
      "url": "",
      "username": "",
      "password": "",
      "client": ""
    },
    "prod": {
      "url": "",
      "username": "",
      "password": "",
      "client": ""
    }
  },
  "shipcloud": {
    "dev": {
      "url": "",
      "username": "",
      "password": "",
      "apikey": ""
    }
  }
        }`,
    active: true,
  },
  */
];

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

  updateEntryInCollection() {
    const settingsCollection = this.getCollection();
    const activeSettingsItem = this.getActiveItem();

    const activeSettingsIndex = settingsCollection.findIndex((collectionItem) => {
      return +collectionItem.id === +activeSettingsItem.id;
    });
    settingsCollection.splice(activeSettingsIndex, 1, { ...activeSettingsItem });
    this.setCollection(settingsCollection);
  }

  public addOrUpdateToCollection(id: int, content: string) {
    const existingEntry = collection.find((item) => item.id === id);

    if (!existingEntry) {
      const newSettings: Settings = {
        id: id,
        content: content,
        active: false
      }
      collection.push(newSettings);
    } else {
      existingEntry.content = content;
    }

    this.setCollection(collection);
  }

  public setSettingsActive(id: int){
    collection.forEach(element => element.active = false);
    const existingEntry = collection.find((item) => item.id === id);
    existingEntry.active = true;
    this.setCollection(collection);
  }

  public deleteFromCollection(id: int) {
    collection = collection.filter(item => item.id !== id);
    this.setCollection(collection);
  }

  public getCollection(){
    return collection;
  }
}
