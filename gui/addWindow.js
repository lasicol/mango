const electron = require('electron');
const Manga = require('./manga');
const {ipcRenderer, remote} = electron;

// =============================================================================
// ---------------------- add app buttons --------------------------------------
document.getElementById('minimizeButton').addEventListener('click', (event) => {
    let window = remote.getCurrentWindow();
    window.minimize(); 
})
document.getElementById('maximizeButton').addEventListener('click', (event) => {
    let window = remote.getCurrentWindow();
    if (window.isMaximized()){ window.unmaximize() }
    else{ window.maximize() }
})
document.getElementById('exitButton').addEventListener('click', (event) => {
    let window = remote.getCurrentWindow();
    window.close(); 
})
// =============================================================================

ipcRenderer.on('init:title', (event, text) => {
    document.querySelector('#title').value = text
})

document.querySelector('form').addEventListener('submit', (event) => {
    event.preventDefault();
    const title = document.querySelector('#title').value.trim();
    const volume = document.querySelector('#volume').value;
    const chapter = document.querySelector('#chapter').value;
    const status = document.querySelector('#status').value;
    const author = document.querySelector('#author').value.trim();
    const notes = document.querySelector('#notes').value;
    ipcRenderer.send('manga:add', [title, volume, chapter, status, author, notes]);
});

window.addEventListener('keydown', (event) => {
    if (event.key == 'Escape'){
        window.close();
    }
})

ipcRenderer.send('addWindow:ready')