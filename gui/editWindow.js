const electron = require('electron');
const {ipcRenderer, remote} = electron;

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
var item_id
ipcRenderer.on('init:data', (event, item) => {
    item_id = item.id
    document.querySelector('#title').value = item.title
    document.querySelector('#volume').value = item.volume
    document.querySelector('#chapter').value = item.chapter
    document.querySelector('#status').value = item.status
    document.querySelector('#author').value = item.author
    document.querySelector('#notes').value = item.notes
})

document.querySelector('form').addEventListener('submit', (event) => {
    event.preventDefault();
    const title = document.querySelector('#title').value.trim();
    const volume = document.querySelector('#volume').value;
    const chapter = document.querySelector('#chapter').value;
    const status = document.querySelector('#status').value;
    const author = document.querySelector('#author').value.trim();
    const notes = document.querySelector('#notes').value;
    ipcRenderer.send('manga:update', item_id, [title, volume, chapter, status, author, notes]);
});
window.addEventListener('keydown', (event) => {
    if (event.key == 'Escape'){
        window.close();
    }
})
ipcRenderer.send('editWindow:ready')