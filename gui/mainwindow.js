const electron = require('electron');
const {ipcRenderer, remote, clipboard} = electron;
const {Menu, MenuItem} = remote
const Manga = require('./../miscellaneous/manga');
const Library = require('./library')
const Utilities = require('./../miscellaneous/utilities')

//Load content into HTML
MangaLibrary = new Library("library.json", document)
MangaLibrary.load()
MangaLibrary.showLeft(MangaLibrary.getLeftList())
MangaLibrary.showRight(MangaLibrary.getRightList())
MangaLibrary.showStats()  

//Creating context menus
const mangaMenu = new Menu()
const pendingMenu = new Menu()
const deleteMenu = new Menu()
mangaMenu.append(new MenuItem({label: 'Add Entry', click() {
    ipcRenderer.send('create:addWindow', "")
}}))
mangaMenu.append(new MenuItem({label: 'Update Entry', click() {
    let selection = MangaLibrary.getLeftSelection()
    let list = MangaLibrary.getLeftList()
    if (selection != ''){
        let index = Utilities.findById(list, selection)
        ipcRenderer.send('create:editWindow', list[index])
    }
    
}}))
mangaMenu.append(new MenuItem({label: 'Copy Title', click() {
    let selection = MangaLibrary.getLeftSelection()
    let list = MangaLibrary.getLeftList()
    if (selection != ''){
        let index = Utilities.findById(list, selection)
        clipboard.writeText(list[index].title)
    }
    
}}))
mangaMenu.append(new MenuItem({type: 'separator'}))
mangaMenu.append(new MenuItem({id: "toggleDelete", type: 'checkbox', label: 'DELETE MODE', click() {
    if (mangaMenu.getMenuItemById("toggleDelete").checked){
        MangaLibrary.enableDeleteMode()       
    }
    else{
        MangaLibrary.disableDeleteMode()
    }
}}))

pendingMenu.append(new MenuItem({label: 'Copy Link', click() {
    let index = Utilities.findById(MangaLibrary.getRightList(), MangaLibrary.getRightSelection())
    clipboard.writeText(MangaLibrary.getRightList()[index].link)
}}))
pendingMenu.append(new MenuItem({type: 'separator'}))
pendingMenu.append(new MenuItem({label: 'Delete Entry', click() {
    let index = Utilities.findById(MangaLibrary.getRightList(),MangaLibrary.getRightSelection())
    MangaLibrary.removeRight(index)
    document.getElementById(MangaLibrary.getRightSelection()).remove()
}}))

deleteMenu.append(new MenuItem({label: 'Empty Trash', click() {
    MangaLibrary.emptyTrashCan()
}}))

document.addEventListener('dragover', event => event.preventDefault());
document.addEventListener('drop', event => event.preventDefault());

// ============================================================================================
// ----------------- maintain layout during maximize/resize------------------------------------
ipcRenderer.on('resize', (e, windowHeight) => {
    newHeight = parseInt(windowHeight) - 50
    document.getElementById('secondRow').style.height = newHeight.toString() + 'px'
})
ipcRenderer.on('maximize', (e, windowHeight) => {
    newHeight = parseInt(windowHeight) - 66
    document.getElementById('secondRow').style.height = newHeight.toString() + 'px'
})
// ============================================================================================

document.getElementById('minimizeButton').addEventListener('click', (event) => {
    remote.getCurrentWindow().minimize(); 
})
document.getElementById('maximizeButton').addEventListener('click', (event) => {
    let window = remote.getCurrentWindow();
    if (window.isMaximized()){ window.unmaximize() }
    else{ window.maximize() }
})
document.getElementById('exitButton').addEventListener('click', (event) => {
    remote.getCurrentWindow().close(); 
})

//Add item to left list from addWindow
ipcRenderer.on('manga:add', (e, arrayItems) => {
    if (arrayItems[0]){
        let newManga = new Manga(arrayItems[0], arrayItems[1], arrayItems[2], arrayItems[3], arrayItems[4], arrayItems[5])
        MangaLibrary.addLeft(newManga)
    }
})
//Update item from left list
ipcRenderer.on('manga:update', (event, id, arrayItems) => {
    if (arrayItems[0]){
        MangaLibrary.updateLeftList(id, arrayItems)
    }
})

document.getElementById('MangaColumn').addEventListener('contextmenu', (event) => {
    event.preventDefault()
    if (event.target.id.substring(0, 6) == 'manga-'){
        MangaLibrary.setLeftSelection(event.target.id)
    }else{
        MangaLibrary.setLeftSelection('')
    }
    mangaMenu.popup({window: remote.getCurrentWindow()})
})

document.getElementById('Mangalist').addEventListener('dblclick', (event) => {
    let list = MangaLibrary.getLeftList()
    let index = Utilities.findById(list, event.target.id)
    ipcRenderer.send('create:editWindow', list[index])
});
document.getElementById('Mangalist').addEventListener('click', (event) => {
    if (MangaLibrary.getMode()){
        MangaLibrary.moveToTrash(event)
    }
})
document.getElementById("mangaInput").addEventListener('keyup', (event) => {
    let text = document.getElementById("mangaInput").value
    //filter list
    //to avoid rerendering the whole list each time user press backspace or delete on already empty input box, every other function key will rerender it though
    let specialKeys = event.key != 'Backspace' && event.key != 'Delete'
    let properLength  = MangaLibrary.getLeftListLength() != document.getElementById('Mangalist').children.length
    if (specialKeys || text != "" || properLength){
        MangaLibrary.filterLeft(document.getElementById("mangaInput").value)
    }
    
    //open addWindow for entering new manga
    if(event.key == "Enter" && text != ""){
        if (MangaLibrary.initiateAddManga(text)){
            ipcRenderer.send('create:addWindow', text)
        }
    }
})

document.getElementById('Pendinglist').addEventListener('contextmenu', (event) => {
    if (event.target.id.substring(0, 8) == 'pending-'){
        MangaLibrary.setRightSelection(event.target.id)
        pendingMenu.popup({window: remote.getCurrentWindow()})
    }
})
document.getElementById('Pendinglist').addEventListener('dblclick', (event) => {
    if (event.target.id.substring(0, 8) == 'pending-'){
        let index = Utilities.findById(MangaLibrary.getRightList(), event.target.id)
        clipboard.writeText(MangaLibrary.getRightList()[index].link)
    }
})
//add item to the right list
document.getElementById("pendingInput").addEventListener('keyup', (event) => {
    let text = MangaLibrary.document.getElementById("pendingInput").value
    if (event.key == "Enter" && text != ""){
        MangaLibrary.addRight(text)
    }
})

document.getElementById('rightColumnDeleteMode').addEventListener('contextmenu', (event) => {
    deleteMenu.popup({window: remote.getCurrentWindow()})
})

document.getElementById('Trashlist').addEventListener('click', (event) => {
    MangaLibrary.moveFromTrash(event)
})

//Save library
window.addEventListener('keydown', (event) => {
    if (event.key.toLowerCase() == 's' && event.ctrlKey){
        MangaLibrary.save()
    }
})

window.onbeforeunload = (event) => {
    if (MangaLibrary.getSaveStatus() == 'visible')
    {
        if (confirm('There are unsaved changes, do you wish to save before closing the application?')){
            MangaLibrary.save()
        }
    }
}