module.exports = class LeftList{
    constructor(document){
        this.list = []
        this.selection = ''
        this.trashCan = []
        this.document = document
        this.htmlList = this.document.getElementById('Mangalist')
        this.trashHtmlList = this.document.getElementById('Trashlist')
    }

 
    show(textFunction, list){
        list.forEach((element) => {
            Utilities.insertLi(textFunction(element), -1, 'collection-item', element.id, this.htmlList, this.document)
        })
    }
    
    filter(text){
        var filtered = this.list.filter(element => element.toString().toLowerCase().includes(text.toLowerCase()))
        this.htmlList.innerHTML = ''
        this.show( (x) =>  x.toString(), filtered, this.htmlList)
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
                this.list.splice(Utilities.findById(item.id), 1)
            })
            this.trashCan = []
            this.trashHtmlList.innerHTML = ''
        }
    }
    
    moveToTrash(event){
        var id = event.target.id
        if (id.substring(0, 6) == 'manga-'){
            event.target.remove()
            var index = Utilities.findById(this.list, id)
            var item = this.list[index]
            Utilities.insertLi(item.toString(), -1, 'collection-item', 'deleted-'+id, this.trashHtmlList, this.document)
            this.trashCan.push(item)
        }
    }
    
    moveFromTrash(event){
        var id = event.target.id.substr(8)
        if (id.substring(0, 6) == 'manga-'){
            event.target.remove()
            var index = Utilities.findById(this.trashCan, id)
            var item = this.trashCan[index]
            var i
            for (i = 0; i < this.list.length; i++){
                if (this.document.getElementById('Mangalist').children[i].textContent.toLowerCase() > item.title.toLowerCase()){
                    break
                }
            }
            Utilities.insertLi(item.toString(), i, 'collection-item', id, this.htmlList, this.document)
            this.trashCan.splice(index, 1)
        }
    }

}