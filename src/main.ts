import {app, BrowserWindow} from 'electron'

let win = null

app.on('ready', () => {
    win = new BrowserWindow({
        darkTheme: true
    })
    
})