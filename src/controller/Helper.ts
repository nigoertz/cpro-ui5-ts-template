export default class Helper {
    public flattenJSON(jsonObject: any, parentProperty?: string): any[] {
        if (typeof jsonObject === "string") {
            jsonObject = JSON.parse(jsonObject);
        }

        const result: any[] = [];
        for (const property in jsonObject) {
            if (jsonObject.hasOwnProperty(property)) {
                const value = jsonObject[property];

                if (typeof value === "object" && value !== null) {
                    const topLevelItem: any = {
                        property: property,
                        value: "",
                        children: []
                    };
                    const childItems = this.createChildItems(
                        value,
                        topLevelItem.property
                    );
                    topLevelItem.children = childItems;
                    result.push(topLevelItem);
                }
            }
        }
        return result;
    }

    public unflattenJSON(flattenedArray: any[]): any {
        const unflattenedObject: any = {};

        for (const item of flattenedArray) {
            const property = item.property;
            const value = item.value;

            if (item.children && item.children.length > 0) {
                const nestedObject = this.unflattenJSON(item.children);
                unflattenedObject[property] = nestedObject;
            } else {
                unflattenedObject[property] = value;
            }
        }

        return unflattenedObject;
    }

    public createChildItems(jsonObject: any, parentProperty: string): any[] {
        const result: any[] = [];
        for (const property in jsonObject) {
            if (jsonObject.hasOwnProperty(property)) {
                const value = jsonObject[property];
                const childItem: any = {
                    property: property,
                    value: value,
                    children: []
                };
                if (typeof value === "object" && value !== null) {
                    childItem.children = this.createChildItems(
                        value,
                        childItem.property
                    );
                }
                result.push(childItem);
            }
        }
        return result;
    }
}
