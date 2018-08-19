const fs = require("fs")

module.exports = class JsonReader {
    constructor(path) {
        let emptyLibrary = {lib: [], pending : []}
        let dictstring = JSON.stringify(emptyLibrary)
        fs.writeFileSync(path, dictstring)
    }

    static open(path){
        if (!fs.existsSync(path)) {
            //create new json file with empty library
            new JsonReader(path)
        }
        return JSON.parse(fs.readFileSync(path))
    }
    static save(path, data){
        let dictstring = JSON.stringify(data)
        fs.writeFileSync(path, dictstring)
    }
}