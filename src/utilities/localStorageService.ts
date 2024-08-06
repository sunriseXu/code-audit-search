import { Memento } from "vscode";

export class LocalStorageService {
    
    constructor(private storage: Memento) { }   
    
    public getValue<T>(key : string) : T{
        return this.storage.get<T>(key, null);
    }

    public setValue<T>(key : string, value : T){
        this.storage.update(key, value );
    }

    public getKeys(){
        return this.storage.keys();
    }

    public getAllData(){
        return this.storage.keys().map(key => {
            return this.getValue(key)
        })
    }
    

}