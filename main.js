const electron = require('electron');
const url = require('url');
const path = require('path');
const {app, BrowserWindow, Menu, ipcMain, globalShortcut} = electron;

//Initialize windows vars
let mainWindow;
let addWindow;
let editWindow;
//Listen for app to be ready
app.on('ready', function(){
    //Create new window, pass empty object
    mainWindow = new BrowserWindow({
        minWidth: 700,
        minHeight: 600,
        frame:false
    })
    //Load html into window
    mainWindow.loadURL(url.format({
        //pathname: path.join(__dirname, '..mainWindow.html'),
        pathname: path.join(__dirname, "./gui/mainWindow.html"),
        protocol: 'file:',
        slashes: true
    }));

    // Quit App when closed
    mainWindow.on('closed', function(){
        app.quit();
    })
    mainWindow.on('resize', () => {
        let height = mainWindow.webContents.getOwnerBrowserWindow().getBounds().height
        mainWindow.webContents.send('resize', height);
    })
    mainWindow.on('maximize', () => {
        let height = mainWindow.webContents.getOwnerBrowserWindow().getBounds().height
        mainWindow.webContents.send('maximize', height);
    })


    //Open developer tools item for focused window
    globalShortcut.register('CommandOrControl+I', () => {
        BrowserWindow.getFocusedWindow().toggleDevTools()
    })

});

// Handle create add window
function createSubWindow(title, htmlpath){
    //Create new window
    var window = new BrowserWindow({
        width: 320,
        minWidth: 320,
        height: 246,
        minHeight: 246,
        maxHeight: 246,
        title: title,
        frame: false
    });
    
    //Load html info window
    window.loadURL(url.format({
        pathname: htmlpath,
        protocol: 'file:',
        slashes: true
    }));
    //Garbage collection handle
    window.on('close', function(){
        window = null;
    })
    return window
}

// Catch item:add
ipcMain.on('manga:add', function(e, array){
    mainWindow.webContents.send('manga:add', array);
    addWindow.close();
})
ipcMain.on('manga:update', function(e, id, array){
    mainWindow.webContents.send('manga:update', id, array);
    editWindow.close();
})

ipcMain.on('create:addWindow', (event, text) => {
    addWindow = createSubWindow('Add manga', path.join(__dirname, './gui/addWindow.html'))
    ipcMain.on('addWindow:ready', (event) => {
        addWindow.webContents.send('init:title', text)
    })
})
ipcMain.on('create:editWindow', (event, item) => {
    editWindow = createSubWindow('Edit manga', path.join(__dirname, './gui/editWindow.html'))
    ipcMain.on('editWindow:ready', (event) => {
        editWindow.webContents.send('init:data', item)
    })
})
