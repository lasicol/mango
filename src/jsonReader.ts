
class JsonReader {
    path: string;
    fs: any;
    constructor(fs: any, path: string) {
        this.path = path;
        this.fs = fs;
    }

    _createEmptyLibrary() {
        let empty: any = [] //JEBAC TYPESCRIPT
        let emptyLibrary = {lib: empty, pending : empty} //JEBAC TYPESCRIPT
        let dictstring = JSON.stringify(emptyLibrary);
        this.fs.writeFileSync(this.path, dictstring);//JEBAC ASYNCHRONICZNY JS
    }

    openJson(){
        if (!this.fs.existsSync(this.path)) {
            //create new json file with empty library
            this._createEmptyLibrary();
        }
        return require(this.path)
    }
}

export { JsonReader };