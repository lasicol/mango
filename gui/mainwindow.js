const electron = require('electron');
const {ipcRenderer, remote, clipboard} = electron;
const {Menu, MenuItem} = remote
const uniqid = require('uniqid');
const Manga = require('./manga');
const Library = require('./library')
//const mangaListHtml = document.getElementById('Mangalist');
//const pendingListHtml = document.getElementById('Pendinglist');
const secondRow = document.getElementById('secondRow')

//Creating context menus
const mangaMenu = new Menu()
mangaMenu.append(new MenuItem({label: 'Update Entry', click() {
    let id = MangaLibrary.mangaSelection
    let index = MangaLibrary.findById(MangaLibrary.mangaList, id)
    let item = MangaLibrary.mangaList[index]
    ipcRenderer.send('create:editWindow', item)
}}))
mangaMenu.append(new MenuItem({label: 'Copy Title', click() {
    let id = MangaLibrary.mangaSelection
    let index = MangaLibrary.findById(MangaLibrary.mangaList, id)
    let item = MangaLibrary.mangaList[index]
    clipboard.writeText(item.title)
}}))
mangaMenu.append(new MenuItem({type: 'separator'}))
mangaMenu.append(new MenuItem({id: "toggleDelete", type: 'checkbox', label: 'DELETE MODE', click() {toggleDeleteMode(event)}}))
const pendingMenu = new Menu()
pendingMenu.append(new MenuItem({label: 'Copy Link', click() {
    let id = MangaLibrary.pendingSelection
    let index = MangaLibrary.findById(MangaLibrary.pendingList, id)
    let item = MangaLibrary.pendingList[index]
    clipboard.writeText(item.link)
}}))
pendingMenu.append(new MenuItem({type: 'separator'}))
pendingMenu.append(new MenuItem({label: 'Delete Entry', click() {
    MangaLibrary.removeItem(MangaLibrary.pendingSelection, MangaLibrary.pendingList)
}}))
const deleteMenu = new Menu()
deleteMenu.append(new MenuItem({label: 'Empty Trash', click() {emptyTrashCan() }}))


var MangaLibrary

//load and render library in main window
ipcRenderer.on('lib:load', (event, data) => {
    MangaLibrary = new Library(data, document)
    MangaLibrary.load()
    MangaLibrary.showList( (x) => x.toString(), MangaLibrary.mangaList, MangaLibrary.document.getElementById('Mangalist'))
    MangaLibrary.showList( (x) => x.text, MangaLibrary.pendingList, MangaLibrary.document.getElementById('Pendinglist'))
    MangaLibrary.showStats()   
});

//Add item to left list (manga) from addWindow
ipcRenderer.on('manga:add', (e, arrayItems) => {
    if (arrayItems[0]){
        let newManga = new Manga(arrayItems[0], arrayItems[1], arrayItems[2], arrayItems[3], arrayItems[4], arrayItems[5])
        MangaLibrary.addToLeftList(newManga)
    }
})

ipcRenderer.on('manga:update', (event, id, arrayItems) => {
    if (arrayItems[0]){
        MangaLibrary.updateItem(id, arrayItems)
    }
})

//add item to right list (pending)
document.getElementById("pendingInput").addEventListener('keyup', (event) => {
    var text = MangaLibrary.document.getElementById("pendingInput").value
    if (event.key == "Enter" && text != ""){
        MangaLibrary.addToRightList(text)
        MangaLibrary.document.getElementById("pendingInput").value = ''
    }
})

// ================================================
// ----- maintain layout during maximize/resize----
ipcRenderer.on('resize', (e, windowHeight) => {
    newHeight = parseInt(windowHeight) - 50
    secondRow.style.height = newHeight.toString() + 'px'
})
ipcRenderer.on('maximize', (e, windowHeight) => {
    newHeight = parseInt(windowHeight) - 66
    secondRow.style.height = newHeight.toString() + 'px'
})
// ================================================

// =============================================================================
// ---------------- show app contextmenu/select item----------------------------
window.addEventListener('contextmenu', (event) => {
    event.preventDefault()
    if (event.target.id.substring(0, 6) == 'manga-' || event.target.className == 'col-7 mangaColumn'){
        MangaLibrary.mangaSelection = event.target.id
        //console.log(MangaLibrary.mangaSelection)

        mangaMenu.popup({window: remote.getCurrentWindow()})
    }else if (event.target.id.substring(0, 8) == 'pending-'){
        MangaLibrary.pendingSelection = event.target.id

        pendingMenu.popup({window: remote.getCurrentWindow()})
    }else if (event.target.id.substring(0, 8) == 'deleted-' || event.target.id  == 'rightColumnDeleteMode'){
        deleteMenu.popup({window: remote.getCurrentWindow()})
}
}, false)
// =============================================================================

