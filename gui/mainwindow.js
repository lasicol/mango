const electron = require('electron');
const {ipcRenderer} = electron;
//const ul = document.querySelector('ul');
const MangaList = document.getElementById('Mangalist');
const PendingList = document.getElementById('Pendinglist');
const SecondRow = document.getElementById('secondRow')
//Add item
ipcRenderer.on('item:add', function(e, item){
    item = item.toLowerCase()
    if (item) {
        MangaList.className = 'collection';
        const li = document.createElement('li');
        li.className = 'collection-item';
        const itemText = document.createTextNode(item);
        li.appendChild(itemText);

        //find index to insert element to maintain alphabetical order
        list = MangaList.children
        i = 0
        element = list[0]
        while (element && element.innerHTML < item){
            element = list[++i]
        }
        if (element){
            MangaList.insertBefore(li, element)
        }
        else{
            MangaList.appendChild(li)
        }
    }
});
//Clear items
ipcRenderer.on('item:clear', function(){
    MangaList.innerHTML = '';
    MangaList.className = '';
});
//load library to main window
ipcRenderer.on('lib:load', function(e, library){
    var li; var itemText;
    MangaList.className = 'collection';
    library.lib.forEach((element) => {
        li = document.createElement('li');
        li.className = 'collection-item';
        itemText = document.createTextNode(element.title);
        li.appendChild(itemText);
        MangaList.appendChild(li)
    })
    library.pending.forEach((element) => {
        li = document.createElement('li');
        li.className = 'collection-item';
        element = element.replace("http://", "").replace("www.mangago.me/read-manga/", "")
        itemText = document.createTextNode(element);
        li.appendChild(itemText);
        PendingList.appendChild(li)
    })
});

//resize second row along with window to maintain layout
ipcRenderer.on('resize', (e, windowHeight) => {
    newHeight = parseInt(windowHeight) - 112
    newheightStr = newHeight.toString() + 'px'
    SecondRow.style.maxHeight = newheightStr
})

//Remove item from left column
MangaList.addEventListener('dblclick', removeItem);

//Informs ipcMain that html is loaded
ipcRenderer.send('mainhtml:ready')

function removeItem(e){
    e.target.remove();
    if(ul.children.length == 0){
        ul.className = '';
    }
}

function FilterManga(){
    text = document.getElementById("myInput").value
    console.log(text)

}