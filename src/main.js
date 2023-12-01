const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const path = require('path');

let mainWindow;

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    resizable: false,
    frame: false,
    icon: path.join(__dirname, 'public', 'img', 'collab.ico'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  mainWindow.setMenuBarVisibility(false)
  mainWindow.loadFile('public/index.html');

  ipcMain.on('open-file-dialog', (event) => {
    dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'Images', extensions: ['jpg', 'png', 'gif'] }],
    }).then((result) => {
      if (!result.canceled && result.filePaths.length > 0) {
        event.reply('selected-file', result.filePaths[0]);
      }
    });
  });
});

ipcMain.on('close-me', (evt, arg) => {
  app.quit();
});
