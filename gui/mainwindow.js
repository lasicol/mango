const electron = require('electron');
const {ipcRenderer, remote} = electron;
const {Menu, MenuItem} = remote
const uniqid = require('uniqid');
//const ul = document.querySelector('ul');
const mangaListHtml = document.getElementById('Mangalist');
const pendingListHtml = document.getElementById('Pendinglist');
const secondRow = document.getElementById('secondRow')

//Creating context menus
const mangaMenu = new Menu()
mangaMenu.append(new MenuItem({label: 'Update Entry', click() {console.log('Edit') }}))
mangaMenu.append(new MenuItem({label: 'Copy Title', click() {console.log('Copy') }}))
mangaMenu.append(new MenuItem({type: 'separator'}))
mangaMenu.append(new MenuItem({label: 'Filter by this author', click() {console.log('Filter by author') }}))
mangaMenu.append(new MenuItem({type: 'separator'}))
mangaMenu.append(new MenuItem({label: 'Delete Entry', click() {console.log('Delete')}}))
const pendingMenu = new Menu()
pendingMenu.append(new MenuItem({label: 'Copy Link', click() {console.log('Copy') }}))
pendingMenu.append(new MenuItem({type: 'separator'}))
pendingMenu.append(new MenuItem({label: 'Delete Entry', click() {console.log('Delete')}}))

class Manga{
    constructor(title, volume, chapter, status, author, notes){
        this.index = ++Manga.index
        this.title = title
        this.volume = volume
        this.chapter = chapter
        this.status = status
        this.author = author
        this.notes = notes
        this.index = uniqid("manga-")
    }
    toStr(){
        if (this.notes != ""){
            return `${this.title} v${this.volume} c${this.chapter} ${this.status} ${this.author} ${this.notes}` 
        }
        else{
            return `${this.title} v${this.volume} c${this.chapter} ${this.status} ${this.author}` 
        }
    }
}

//Add item
ipcRenderer.on('item:add', function(e, item){
    item = item.toLowerCase()
    if (item) {
        mangaListHtml.className = 'collection';
        const li = document.createElement('li');
        li.className = 'collection-item';
        const itemText = document.createTextNode(item);
        li.appendChild(itemText);

        //find index to insert element to maintain alphabetical order
        list = mangaListHtml.children
        i = 0
        element = list[0]
        while (element && element.innerHTML < item){
            element = list[++i]
        }
        if (element){
            mangaListHtml.insertBefore(li, element)
        }
        else{
            mangaListHtml.appendChild(li)
        }
    }
});
//Clear items
ipcRenderer.on('item:clear', function(){
    mangaListHtml.innerHTML = '';
    mangaListHtml.className = '';
});
//load library to main window
ipcRenderer.on('lib:load', function(e, library){
    var li; var itemText;
    mangaListHtml.className = 'collection';
    library.lib.forEach((element) => {
        itemText = document.createTextNode(element.title);
        li = document.createElement('li');
        li.className = 'collection-item';
        li.id = "manga-item"
        li.appendChild(itemText);
        mangaListHtml.appendChild(li)
    })
    library.pending.forEach((element) => {
        element = element.replace("http://", "").replace("www.mangago.me/read-manga/", "")
        itemText = document.createTextNode(element);
        li = document.createElement('li');
        li.className = 'collection-item';
        li.id = "pending-item"
        li.appendChild(itemText);
        pendingListHtml.appendChild(li)
    })
});

//resize second row along with the main window to maintain layout
ipcRenderer.on('resize', (e, windowHeight) => {
    newHeight = parseInt(windowHeight) - 112
    newheightStr = newHeight.toString() + 'px'
    secondRow.style.height = newheightStr
})

//Remove item from left column
//MangaList.addEventListener('dblclick', editItem);
window.addEventListener('mousedown', (event) => {
    if (event.ctrlKey == true){

    }
});



window.addEventListener('contextmenu', (event) => {
    event.preventDefault()
    if (event.target.id == 'manga-item'){
        mangaMenu.popup({window: remote.getCurrentWindow()})
    }else if (event.target.id == 'pending-item'){
        pendingMenu.popup({window: remote.getCurrentWindow()})
    }
}, false)



function removeItem(event){
    event.target.remove();
    if(mangaListHtml.children.length == 0){
        mangaListHtml.className = '';
    }
}
function editItem(e){

}


function FilterManga(){
    text = document.getElementById("myInput").value
    console.log(text)

}

//Informs ipcMain that html is loaded
ipcRenderer.send('mainhtml:ready')