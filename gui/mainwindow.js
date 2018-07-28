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
mangaMenu.append(new MenuItem({label: 'Delete Entry', click() {console.log('Delete')}}))
const pendingMenu = new Menu()
pendingMenu.append(new MenuItem({label: 'Add Pending', click() {console.log('Add') }}))
pendingMenu.append(new MenuItem({label: 'Copy Link', click() {console.log('Copy') }}))
pendingMenu.append(new MenuItem({type: 'separator'}))
pendingMenu.append(new MenuItem({label: 'Delete Entry', click() {console.log('Delete')}}))


var mangaList = [] //elements are of type manga.manga
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
    showLeftList(mangaList)
    showRightList(pendingList)
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

function showLeftList(itemList){
    var li; var itemText;
    mangaListHtml.className = 'collection';
    itemList.forEach((element) => {
        createLi(element.toString(), 'collection-item', element.id, mangaListHtml)
    })   
}

function showRightList(itemList){
    var li; var itemText;
    itemList.forEach((element) => {
        createLi(linkToTitle(element), 'collection-item', 'pending-item', pendingListHtml)
    })
}

function createLi(text, className, id, targetHtmlObject){
    itemText = document.createTextNode(text);
    var li = document.createElement('li');
    li.className = className;
    li.id = id
    li.appendChild(itemText);
    targetHtmlObject.appendChild(li)
}

function linkToTitle(link){
    return link.replace("http://", "").replace("www.mangago.me/read-manga/", "").replace("_", " ").replace("/", " ")
    //change to use regular expresion
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


mangaListHtml.addEventListener('mousedown', (event) => {
    var element = event.target
    if (event.ctrlKey){
        
        selectedManga.push(element.id)
    }
    else{
        selectedManga.forEach( (id) => {
            document.getElementById(id).style.color = ''
        })
        selectedManga = [element.id]
    }
    document.getElementById(element.id).style.color = 'red'
    console.log(selectedManga)
});


// =============================================================================
// ---------------------- add app contextmenu ----------------------------------
window.addEventListener('contextmenu', (event) => {
    event.preventDefault()
    if (event.target.id.substring(0, 6) == 'manga-'){
        mangaMenu.popup({window: remote.getCurrentWindow()})
    }else if (event.target.id == 'pending-item'){
        pendingMenu.popup({window: remote.getCurrentWindow()})
    }
}, false)
// =============================================================================

// =============================================================================
// ---------------------- add app buttons --------------------------------------
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


function findById(array, id){
    for (var i = 0; i < array.length; i++){
        if (array[i].id == id){
            return i
        }
    }
    return -1
}

//Remove item from left column
//mangaListHtml.addEventListener('dblclick', removeItem);

function removeItem(event){
    elementHtml = event.target
    var index = findById(mangaList, elementHtml.id)
    if (index > -1){
        elementHtml.remove()
        mangaList.splice(index, 1)
    }
    
    if(mangaListHtml.children.length == 0){
        mangaListHtml.className = '';
    }
}
function editItem(event){

}


function FilterManga(){
    var text = document.getElementById("mangaInput").value
    var filtered = mangaList.filter(element => element.toString().toLowerCase().includes(text))
    mangaListHtml.innerHTML = ''
    showLeftList(filtered)
}

//add items to right column
document.getElementById("pendingInput").addEventListener('keyup', (event) => {
    var input = document.getElementById("pendingInput")
    var text = input.value
    if (event.key == "Enter" && text != ""){
        pendingList.push(text)
        createLi(linkToTitle(text), 'collection-item', 'pending-item', pendingListHtml)
        input.value = ''
    }
})
//Informs ipcMain that html is loaded
ipcRenderer.send('mainhtml:ready')