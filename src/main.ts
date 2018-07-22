const electron = require('electron');
const url = require('url');
const path = require('path');
const {app, BrowserWindow, Menu, ipcMain} = electron;
const fs = require('fs');
const jsonpath = path.join(__dirname, "../library.json")
const library = openJson(jsonpath)

function openJson(path: string){
    if (!fs.existsSync(path)) {
        //create new json file with empty library
        var empty: any = [] //JEBAC TYPESCRIPT
        var emptyLibrary = {lib: empty, pending : empty} //JEBAC TYPESCRIPT
        var dictstring = JSON.stringify(emptyLibrary);
        fs.writeFileSync(path, dictstring);//JEBAC ASYNCHRONICZNY JS
    }
    return require(path)
}
//SEY ENV
process.env.NODE_ENV = 'DEBUG'
let mainWindow :any;
let addWindow :any;
//Listen for app to be ready
app.on('ready', function(){
    //Create new window, pass empty boject
    mainWindow = new BrowserWindow({});
    //Load html into window
    mainWindow.loadURL(url.format({
        //pathname: path.join(__dirname, '..mainWindow.html'),
        pathname: path.join(__dirname, "../gui/mainWindow.html"),
        protocol: 'file:',
        slashes: true
    }));
    console.log(mainWindow.pathname)
    // Quit App when closed
    mainWindow.on('closed', function(){
        app.quit();
    })

    //Build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    //Insert menu
    Menu.setApplicationMenu(mainMenu);

    //send json file to the mainwindow
    mainWindow.webContents.send('lib:init', library);
});

// Handle create add window
function createAddWindow(){
    //Create new window, pass empty boject
    addWindow = new BrowserWindow({
        width: 320,
        height: 300,
        title: 'Add Manga'
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
ipcMain.on('item:add', function(e: any, item :any){
    mainWindow.webContents.send('item:add', item);
    addWindow.close();
})
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

//If Mac, add empty object to menu
// if(process.platform == 'darwin'){
//     //adding element to the beginning of the list
//     mainMenuTemplate.unshift({});
// }

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