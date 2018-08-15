module.exports = class JsonReader {
    _createEmptyLibrary() {
        let emptyLibrary = {lib: [], pending : []}
        let dictstring = JSON.stringify(emptyLibrary)
        fs.writeFileSync(this.path, dictstring)
    }

    static open(path){
        if (!fs.existsSync(path)) {
            //create new json file with empty library
            this._createEmptyLibrary();
        }
        return JSON.parse(fs.readFileSync(path))
    }
    static save(path, data){
        let dictstring = JSON.stringify(data)
        fs.writeFileSync(path, dictstring)
    }
}