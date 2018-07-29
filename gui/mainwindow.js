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
ipcRenderer.on('manga:add', function(e, arrayItems){
    newManga = new manga.manga(arrayItems[0], arrayItems[1], arrayItems[2], arrayItems[3], arrayItems[4], arrayItems[5])
    if (newManga.title) {
        var i
        for (i = 0; i < mangaList.length; i++){
            if (mangaList[i].title.toLowerCase() > newManga.title.toLowerCase()){
                break
            }
        }
        if (i >= mangaList.length){
            insertLi(newManga.toString(), -1, 'collection-item', newManga.id, mangaListHtml)
            mangaList.push(newManga)
        }
        else{
            insertLi(newManga.toString(), i, 'collection-item', newManga.id, mangaListHtml)
            mangaList.splice(i, 0, newManga)
        }
    }
});
//load and render library in main window
ipcRenderer.on('lib:load', (event, library) => {
    loadLibrary(library)
    showLeftList(mangaList)
    showRightList(pendingList)
    initializeStats()
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
    //mangaListHtml.className = 'collection';
    itemList.forEach((element) => {
        insertLi(element.toString(), -1, 'collection-item', element.id, mangaListHtml)
    })
}

function showRightList(itemList){
    itemList.forEach((element) => {
        insertLi(linkToTitle(element), -1, 'collection-item', 'pending-item', pendingListHtml)
    })
}

function insertLi(text, index, className, id, targetHtmlObject){
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

function linkToTitle(link){
    //deletes http and page main link, replaces _ and / with spaces
    return link.replace(/((http:\/\/)|(www\.mangago\.me\/read-manga\/))/g, "").replace(/_|\//g, " ")
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


function findById(array, id){
    for (var i = 0; i < array.length; i++){
        if (array[i].id == id){
            return i
        }
    }
    return -1
}

//Remove item from left column
// mangaListHtml.addEventListener('dblclick', (event) => {
//     removeItem(event.target, mangaList, mangaListHtml)
// });

function removeItem(item, list, htmlList){
    var index = findById(list, item.id)
    if (index > -1){
        item.remove()
        list.splice(index, 1)
    }
    
    //if(htmlList.children.length == 0){
    //    htmlList.className = '';
    //}
}
function editItem(event){

}


function FilterManga(){
    var text = document.getElementById("mangaInput").value
    //if (text && document.getElementById('')){
        var filtered = mangaList.filter(element => element.toString().toLowerCase().includes(text.toLowerCase()))
        mangaListHtml.innerHTML = ''
        showLeftList(filtered)
    //}
    
}
//add items to left column
document.getElementById("mangaInput").addEventListener('keyup', (event) => {
    var input = document.getElementById("mangaInput")
    var text = input.value
    //to avoid rerendering the whole list each time user press backspace or delete on already empty input box
    if ((event.key != 'Backspace' && event.key != 'Delete') || text != "" || mangaList.length != mangaListHtml.children.length){
        FilterManga()
    }
    if (event.key == "Enter" && text != ""){
        var similarMangas = mangaList.filter(element => element.toString().toLowerCase().includes(text))
        if (similarMangas.length > 0){
            console.log(similarMangas.length + ' duplicates found')
        }
        mangaListHtml.innerHTML = ''
        showLeftList(mangaList)
        ipcRenderer.send('create:addWindow')
    }
})

//add items to right column
document.getElementById("pendingInput").addEventListener('keyup', (event) => {
    var input = document.getElementById("pendingInput")
    var text = input.value
    if (event.key == "Enter" && text != ""){
        pendingList.push(text)
        insertLi(linkToTitle(text), -1, 'collection-item', 'pending-item', pendingListHtml)
        input.value = ''
    }
})

//update statistics
function initializeStats(){
    var ongoing = 0
    var complete = 0
    mangaList.forEach( (item) => {
        if (item.status == 'ongoing'){
            ongoing++
        }
        else if (item.status == 'complete'){
            complete++
        }
    })
    document.getElementById('ongoingStat').textContent = ongoing
    document.getElementById('completeStat').textContent = complete
    document.getElementById('pendingStat').textContent = pendingList.length
    if (ongoing+complete != mangaList.length){
        document.getElementById('allStat').textContent = 'Error, all: ' + mangaList.length + ' while ongoing+complete= ' + (ongoing+complete)
    }
    else{
        document.getElementById('allStat').textContent  = mangaList.length
    }
}

//Informs ipcMain that html is loaded
ipcRenderer.send('mainhtml:ready')