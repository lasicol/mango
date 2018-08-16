const LeftList = require('./leftList')
const RightList = require('./rightList')
const uniqid = require('uniqid');
const Utilities = require('./utilities')
const Manga = require('./manga');
module.exports = class Library {
    constructor(path, document){
        this.path = path
        this.data = JsonReader.open(this.path)
        this.document = document
        this.leftList = new LeftList()
        this.rightList = new RightList()
        this.trashCan = []
        this.trashHtmlList = this.document.getElementById('Trashlist')
        this.isSaved = true
        this.ongoing = 0
        this.complete = 0
        this.all = 0
        this.pending = 0
    }

    load(){
        this.data.lib.forEach((element) => {
            var mangaItem = new Manga(element.title, element.volume, element.chapter, element.status, element.author, element.notes)
            this.leftList.push(mangaItem)
        })
        this.data.pending.forEach((element) => {
            this.rightList.push({
                link: element,
                text: Utilities.linkToTitle(element),
                id: uniqid('pending-')
            })
        })
        this.data = null
        this.countStats()
    }

    toJson(){
        let lib = []
        for (let i = 0; i < this.getLeftListLength();i++){
            let obj = this.getLeftList()[i]
            let element = {
                'title': obj.getTitle(),
                'volume': obj.getVolume(),
                'chapter': obj.getChapter(),
                'status': obj.getStatus(),
                'author': obj.getAuthor(),
                'notes': obj.getNotes()
            }
            lib.push(element)
        }

        let pending = []
        for (let i = 0; i < this.getRightLength();i++){
            let element = this.getRightList()[i]
            pending.push(element.link)
        }
        

        return {lib: lib, pending: pending}
    }

    addLeft(manga){
        let index = this.leftList.add(manga)
        Utilities.insertLi(manga.toString(), index, 'collection-item', manga.id, this.document.getElementById('Mangalist'), this.document)
    }
    updateLeftList(id, arrayItems){
        let index = this.leftList.updateItem(id, arrayItems)
        this.document.getElementById(id).textContent = this.getLeftList()[index].toString()
    }
    getLeftList(){
        return this.leftList.getList()
    }
    getLeftListLength(){
        return this.leftList.getLength()
    }
    showLeft(list){
        list.forEach((element) => {
            Utilities.insertLi(element.toString(), -1, 'collection-item', element.id, this.document.getElementById('Mangalist'), this.document)
        })
    }

    getLeftSelection(){
        return this.leftList.getSelection()
    }
    setLeftSelection(value){
        this.leftList.setSelection(value)
    }
    
    filterLeft(text){
        var filtered = this.leftList.getList().filter(element => element.toString().toLowerCase().includes(text.toLowerCase()))
        this.document.getElementById('Mangalist').innerHTML = ''
        this.showLeft(filtered)
    }

    removeLeft(index){
        this.leftList.remove(index)
    }

    showRight(list){
        list.forEach((element) => {
            Utilities.insertLi(element.text, -1, 'collection-item', element.id, this.document.getElementById('Pendinglist'), this.document)
        })
    }

    addRight(pending){
        let id = this.rightList.add(pending)
        Utilities.insertLi(Utilities.linkToTitle(pending), -1, 'collection-item', id, this.document.getElementById('Pendinglist'), this.document)
        this.document.getElementById("pendingInput").value = ''
    }

    removeRight(index){
        this.rightList.remove(index)
    }

    getRightList(){
        return this.rightList.getList()
    }

    getRightLength(){
        return this.rightList.getLength()
    }

    getRightSelection(){
        return this.rightList.getSelection()
    }

    setRightSelection(value){
        this.rightList.setSelection(value)
    }


    getOngoing(){return this.ongoing}
    incOngoing(){this.ongoing++}
    descOngoing(){this.ongoing--}
    getComplete(){return this.complete}
    descComplete(){this.complete--}
    incComplete(){this.complete++}
    getAll(){return this.all}
    incAll(){this.all++}
    descAll(){this.all--}
    getPending(){return this.pending}
    incPending(){this.pending++}
    descPending(){this.pending--}


    countStats(){
        this.getLeftList().forEach( (item) => {
            if (item.getStatus() == 'ongoing'){
                this.incOngoing()
            }
            else if (item.getStatus() == 'complete'){
                this.incComplete()
            }
            this.incAll()
        })
        this.all = this.getLeftListLength()
        this.pending = this.rightList.list.length
      }
  
    //update statistics
    showStats(){
        this.document.getElementById('ongoingStat').textContent = this.getOngoing()
        this.document.getElementById('completeStat').textContent = this.getComplete()
        this.document.getElementById('pendingStat').textContent = this.rightList.list.length


        if (this.getOngoing() + this.getComplete() != this.getLeftListLength()){
            this.document.getElementById('allStat').textContent = 'Error, all: ' + this.getLeftListLength() + ' while ongoing+complete= ' + (this.getOngoing()+this.getComplete())
        }
        else{
            this.document.getElementById('allStat').textContent  = this.getLeftListLength()
        }
    }

    changeToDeleteMode(){
        this.document.getElementById('titleBar').style.backgroundColor = 'rgb(237, 33, 33)'
        this.document.getElementById('rightColumn').style.display = 'none'
        this.document.getElementById('rightColumnDeleteMode').style.display = 'block'
    }
    
    changeToNormalMode(){
        this.document.getElementById('titleBar').style.backgroundColor = 'rgb(32, 34, 37)'
        this.document.getElementById('rightColumn').style.display = 'block'
        this.document.getElementById('rightColumnDeleteMode').style.display = 'none'
        this.trashCan.forEach( (item) => {
            this.addLeft(item)
        })
        this.trashCan = []
        this.trashHtmlList.innerHTML = ''
        this.document.getElementById('Mangalist').innerHTML = ''
        this.showLeft(this.getLeftList())
    }

    emptyTrashCan(){
        if (this.trashCan){
            this.trashCan.forEach( (item) => {
                this.document.getElementById('deleted-'+item.id).remove()
                if (item.getStatus() =='ongoing'){
                    this.descOngoing()
                }
                else{
                    this.descComplete()
                }
                this.descAll()
            })
            this.trashCan = []
            this.trashHtmlList.innerHTML = ''
        }
    }
    save(){
        JsonReader.save(this.path, this.toJson())
    }
}