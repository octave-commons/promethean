const electron = require('electron');
console.log(electron);
const app = electron.app; // Module to control application life.
const BrowserWindow = electron.BrowserWindow; // Module to create native browser window.

let Window;

app.commandLine.appendSwitch('use-gl', 'desktop');
//app.commandLine.appendSwitch('js-flags', '--harmony-sharedarraybuffer --enable-blink-feature=SharedArrayBuffer --use_strict');


// Quit when all windows are closed.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

console.log(process.argv);

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.

app.on('ready', () => {
    Window = new BrowserWindow({
        width: 1600,
        height: 800,
        frame: true
    });

    Window.loadURL(`file://${__dirname}/../index.html`);
    Window.webContents.openDevTools();

    Window.on('closed', () => Window = null);
});

module.exports = {app, Window,electron};
