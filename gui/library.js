module.exports = class Library {
    constructor(data, document){
        this.data = data
        this.document = document
        this.leftList = new LeftList(this.document)
        this.rightList = new RightList(this.document)

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
}