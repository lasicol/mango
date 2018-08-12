module.exports = class RightList{
    constructor(){
        this.list = []
        this.selection = ''
        this.document = document
        this.htmList = this.document.getElementById('Pendinglist')
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
        Utilities.insertLi(Utilities.linkToTitle(newLink), -1, 'collection-item', newPending.id, this.document.getElementById('Pendinglist'), this.document)
        this.list.push(newPending)
    }
}