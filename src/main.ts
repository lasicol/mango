const electron = require('electron');
const url = require('url');
const path = require('path');

const {app, BrowserWindow, Menu, ipcMain} = electron;

//SEY ENV
process.env.NODE_ENV = 'production'
let mainWindow :any;
let addWindow :any;
//Liste for app to be ready
app.on('ready', function(){
    //Create new window, pass empty boject
    mainWindow = new BrowserWindow({});
    //Load html info window
    mainWindow.loadURL(url.format({
        //pathname: path.join(__dirname, '..mainWindow.html'),
        pathname: path.join(__dirname, "../mainWindow.html"),
        protocol: 'file:',
        slashes: true
    }));
    console.log(mainWindow.pathname)
    // Quit App when closed
    mainWindow.on('closed', function(){
        app.quit();
    })

    //Build menu from tempalte
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    //Insert menu
    Menu.setApplicationMenu(mainMenu);
});

// Handle create add window
function createAddWindow(){
    //Create new window, pass empty boject
    addWindow = new BrowserWindow({
        width: 300,
        height: 200,
        title: 'Add Manga'
    });
    
    //Load html info window
    addWindow.loadURL(url.format({
        pathname: path.join(__dirname, '../addWindow.html'),
        protocol: 'file:',
        slashes: true
    }));
    //Garbage collection handle
    addWindow.on('close', function(){
        addWindow = null;
    })
}

// Catch item:add
ipcMain.on('item:add', function(e :any, item :any){
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
// if(process.env.NODE_ENV !== 'production'){
//     mainMenuTemplate.push({
//         label: 'Developer Tools',
//         submenu:[
//             {
//                 label: 'Toggle DevTools',
//                 accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
//                 click(item, focusedWindow){
//                     focusedWindow.toggleDevTools();
//                 }
//             },
//             {
//                 role: 'reload'
//             }
//         ]
//     })
// }