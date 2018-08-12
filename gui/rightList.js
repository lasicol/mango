module.exports = class RightList{
    constructor(document){
        this.list = []
        this.selection = ''
        this.document = document
        this.htmList = this.document.getElementById('Pendinglist')
        this.htmlInput = this.document.getElementById("pendingInput")
    }
    
    push(element){
        this.list.push(element)
    }

    show(textFunction, itemList){
        itemList.forEach((element) => {
            Utilities.insertLi(textFunction(element), -1, 'collection-item', element.id, this.htmList, this.document)
        })
    }

    add(newLink){
        let newPending = {
            link: newLink,
            id: uniqid('pending-')
        }
        Utilities.insertLi(Utilities.linkToTitle(newLink), -1, 'collection-item', newPending.id, this.htmList, this.document)
        this.list.push(newPending)
        this.htmlInput.value = ''
    }
}