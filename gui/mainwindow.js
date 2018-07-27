const electron = require('electron');
const {ipcRenderer, remote} = electron;
const {Menu, MenuItem} = remote
const path = require('path');
const uniqid = require('uniqid');
const manga = require(path.join(__dirname, "../gui/manga.js"))
//const ul = document.querySelector('ul');
const mangaListHtml = document.getElementById('Mangalist');
const pendingListHtml = document.getElementById('Pendinglist');
const secondRow = document.getElementById('secondRow')

//Creating context menus
const mangaMenu = new Menu()
mangaMenu.append(new MenuItem({label: 'Update Entry', click() {console.log('Update') }}))
mangaMenu.append(new MenuItem({label: 'Copy Title', click() {console.log('Copy') }}))
mangaMenu.append(new MenuItem({type: 'separator'}))
mangaMenu.append(new MenuItem({label: 'Filter by this author', click() {console.log('Filter by author') }}))
mangaMenu.append(new MenuItem({type: 'separator'}))
mangaMenu.append(new MenuItem({label: 'Delete Entry', click() {console.log('Delete')}}))
const pendingMenu = new Menu()
pendingMenu.append(new MenuItem({label: 'Add Pending', click() {console.log('Add') }}))
pendingMenu.append(new MenuItem({label: 'Copy Link', click() {console.log('Copy') }}))
pendingMenu.append(new MenuItem({type: 'separator'}))
pendingMenu.append(new MenuItem({label: 'Delete Entry', click() {console.log('Delete')}}))


var mangaList = []
var pendingList = []
var selectedManga = []

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
ipcRenderer.on('lib:load', (event, library) => {
    loadLibrary(library)
    showLibrary()
});

function loadLibrary(library){
    library.lib.forEach((element) => {
        mangaItem = new manga.manga(element.title, element.volume, element.chapter, element.status, element.author, element.notes)
        mangaList.push(mangaItem)
    })
    library.pending.forEach((element) => {
        pendingList.push(element)
    })
}

function showLibrary(){
    var li; var itemText;
    mangaListHtml.className = 'collection';
    mangaList.forEach((element) => {
        itemText = document.createTextNode(element.toString());
        li = document.createElement('li');
        li.className = 'collection-item';
        li.id = element.id
        li.appendChild(itemText);
        mangaListHtml.appendChild(li)
    })
    pendingList.forEach((element) => {
        element = element.replace("http://", "").replace("www.mangago.me/read-manga/", "")
        itemText = document.createTextNode(element);
        li = document.createElement('li');
        li.className = 'collection-item';
        li.id = "pending-item"
        li.appendChild(itemText);
        pendingListHtml.appendChild(li)
    })
}

// ================================================
// ----- maintain layout during maximize/resize----
ipcRenderer.on('resize', (e, windowHeight) => {
    newHeight = parseInt(windowHeight) - 50
    newheightStr = newHeight.toString() + 'px'
    secondRow.style.height = newheightStr
})
ipcRenderer.on('maximize', (e, windowHeight) => {
    newHeight = parseInt(windowHeight) - 66
    newheightStr = newHeight.toString() + 'px'
    secondRow.style.height = newheightStr
})
// ================================================


//Remove item from left column
//MangaList.addEventListener('dblclick', editItem);
window.addEventListener('mousedown', (event) => {
    if (event.ctrlKey == true){

    }
});

window.addEventListener('contextmenu', (event) => {
    event.preventDefault()
    if (event.target.id.substring(0, 6) == 'manga-'){
        mangaMenu.popup({window: remote.getCurrentWindow()})
    }else if (event.target.id == 'pending-item'){
        pendingMenu.popup({window: remote.getCurrentWindow()})
    }
}, false)

// =============================================================================
// ---------------------- app buttons ------------------------------------------
document.getElementById('minimizeButton').addEventListener('click', (event) => {
    var window = remote.getCurrentWindow();
    window.minimize(); 
})
document.getElementById('maximizeButton').addEventListener('click', (event) => {
    var window = remote.getCurrentWindow();
    if (window.isMaximized()){ window.unmaximize() }
    else{ window.maximize() }
})
document.getElementById('exitButton').addEventListener('click', (event) => {
    var window = remote.getCurrentWindow();
    window.close(); 
})
// =============================================================================
function removeItem(event){
    event.target.remove();
    if(mangaListHtml.children.length == 0){
        mangaListHtml.className = '';
    }
}
function editItem(e){

}


function FilterManga(){
    text = document.getElementById("mangaInput").value
    console.log(text)

}

//Informs ipcMain that html is loaded
ipcRenderer.send('mainhtml:ready')