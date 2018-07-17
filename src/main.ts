import {app, BrowserWindow} from 'electron'
import * as path from "path";

let win = null

app.on('ready', () => {
    win = new BrowserWindow({
        darkTheme: true
    })

     // and load the index.html of the app.
     win.loadFile(path.join(__dirname, "../index.html"))
})