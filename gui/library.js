module.exports = class Library {
    constructor(path, document){
        this.path = path
        this.data = JsonReader.open(this.path)
        this.document = document
        this.leftList = new LeftList(this.document)
        this.rightList = new RightList(this.document)
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
        for (let i = 0; i < this.leftList.list.length;i++){
            let element = this.leftList.list[i]
            delete element.id
            lib.push(element)
        }

        let pending = []
        for (let i = 0; i < this.rightList.list.length;i++){
            let element = this.rightList.list[i]
            pending.push(element.link)
        }
        

        return {lib: lib, pending: pending}
    }

    showLeft(list){
        list.forEach((element) => {
            Utilities.insertLi(element.toString(), -1, 'collection-item', element.id, this.document.getElementById('Mangalist'), this.document)
        })
    }
    
    filterLeft(text){
        var filtered = this.leftList.list.filter(element => element.toString().toLowerCase().includes(text.toLowerCase()))
        this.document.getElementById('Mangalist').innerHTML = ''
        this.showLeft(filtered)
        console.log(filtered)
    }

    countStats(){
        var ongoing = 0
        var complete = 0
        this.leftList.list.forEach( (item) => {
            if (item.status == 'ongoing'){
                ongoing++
            }
            else if (item.status == 'complete'){
                complete++
            }
        })
        this.ongoing = ongoing
        this.complete = complete
        this.all = this.leftList.list.length
        this.pending = this.rightList.list.length
      }
  
    //update statistics
    showStats(){
        this.document.getElementById('ongoingStat').textContent = this.ongoing
        this.document.getElementById('completeStat').textContent = this.complete
        this.document.getElementById('pendingStat').textContent = this.rightList.list.length
        if (this.ongoing + this.complete != this.leftList.list.length){
            this.document.getElementById('allStat').textContent = 'Error, all: ' + this.leftList.list.length + ' while ongoing+complete= ' + (this.ongoing+this.complete)
        }
        else{
            this.document.getElementById('allStat').textContent  = this.leftList.list.length
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
        this.leftList.trashCan.forEach( (item) => {
            this.leftList.add(item)
        })
        this.leftList.trashCan = []
        this.leftList.trashHtmlList.innerHTML = ''
        this.leftList.htmlList.innerHTML = ''
        this.showLeft(this.leftList.list)
    }

    save(){
        console.log(this)
        //JsonReader.save(this.path, this.toJson())
    }
}