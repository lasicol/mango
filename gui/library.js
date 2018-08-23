const LeftList = require('./../miscellaneous/leftList')
const RightList = require('./../miscellaneous/rightList')
const uniqid = require('uniqid');
const Utilities = require('./../miscellaneous/utilities')
const Manga = require('./../miscellaneous/manga');
const JsonReader = require('./../miscellaneous/jsonReader')
module.exports = class Library {
    constructor(path, document){
        this.path = path
        this.document = document
        this.leftList = new LeftList()
        this.rightList = new RightList()
        this.trashCan = []
        this.isDeleteMode = false
        this.ongoing = 0
        this.complete = 0
        this.all = 0
        this.pending = 0
    }

    load(){
        let data = JsonReader.open(this.path)
        data.lib.forEach((element) => {
            var mangaItem = new Manga(element.title, element.volume, element.chapter, element.status, element.author, element.notes)
            this.leftList.push(mangaItem)
        })
        data.pending.forEach((element) => {
            this.rightList.push({
                link: element,
                text: Utilities.linkToTitle(element),
                id: uniqid('pending-')
            })
        })
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

    // ===============================================================================================================================================
    // -------------------------------------------------- left list management -----------------------------------------------------------------------
    addLeft(manga){
        let index = this.leftList.add(manga)
        Utilities.insertLi(manga.toString(), index, 'collection-item', manga.id, this.document.getElementById('Mangalist'), this.document)
        if (manga.status == 'ongoing'){
            this.incOngoing()
        }
        else{
            this.incComplete()
        }
        this.incAll()
        this.showStats()
        this.showSaveAlert()
    }
    updateLeftList(id, arrayItems){
        let index = this.leftList.updateItem(id, arrayItems)
        this.document.getElementById(id).textContent = this.getLeftList()[index].toString()
        this.showSaveAlert()
    }
    getLeftList(){return this.leftList.getList()}
    getLeftListLength(){return this.leftList.getLength()}
    showLeft(list){
        list.forEach((element) => {
            Utilities.insertLi(element.toString(), -1, 'collection-item', element.id, this.document.getElementById('Mangalist'), this.document)
        })
    }

    getLeftSelection(){return this.leftList.getSelection()}
    setLeftSelection(value){this.leftList.setSelection(value)}
    
    filterLeft(text){
        let filtered = this.getLeftList().filter(element => element.toString().toLowerCase().includes(text.toLowerCase()))
        this.document.getElementById('Mangalist').innerHTML = ''
        this.showLeft(filtered)
    }
    removeLeft(index){this.leftList.remove(index)}
    // ===============================================================================================================================================

    // ===============================================================================================================================================
    // -------------------------------------------------- right list management ----------------------------------------------------------------------
    showRight(list){
        list.forEach((element) => {
            Utilities.insertLi(element.text, -1, 'collection-item', element.id, this.document.getElementById('Pendinglist'), this.document)
        })
    }

    addRight(pending){
        let id = this.rightList.add(pending)
        Utilities.insertLi(Utilities.linkToTitle(pending), -1, 'collection-item', id, this.document.getElementById('Pendinglist'), this.document)
        this.document.getElementById("pendingInput").value = ''
        this.incPending()
        this.showStats()
        this.showSaveAlert()
    }

    removeRight(index){
        this.rightList.remove(index)
        this.descPending()
        this.showStats()
        this.showSaveAlert()
    }
    getRightList(){return this.rightList.getList()}
    getRightLength(){return this.rightList.getLength()}
    getRightSelection(){return this.rightList.getSelection()}
    setRightSelection(value){this.rightList.setSelection(value)}
    // ===============================================================================================================================================

    // ===============================================================================================================================================
    // -------------------------------------------------- info display management---------------------------------------------------------------------
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
    getMode(){return this.isDeleteMode}
    getSaveStatus(){return this.document.getElementById('notSavedAlert').style.visibility}
    setSaveStatus(value){this.document.getElementById('notSavedAlert').style.visibility = value}
    hideSaveAlert(){
        if (this.getSaveStatus() !=  'hidden'){
            this.setSaveStatus('hidden')
        }
    }
    showSaveAlert(){
        if (this.getSaveStatus() !=  'visible'){
            this.setSaveStatus('visible')
        }
    }
    // ===============================================================================================================================================
    

    countStats(){
        this.getLeftList().forEach( (item) => {
            item.getStatus() == 'ongoing' ? this.incOngoing() : this.incComplete()
            this.incAll()
        })
        this.all = this.getLeftListLength()
        this.pending = this.getRightLength()
      }
  
    //update statistics
    showStats(){
        this.document.getElementById('ongoingStat').textContent = this.getOngoing()
        this.document.getElementById('completeStat').textContent = this.getComplete()
        this.document.getElementById('pendingStat').textContent = this.getRightLength()
        this.ongoing++
        if (this.getOngoing() + this.getComplete() != this.getLeftListLength()){
            this.document.getElementById('allStat').textContent = `Error, all: ${this.getLeftListLength()}`
            +` while ongoing+complete= ${(this.getOngoing()+this.getComplete())}` 
        }
        else{
            this.document.getElementById('allStat').textContent  = this.getLeftListLength()
        }
    }

    initiateAddManga(title){
        let similarMangas = this.getLeftList().filter(element => element.toString().toLowerCase().includes(title.toLowerCase()))
        let length = similarMangas.length
        if (length > 0 && !confirm(length + ' duplicates found, do you want to add this title anyway?')){
            return false
        }
        this.document.getElementById('Mangalist').innerHTML = ''
        this.document.getElementById("mangaInput").value = ''
        this.showLeft(this.getLeftList())
        return true
    }
    // ============================================================================================
    // --------------------- delete mode and trash maintenence ------------------------------------
    enableDeleteMode(){
        this.isDeleteMode = true
        this.document.getElementById('titleBar').style.backgroundColor = 'rgb(237, 33, 33)'
        this.document.getElementById('rightColumn').style.display = 'none'
        this.document.getElementById('rightColumnDeleteMode').style.display = 'block'
    }
    
    disableDeleteMode(){
        this.isDeleteMode = false
        this.document.getElementById('titleBar').style.backgroundColor = 'rgb(32, 34, 37)'
        this.document.getElementById('rightColumn').style.display = 'block'
        this.document.getElementById('rightColumnDeleteMode').style.display = 'none'
        this.trashCan.forEach( (item) => {
            this.addLeft(item)
        })
        this.trashCan = []
        this.document.getElementById('Trashlist').innerHTML = ''
        this.document.getElementById('Mangalist').innerHTML = ''
        this.showLeft(this.getLeftList())
    }

    emptyTrashCan(){
        if (this.trashCan){
            this.trashCan.forEach( (item) => {
                this.document.getElementById(item.id).remove()
                item.getStatus() =='ongoing' ? this.descOngoing() : this.descComplete()
                this.descAll()
            })
            this.trashCan = []
            this.document.getElementById('Trashlist').innerHTML = ''
            this.showStats()
            this.showSaveAlert()
        }
    }

    moveToTrash(event){
        let id = event.target.id
        if (id.substring(0, 6) == 'manga-'){
            event.target.remove()
            let index = Utilities.findById(this.getLeftList(), id)
            let item = this.getLeftList()[index]
            Utilities.insertLi(item.toString(), -1, 'collection-item', id, this.document.getElementById('Trashlist'), this.document)
            this.removeLeft(index)
            this.trashCan.push(item)
        }
    }
    
    moveFromTrash(event){
        let id = event.target.id
        if (id.substring(0, 6) == 'manga-'){
            event.target.remove()
            let index = Utilities.findById(this.trashCan, id)
            let item = this.trashCan[index]
            this.trashCan.splice(index, 1)
            this.addLeft(item)
        }
    }
    // ============================================================================================

    save(){
        JsonReader.save(this.path, this.toJson())
        this.hideSaveAlert()
    }
}