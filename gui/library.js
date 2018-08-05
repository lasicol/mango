module.exports = class Library {
    constructor(data, document){
        this.data = data
        this.document = document
        this.mangaList = []
        this.pendingList = []
        this.mangaSelection = ''
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

    showList(textFunction, itemList, htmlList){
        itemList.forEach((element) => {
            this.insertLi(textFunction(element), -1, 'collection-item', element.id, htmlList)
        })
    }

    countStats(){
        var ongoing = 0
        var complete = 0
        this.mangaList.forEach( (item) => {
            if (item.status == 'ongoing'){
                ongoing++
            }
            else if (item.status == 'complete'){
                complete++
            }
        })
        this.ongoing = ongoing
        this.complete = complete
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
    //change to work on both lists
    removeItem(id, list){
        var index = this.findById(list, id)
        if (index > -1){
            let item = this.document.getElementById(id)
            if(item){
                item.remove()
            }
            list.splice(index, 1)
        }
    }
    updateItem(id, arrayItems){
        let index = this.findById(this.mangaList, id)
        // this.mangaList[index].title = arrayItems[0]
        this.mangaList[index].volume = arrayItems[1]
        this.mangaList[index].chapter = arrayItems[2]
        this.mangaList[index].status = arrayItems[3]
        this.mangaList[index].author = arrayItems[4]
        this.mangaList[index].notes = arrayItems[5]

        this.document.getElementById(id).textContent = this.mangaList[index].toString()


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
    
    addToRightList(newLink){
        let newPending = {
            link: newLink,
            id: uniqid('pending-')
        }
        this.insertLi(this.linkToTitle(newLink), -1, 'collection-item', newPending.id, this.document.getElementById('Pendinglist'))
        this.pendingList.push(newPending)
    }
    linkToTitle(link){
        //deletes http and page main link, replaces _ and / with spaces
        return link.replace(/((http:\/\/)|(www\.mangago\.me\/read-manga\/))/g, "").replace(/_|\//g, " ")
    }

    FilterLeftList(text){
        var filtered = this.mangaList.filter(element => element.toString().toLowerCase().includes(text.toLowerCase()))
        this.document.getElementById('Mangalist').innerHTML = ''
        this.showList( (x) =>  x.toString(), filtered, this.document.getElementById('Mangalist'))
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