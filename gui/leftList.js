module.exports = class LeftList{
    constructor(document){
        this.list = []
        this.selection = ''
        this.trashCan = []
        this.document = document
        this.htmlList = this.document.getElementById('Mangalist')
        this.trashHtmlList = this.document.getElementById('Trashlist')
    }

    push(element){
        this.list.push(element)
    }
    

 
    updateItem(id, arrayItems){
        let index = Utilities.findById(this.list, id)
        this.list[index].volume = arrayItems[1]
        this.list[index].chapter = arrayItems[2]
        this.list[index].status = arrayItems[3]
        this.list[index].author = arrayItems[4]
        this.list[index].notes = arrayItems[5]

        this.document.getElementById(id).textContent = this.list[index].toString()
    }

    add(newManga){
        var i
        for (i = 0; i < this.list.length; i++){
            if (this.list[i].title.toLowerCase() > newManga.title.toLowerCase()){
                break
            }
        }
        Utilities.insertLi(newManga.toString(), i, 'collection-item', newManga.id, this.htmlList, this.document)
        this.list.splice(i, 0, newManga)
    }

    emptyTrashCan(){
        if (this.trashCan){
            this.trashCan.forEach( (item) => {
                Utilities.removeItem('deleted-'+item.id, this.list, this.document)
                this.list.splice(Utilities.findById(this.list, item.id), 1)
            })
            this.trashCan = []
            this.trashHtmlList.innerHTML = ''
        }
    }

}