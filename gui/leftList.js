const Utilities = require('./utilities')

module.exports = class LeftList{
    constructor(){
        this.list = []
        this.selection = ''       
    }

    push(element){this.list.push(element)}
    
    getList(){return this.list}

    getLength(){return this.list.length}

    getSelection(){return this.selection}
    setSelection(value){this.selection = value}
 
    updateItem(id, arrayItems){
        let index = Utilities.findById(this.list, id)
        this.list[index].volume = arrayItems[1]
        this.list[index].chapter = arrayItems[2]
        this.list[index].status = arrayItems[3]
        this.list[index].author = arrayItems[4]
        this.list[index].notes = arrayItems[5]
        return index

    }
    _findSpot(title){
        for (let i = 0; i < this.getLength(); i++){
            if (this.list[i].title.toLowerCase() > title){
                return i
            }
        }
        return this.getLength()
    }
    add(newManga){
        let index = this._findSpot(newManga.title.toLowerCase())
        this.list.splice(index, 0, newManga)
        return index
    }

    remove(index){
        this.list.splice(index, 1)
    }
    

}