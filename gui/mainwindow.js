const electron = require('electron');
const {ipcRenderer} = electron;
//const ul = document.querySelector('ul');
const MangaList = document.getElementById('Mangalist');
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
//load library to main window (doesnt work yet)
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
});

//Remove item
MangaList.addEventListener('dblclick', removeItem);

function removeItem(e){
    e.target.remove();
    if(ul.children.length == 0){
        ul.className = '';
    }
}