// =============================================================================
// ---------------------- add app buttons --------------------------------------
document.getElementById('minimizeButton').addEventListener('click', (event) => {
    remote.getCurrentWindow().minimize(); 
})
document.getElementById('maximizeButton').addEventListener('click', (event) => {
    var window = remote.getCurrentWindow();
    if (window.isMaximized()){ window.unmaximize() }
    else{ window.maximize() }
})
document.getElementById('exitButton').addEventListener('click', (event) => {
    remote.getCurrentWindow().close(); 
})
// =============================================================================

//Edit item from left column
document.getElementById('Mangalist').addEventListener('dblclick', (event) => {
    let id = event.target.id
    let index = MangaLibrary.findById(MangaLibrary.mangaList, id)
    let item = MangaLibrary.mangaList[index]
    ipcRenderer.send('create:editWindow', item)
});



document.getElementById("mangaInput").addEventListener('keyup', (event) => {
    var text = document.getElementById("mangaInput").value

    //filter list
    //to avoid rerendering the whole list each time user press backspace or delete on already empty input box, every other function key will rerender it though
    if ((event.key != 'Backspace' && event.key != 'Delete') || text != "" || MangaLibrary.mangaList.length != document.getElementById('Mangalist').children.length){
        MangaLibrary.FilterLeftList(document.getElementById("mangaInput").value)
    }

    //open addWindow for entering new manga
    if (event.key == "Enter" && text != ""){
        var similarMangas = MangaLibrary.mangaList.filter(element => element.toString().toLowerCase().includes(text))
        if (similarMangas.length > 0){
            if (!confirm(similarMangas.length + ' duplicates found, do you want to add this title anyway?')){
                return
            }
        }
        document.getElementById('Mangalist').innerHTML = ''
        //MangaLibrary.showLeftList(MangaLibrary.mangaList)
        MangaLibrary.showList( (x) => x.toString(), MangaLibrary.mangaList, MangaLibrary.document.getElementById('Mangalist'))
        document.getElementById("mangaInput").value = ''
        ipcRenderer.send('create:addWindow', text)
    }
})

function emptyTrashCan(){
    if (MangaLibrary.trashCan){
        MangaLibrary.trashCan.forEach( (item) => {
            if (item.status == 'ongoing'){
                MangaLibrary.ongoing--
            }else{
                MangaLibrary.complete--
            }
            MangaLibrary.all--
            MangaLibrary.removeItem(item.id, MangaLibrary.mangaList)
        })
        MangaLibrary.showStats()
        MangaLibrary.trashCan = []
        MangaLibrary.document.getElementById('Trashlist').innerHTML = ''
    }
}


function moveToTrash(event){
    var id = event.target.id
    if (id.substring(0, 6) == 'manga-'){
        event.target.remove()
        var index = MangaLibrary.findById(MangaLibrary.mangaList, id)
        var item = MangaLibrary.mangaList[index]
        MangaLibrary.insertLi(item.toString(), -1, 'collection-item', 'deleted-'+id, document.getElementById('Trashlist'))
        MangaLibrary.trashCan.push(item)
    }
}

function moveFromTrash(event){
    var id = event.target.id.substr(8)
    if (id.substring(0, 6) == 'manga-'){
        event.target.remove()
        var index = MangaLibrary.findById(MangaLibrary.trashCan, id)
        var item = MangaLibrary.trashCan[index]
        var i
        for (i = 0; i < MangaLibrary.mangaList.length; i++){
            if (MangaLibrary.document.getElementById('Mangalist').children[i].textContent.toLowerCase() > item.title.toLowerCase()){
                break
            }
        }
        MangaLibrary.insertLi(item.toString(), i, 'collection-item', id, MangaLibrary.document.getElementById('Mangalist'))
    }
}

function toggleDeleteMode(event){
    if (mangaMenu.getMenuItemById("toggleDelete").checked){
        document.getElementById('titleBar').style.backgroundColor = 'rgb(237, 33, 33)'
        document.getElementById('rightColumn').style.display = 'none'
        document.getElementById('rightColumnDeleteMode').style.display = 'block'
        document.getElementById('Mangalist').addEventListener('click', moveToTrash)
        document.getElementById('Trashlist').addEventListener('click', moveFromTrash)
    }
    else{
        document.getElementById('titleBar').style.backgroundColor = 'rgb(32, 34, 37)'
        document.getElementById('rightColumn').style.display = 'block'
        document.getElementById('rightColumnDeleteMode').style.display = 'none'
        document.getElementById('Mangalist').removeEventListener('click', moveToTrash)
        document.getElementById('Trashlist').removeEventListener('click', moveFromTrash)
        MangaLibrary.trashCan = []
        document.getElementById('Trashlist').innerHTML = ''
        MangaLibrary.document.getElementById('Mangalist').innerHTML = ''
        MangaLibrary.showList( (x) => x.toString(), MangaLibrary.mangaList, MangaLibrary.document.getElementById('Mangalist'))
    }
}

//Informs ipcMain that html is loaded
ipcRenderer.send('mainhtml:ready')