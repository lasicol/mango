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


    //Open developer tools item for focused window
    globalShortcut.register('CommandOrControl+I', () => {
        BrowserWindow.getFocusedWindow().toggleDevTools()
    })
    

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
        maxHeight: 246,
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

ipcMain.on('create:addWindow', (event: any, text: string) => {
    createAddWindow()
    ipcMain.on('addWindow:ready', (event: any) => {
        addWindow.webContents.send('init:title', text)
    })
})
