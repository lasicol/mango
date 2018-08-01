module.exports = class Library {
    constructor(data, document){
        this.data = data
        this.document = document
        this.mangaList = []
        this.pendingList = []
        this.mangaSelection = []
        this.pendingSelection = ''
        this.trashCan = [] //indexes of elements to delete
        this.ongoing = 0
        this.complete = 0
        this.all = 0
        this.pending = 0
    }

    load(){
        this.data.lib.forEach((element) => {
            var mangaItem = new Manga(element.title, element.volume, element.chapter, element.status, element.author, element.notes)
            this.mangaList.push(mangaItem)
        })
        this.data.pending.forEach((element) => {
            this.pendingList.push({
                link: element,
                text: this.linkToTitle(element),
                id: uniqid('pending-')
            })
        })
        this.data = null
        this.countStats()
    }

    showLeftList(itemList){
        //mangaListHtml.className = 'collection';
        itemList.forEach((element) => {
            this.insertLi(element.toString(), -1, 'collection-item', element.id, this.document.getElementById('Mangalist'))
        })
    }

    showRightList(itemList){
        itemList.forEach((element) => {
            this.insertLi(element.text, -1, 'collection-item', element.id, this.document.getElementById('Pendinglist'))
        })
    }

    countStats(){
        this.mangaList.forEach( (item) => {
            if (item.status == 'ongoing'){
                this.ongoing++
            }
            else if (item.status == 'complete'){
                this.complete++
            }
        })
        this.all = this.mangaList.length
        this.pending = this.pendingList.length
    }

    insertLi(text, index, className, id, targetHtmlObject){
        var itemText = document.createTextNode(text);
        var li = document.createElement('li');
        li.className = className;
        li.id = id
        li.appendChild(itemText);
        if (index > -1){
            targetHtmlObject.insertBefore(li, targetHtmlObject.children[index])
        }
        else{
            targetHtmlObject.appendChild(li)
        }
    }
    findById(array, id){
        for (var i = 0; i < array.length; i++){
            if (array[i].id == id){
                return i
            }
        }
        return -1
    }

    removeFromLeftList(id){
        //item is a html object
        var index = this.findById(this.mangaList, id)
        if (index > -1){
            let item = this.document.getElementById(id)
            if(item){
                item.remove()
            }
            this.mangaList.splice(index, 1)
        }
    }
    editItem(event){
        //to do
    }
    addToLeftList(newManga){
        var i
        for (i = 0; i < this.mangaList.length; i++){
            if (this.mangaList[i].title.toLowerCase() > newManga.title.toLowerCase()){
                break
            }
        }
        this.insertLi(newManga.toString(), i, 'collection-item', newManga.id, this.document.getElementById('Mangalist'))
        this.mangaList.splice(i, 0, newManga)
    };
    
    addToRightList(event){
        var text = this.document.getElementById("pendingInput").value
        if (event.key == "Enter" && text != ""){
            let newPending = {
                link: text,
                id: uniqid('pending-')
            }
            this.pendingList.push(newPending)
            this.insertLi(this.linkToTitle(text), -1, 'collection-item', newPending.id, this.document.getElementById('Pendinglist'))
            this.document.getElementById("pendingInput").value = ''
        }
    }
    linkToTitle(link){
        //deletes http and page main link, replaces _ and / with spaces
            return link.replace(/((http:\/\/)|(www\.mangago\.me\/read-manga\/))/g, "").replace(/_|\//g, " ")
    }

    FilterLeftList(text){
        var filtered = this.mangaList.filter(element => element.toString().toLowerCase().includes(text.toLowerCase()))
        this.document.getElementById('Mangalist').innerHTML = ''
        this.showLeftList(filtered, this.document.getElementById('Mangalist'))
    }

    //update statistics
    showStats(){
        this.document.getElementById('ongoingStat').textContent = this.ongoing
        this.document.getElementById('completeStat').textContent = this.complete
        this.document.getElementById('pendingStat').textContent = this.pendingList.length
        if (this.ongoing + this.complete != this.mangaList.length){
            this.document.getElementById('allStat').textContent = 'Error, all: ' + this.mangaList.length + ' while ongoing+complete= ' + (this.ongoing+this.complete)
        }
        else{
            this.document.getElementById('allStat').textContent  = this.mangaList.length
        }
    }
}