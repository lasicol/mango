const electron = require('electron');
const {ipcRenderer, remote} = electron;
const {Menu, MenuItem} = remote
const uniqid = require('uniqid');
const Manga = require('./manga');
const Library = require('./library')
//const mangaListHtml = document.getElementById('Mangalist');
//const pendingListHtml = document.getElementById('Pendinglist');
const secondRow = document.getElementById('secondRow')

//Creating context menus
const mangaMenu = new Menu()
mangaMenu.append(new MenuItem({label: 'Update Entry', click() {console.log('Update') }}))
mangaMenu.append(new MenuItem({label: 'Copy Title', click() {console.log('Copy') }}))
mangaMenu.append(new MenuItem({type: 'separator'}))
mangaMenu.append(new MenuItem({id: "toggleDelete", type: 'checkbox', label: 'DELETE MODE', click() {toggleDeleteMode(event)}}))
const pendingMenu = new Menu()
pendingMenu.append(new MenuItem({label: 'Copy Link', click() {console.log('Copy') }}))
pendingMenu.append(new MenuItem({type: 'separator'}))
pendingMenu.append(new MenuItem({label: 'Delete Entry', click() {console.log('Delete')}}))

var MangaLibrary

//load and render library in main window
ipcRenderer.on('lib:load', (event, data) => {
    MangaLibrary = new Library(data, document)
    MangaLibrary.load()
    MangaLibrary.showLeftList(MangaLibrary.mangaList)
    MangaLibrary.showRightList(MangaLibrary.pendingList)
    MangaLibrary.initializeStats()   
});

//Add item to left list (manga) from addWindow
ipcRenderer.on('manga:add', (e, arrayItems) => MangaLibrary.addToLeftList(e, arrayItems))

//add item to right list (pending)
document.getElementById("pendingInput").addEventListener('keyup', (event) => {
    MangaLibrary.addToRightList(event)
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
    if (event.target.id.substring(0, 6) == 'manga-'){
        MangaLibrary.mangaSelection = []
        MangaLibrary.mangaSelection.push(event.target.id)
        console.log(MangaLibrary.mangaSelection)

        mangaMenu.popup({window: remote.getCurrentWindow()})
    }else if (event.target.id.substring(0, 8) == 'pending-'){
        MangaLibrary.pendingSelection = event.target.id
        console.log(MangaLibrary.pendingSelection)

        pendingMenu.popup({window: remote.getCurrentWindow()})
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

//Remove item from left column
// document.getElementById('Mangalist').addEventListener('dblclick', (event) => {
//     MangaLibrary.removeFromLeftList(event.target)
// });



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
        MangaLibrary.showLeftList(MangaLibrary.mangaList)
        document.getElementById("mangaInput").value = ''
        ipcRenderer.send('create:addWindow', text)
    }
})
//////////////////////////////////
function deleteItems(event){
    var element = event.target
    if (event.ctrlKey){
        
        MangaLibrary.selectedManga.push(element.id)
    }
    else{
        MangaLibrary.selectedManga.forEach( (id) => {
            document.getElementById(id).style.color = ''
        })
        MangaLibrary.selectedManga = [element.id]
    }
    document.getElementById(element.id).style.color = 'red'
    console.log(MangaLibrary.selectedManga)
};


//grubo i duze problemy
function moveToTrash(event){
    var id = event.target.id
    if (id.substring(0, 6) == 'manga-'){
        event.target.remove()
        var index = MangaLibrary.findById(MangaLibrary.mangaList, id)
        var item = MangaLibrary.mangaList[index]
        MangaLibrary.insertLi(item.toString(), -1, 'collection-item', 'deleted-'+id, document.getElementById('rightColumnDeleteMode'))
        MangaLibrary.trashCan.push(item)
    }
    else if (id.substring(0, 8) == 'deleted-'){
        var index = MangaLibrary.findById(MangaLibrary.trashCan, id)
        var item = MangaLibrary.trashCan[index]
        console.log(item)
        //delete 'delete-' from id
        var i
        for (i = 0; i < MangaLibrary.mangaList.length; i++){
            if (MangaLibrary.mangaList[i].title.toLowerCase() > item.toLowerCase()){
                break
            }
        }
        this.insertLi(item.toString(), i, 'collection-item', id, MangaLibrary.document.getElementById('Mangalist'))
    }

}

function toggleDeleteMode(event){
    if (mangaMenu.getMenuItemById("toggleDelete").checked){
        document.getElementById('titleBar').style.backgroundColor = 'rgb(237, 33, 33)'
        document.getElementById('rightColumn').style.display = 'none'
        document.getElementById('rightColumnDeleteMode').style.display = 'block'

        window.addEventListener('mousedown', moveToTrash)

    }
    else{
        document.getElementById('titleBar').style.backgroundColor = 'rgb(32, 34, 37)'
        document.getElementById('rightColumn').style.display = 'block'
        document.getElementById('rightColumnDeleteMode').style.display = 'none'

        window.removeEventListener('mousedown', moveToTrash)
    }
}

//Informs ipcMain that html is loaded
ipcRenderer.send('mainhtml:ready')