const electron = require('electron');
const {ipcRenderer, remote, clipboard} = electron;
const {Menu, MenuItem} = remote
const fs = require("fs");
const uniqid = require('uniqid');
const Manga = require('./manga');
const Library = require('./library')
const LeftList = require('./leftList')
const RightList = require('./rightList')
const Utilities = require('./utilities')
const JsonReader = require('./jsonReader')


//Load content into HTML
MangaLibrary = new Library("library.json", document)
MangaLibrary.load()
MangaLibrary.showLeft(MangaLibrary.leftList.list)
MangaLibrary.rightList.show((x) => x.text, MangaLibrary.rightList.list)
MangaLibrary.showStats()  


//Creating context menus
const mangaMenu = new Menu()
mangaMenu.append(new MenuItem({label: 'Update Entry', click() {
    let index = Utilities.findById(MangaLibrary.leftList.list, MangaLibrary.leftList.selection)
    ipcRenderer.send('create:editWindow', MangaLibrary.leftList.list[index])
}}))
mangaMenu.append(new MenuItem({label: 'Copy Title', click() {
    let index = Utilities.findById(MangaLibrary.leftList.list, MangaLibrary.leftList.selection)
    clipboard.writeText(MangaLibrary.leftList.list[index].title)
}}))
mangaMenu.append(new MenuItem({type: 'separator'}))
mangaMenu.append(new MenuItem({id: "toggleDelete", type: 'checkbox', label: 'DELETE MODE', click() {toggleDeleteMode()}}))
const pendingMenu = new Menu()
pendingMenu.append(new MenuItem({label: 'Copy Link', click() {
    let index = Utilities.findById(MangaLibrary.rightList.list, MangaLibrary.rightList.selection)
    clipboard.writeText(MangaLibrary.rightList.list[index].link)
}}))
pendingMenu.append(new MenuItem({type: 'separator'}))
pendingMenu.append(new MenuItem({label: 'Delete Entry', click() {
    Utilities.removeItem(MangaLibrary.rightList.selection, MangaLibrary.rightList.list, document)
    MangaLibrary.pending--
    MangaLibrary.showStats()
}}))
const deleteMenu = new Menu()
deleteMenu.append(new MenuItem({label: 'Empty Trash', click() {
    MangaLibrary.leftList.emptyTrashCan()
    MangaLibrary.countStats()
    MangaLibrary.showStats()
}}))

//Add item to left list (manga) from addWindow
ipcRenderer.on('manga:add', (e, arrayItems) => {
    if (arrayItems[0]){
        let newManga = new Manga(arrayItems[0], arrayItems[1], arrayItems[2], arrayItems[3], arrayItems[4], arrayItems[5])
        MangaLibrary.leftList.add(newManga)
        //MangaLibrary.leftList.emptyTrashCan()
        if (newManga.status == 'ongoing'){
            MangaLibrary.ongoing++
        }
        else{
            MangaLibrary.complete++
        }
        MangaLibrary.all++
        MangaLibrary.showStats()
    }
})
//Update item from left list (manga)
ipcRenderer.on('manga:update', (event, id, arrayItems) => {
    if (arrayItems[0]){
        MangaLibrary.leftList.updateItem(id, arrayItems)
        MangaLibrary.isSaved = false
    }
})

//add item to right list (pending)
document.getElementById("pendingInput").addEventListener('keyup', (event) => {
    var text = MangaLibrary.document.getElementById("pendingInput").value
    if (event.key == "Enter" && text != ""){
        MangaLibrary.rightList.add(text)
        MangaLibrary.pending++
        MangaLibrary.showStats()
        MangaLibrary.isSaved = false
    }
})

// ================================================
// ----- maintain layout during maximize/resize----
ipcRenderer.on('resize', (e, windowHeight) => {
    newHeight = parseInt(windowHeight) - 50
    document.getElementById('secondRow').style.height = newHeight.toString() + 'px'
})
ipcRenderer.on('maximize', (e, windowHeight) => {
    newHeight = parseInt(windowHeight) - 66
    document.getElementById('secondRow').style.height = newHeight.toString() + 'px'
})
// ================================================

