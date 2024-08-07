import { Memento } from "vscode";

export class GlobalStorageService {

    constructor(private storage: Memento & {
        setKeysForSync(keys: readonly string[]): void;
    }) { }

    public getValue<T>(key: string): T {
        return this.storage.get<T>(key, null as any);
    }

    public setValue<T>(key: string, value: T) {
        this.storage.update(key, value);
        this.storage?.setKeysForSync([key]);
    }

    public getKeys() {
        return this.storage.keys();
    }

    public getAllData() {
        return this.storage.keys().map(key => {
            return this.getValue(key)
        })
    }


}