const uniqid = require('uniqid');
const Utilities = require('./utilities')

module.exports = class RightList{
    constructor(document){
        this.list = []
        this.selection = ''
    }
    
    push(element){this.list.push(element)}

    getList(){return this.list}

    getLength(){return this.list.length}

    getSelection(){return this.selection}

    setSelection(value){this.selection = value}


    add(newLink){
        let newPending = {
            link: newLink,
            id: uniqid('pending-')
        }
        this.list.push(newPending)
        return newPending.id
    }

    remove(index){
        this.list.splice(index, 1)
    }
}