// =============================================================================
// ---------------- show app contextmenu/select item----------------------------
window.addEventListener('contextmenu', (event) => {
    event.preventDefault()
    if (event.target.id.substring(0, 6) == 'manga-'){
        MangaLibrary.leftList.selection = event.target.id
        mangaMenu.popup({window: remote.getCurrentWindow()})
    }
    else if (event.target.className == 'col-7 mangaColumn'){
        mangaMenu.popup({window: remote.getCurrentWindow()})
    }else if (event.target.id.substring(0, 8) == 'pending-'){
        MangaLibrary.rightList.selection = event.target.id
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

//Start editing item from left list
document.getElementById('Mangalist').addEventListener('dblclick', (event) => {
    let index = Utilities.findById(MangaLibrary.leftList.list, event.target.id)
    ipcRenderer.send('create:editWindow', MangaLibrary.leftList.list[index])
});

document.getElementById("mangaInput").addEventListener('keyup', (event) => {
    var text = document.getElementById("mangaInput").value

    //filter list
    //to avoid rerendering the whole list each time user press backspace or delete on already empty input box, every other function key will rerender it though
    if ((event.key != 'Backspace' && event.key != 'Delete') || text != "" || MangaLibrary.leftList.list.length != document.getElementById('Mangalist').children.length){
        MangaLibrary.filterLeft(document.getElementById("mangaInput").value)
    }

    //open addWindow for entering new manga
    if (event.key == "Enter" && text != ""){
        var similarMangas = MangaLibrary.leftList.list.filter(element => element.toString().toLowerCase().includes(text))
        if (similarMangas.length > 0){
            if (!confirm(similarMangas.length + ' duplicates found, do you want to add this title anyway?')){
                return
            }
        }
        document.getElementById('Mangalist').innerHTML = ''
        // MangaLibrary.leftList.show( (x) => x.toString(), MangaLibrary.leftList.list)
        MangaLibrary.showLeft(MangaLibrary.leftList.list)
        document.getElementById("mangaInput").value = ''
        ipcRenderer.send('create:addWindow', text)
    }
})
//Save library
window.addEventListener('keydown', (event) => {
    if (event.key == 's'){
        MangaLibrary.save()
        MangaLibrary.isSaved = true
    }
})


function moveToTrash(event){
    var id = event.target.id
    if (id.substring(0, 6) == 'manga-'){
        event.target.remove()
        var index = Utilities.findById(MangaLibrary.leftList.list, id)
        var item = MangaLibrary.leftList.list[index]
        Utilities.insertLi(item.toString(), -1, 'collection-item', 'deleted-'+id, MangaLibrary.leftList.trashHtmlList, MangaLibrary.leftList.document)
        MangaLibrary.leftList.list.splice(index, 1)
        MangaLibrary.leftList.trashCan.push(item)
    }
}

function moveFromTrash(event){
    var id = event.target.id.substr(8)
    if (id.substring(0, 6) == 'manga-'){
        event.target.remove()
        var index = Utilities.findById(MangaLibrary.leftList.trashCan, id)
        var item = MangaLibrary.leftList.trashCan[index]
        var i
        for (i = 0; i < MangaLibrary.leftList.list.length; i++){
            if (MangaLibrary.leftList.htmlList.children[i].textContent.toLowerCase() > item.title.toLowerCase()){
                break
            }
        }
        //Utilities.insertLi(item.toString(), i, 'collection-item', id, MangaLibrary.leftList.htmlList, MangaLibrary.leftList.document)
        MangaLibrary.leftList.trashCan.splice(index, 1)
        MangaLibrary.leftList.add(item)
    }
}


function toggleDeleteMode(){
    if (mangaMenu.getMenuItemById("toggleDelete").checked){
        MangaLibrary.changeToDeleteMode()
        MangaLibrary.leftList.htmlList.addEventListener('click', moveToTrash)
        MangaLibrary.leftList.trashHtmlList.addEventListener('click', moveFromTrash)
    }
    else{
        MangaLibrary.changeToNormalMode()
        MangaLibrary.leftList.htmlList.removeEventListener('click', moveToTrash)
        MangaLibrary.leftList.trashHtmlList.removeEventListener('click', moveFromTrash)
    }
}

document.addEventListener('dragover', event => event.preventDefault());
document.addEventListener('drop', event => event.preventDefault());
