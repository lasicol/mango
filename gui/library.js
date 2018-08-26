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
            lib.push({
                'title': obj.getTitle(),
                'volume': obj.getVolume(),
                'chapter': obj.getChapter(),
                'status': obj.getStatus(),
                'author': obj.getAuthor(),
                'notes': obj.getNotes()
            })
        }
        let pending = []
        for (let i = 0; i < this.getRightLength();i++){
            pending.push(this.getRightList()[i].link)
        }
        return {lib: lib, pending: pending}
    }

    // ===============================================================================================================================================
    // -------------------------------------------------- left list management -----------------------------------------------------------------------
    addLeft(manga){
        let index = this.leftList.add(manga)
        Utilities.insertLi(manga.toString(), index, 'collection-item', manga.id, this.document.getElementById('Mangalist'), this.document)
        manga.status == 'ongoing' ? this.changeStat('ongoing', 1) : this.changeStat('complete', 1)
        this.changeStat('all', 1)
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
    removeLeft(index){
        this.leftList.remove(index)
        this.getLeftList()[index].status == 'ongoing' ? this.changeStat('ongoing', -1) : this.changeStat('complete', -1)
        this.changeStat('all', -1)
    }
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
        this.changeStat('pending', 1)
        this.showStats()
        this.showSaveAlert()
    }

    removeRight(index){
        this.rightList.remove(index)
        this.changeStat('pending', -1)
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
    getMode(){return this.isDeleteMode}
    getSaveStatus(){return this.document.getElementById('notSavedAlert').style.visibility}
    setSaveStatus(value){this.document.getElementById('notSavedAlert').style.visibility = value}
    getStat(stat){
        switch (stat){
            case "ongoing": return this.ongoing;
            case  "complete": return this.complete;
            case 'pending': return this.pending;
            case 'all': return this.all;
        }
    }
    changeStat(stat, increment){
        switch (stat){
            case "ongoing":
                this.ongoing += increment;
                break;
            case  "complete":
                this.complete += increment;
                break;
            case 'pending':
                this.pending += increment;
                break;
            case 'all':
                this.all += increment
        }
    }
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
            item.getStatus() == 'ongoing' ? this.changeStat('ongoing', 1) : this.changeStat('complete', 1)
            this.changeStat('all', 1)
        })
        this.all = this.getLeftListLength()
        this.pending = this.getRightLength()
      }
  
    //update statistics
    showStats(){
        this.document.getElementById('ongoingStat').textContent = this.getStat('ongoing')
        this.document.getElementById('completeStat').textContent = this.getStat('complete')
        this.document.getElementById('pendingStat').textContent = this.getRightLength()
        if (this.getStat('ongoing') + this.getStat('complete') != this.getLeftListLength()){
            this.document.getElementById('allStat').textContent = `Error, all: ${this.getLeftListLength()}`
            +` while ongoing+complete= ${(this.getStat('ongoing')+this.getStat('complete'))}` 
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