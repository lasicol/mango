const electron = require('electron');
const url = require('url');
const path = require('path');
const {app, BrowserWindow, Menu, ipcMain, globalShortcut} = electron;

// ====================================================
// -------------- reading json ------------------------
const fs = require('fs');
const jsonpath = path.join(__dirname, "../library.json")
import { JsonReader } from "./jsonReader"
import { TIMEOUT } from "dns";
var library = new JsonReader(fs, jsonpath).openJson();
// =====================================================

//SET ENV
process.env.NODE_ENV = 'DEBUG'
//Initialize windows vars
let mainWindow :any;
let addWindow :any;
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
        pathname: path.join(__dirname, "../gui/mainWindow.html"),
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

    //Build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    //Insert menu
    Menu.setApplicationMenu(mainMenu);

});


//send json file to the mainwindow
ipcMain.on('mainhtml:ready', () => {
    mainWindow.webContents.send('lib:load', library);
})


// Handle create add window
function createAddWindow(){
    //Create new window
    addWindow = new BrowserWindow({
        width: 320,
        minWidth: 320,
        height: 246,
        minHeight: 246,
        title: 'Add Manga',
        frame: false
    });
    
    //Load html info window
    addWindow.loadURL(url.format({
        pathname: path.join(__dirname, '../gui/addWindow.html'),
        protocol: 'file:',
        slashes: true
    }));
    //Garbage collection handle
    addWindow.on('close', function(){
        addWindow = null;
    })
}

// Catch item:add
ipcMain.on('manga:add', function(e: any, array :any){
    mainWindow.webContents.send('manga:add', array);
    addWindow.close();
})

ipcMain.on('create:addWindow', createAddWindow)

//Create menu template
const mainMenuTemplate = [
    {
        label: 'File', 
        submenu: [
            {
                label: "Add Item",
                click(){
                    createAddWindow();
                }
            },
            {
                label: 'Clear Items',
                click(){
                    mainWindow.webContents.send('item:clear');
                }
            },
            {
                label: 'Quit',
                accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
                click(){
                    app.quit();
                }
            }
        ]
    }
];

//Add developer tools item if not in prod
if(process.env.NODE_ENV !== 'production'){
    let obj : any = {
        label: 'Developer Tools',
        submenu:[
            {
                label: 'Toggle DevTools',
                accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
                click(item: any, focusedWindow: any){
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role: 'reload'
            }
        ]
    }
    mainMenuTemplate.push(obj)
}