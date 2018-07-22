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

ipcRenderer.on('lib:init', function(e, library){
    console.log(library.lib[0])
    
})
//Remove item
MangaList.addEventListener('dblclick', removeItem);

function removeItem(e){
    e.target.remove();
    if(ul.children.length == 0){
        ul.className = '';
    }
}