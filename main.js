const {app, BrowserWindow,Menu,ipcMain} = require('electron');
const url = require('url');
const path = require('path');
const { mainModule } = require('process');

// Set ENV
process.env.NODE_ENV = 'production';

let mainWindow;
let addWindow;
let items = ['apples','oranges','banans','toilet-paper'];

// Listen for app ready
function createWindow(){
    //create browser window.
        mainWindow = new BrowserWindow({
        width:800,
        height:600,

        webPreferences:{
            nodeIntegration:true
        }
    })

    // Loading Index.html file
    mainWindow.loadFile('index.html');

    // Quit app when main window is closed
    mainWindow.on('closed',()=>{
        app.quit();
    })

    // Load all the items in the main window
   

    // Build manu from tempalte
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    
    // Inserting the menu
    Menu.setApplicationMenu(mainMenu);

    
}
app.whenReady().then(createWindow);

// HANDLE CREATE ADD WINDOW
function createAddWindow(height,width,title){
    //create browser window.
    addWindow = new BrowserWindow({
        width:height,
        height:width,
        title:title,
        webPreferences:{
            nodeIntegration:true
        }
    })

    // Loading Index.html file
    addWindow.loadFile('AddItem.html');

    // Garbage collection handle
    addWindow.on('close',()=>{
        addWindow = null;
    })
}

// Catch Item:add
ipcMain.on('item:add',(e,item)=>{
   items.push(item);
   mainWindow.webContents.send('item:add',item);
   addWindow.close();
})

// Create menu template
const mainMenuTemplate = [
    {
        label:'file',
        submenu:[
            {
                label:'Add Item',
                accelerator: process.platform == 'darwin' ? `Command+D` : `Ctrl+D`,
                click(){
                    createAddWindow(400,300,'Add Shopping List Items');
                }
            },
            {
                label:'Clear Items',
                click(){
                   mainWindow.webContents.send('item:clear');
                }
            },
            {
                label:'Quit',
                accelerator: process.platform == 'darwin' ? `Command+Q` : `Ctrl+Q`,
                click(){
                    app.quit()
                }
            },
        ]
    }
];

// If mac, add empty obj to the menu
if(process.platform == 'darwin'){
    mainMenuTemplate.unshift({});
}

// Add developer tools item if not in production
if(process.env.NODE_ENV != 'production'){
    mainMenuTemplate.push({
        label:'Developer Tools',

        submenu:[
            {
                label:'Toggle DevTools',
                accelerator: process.platform == 'darwin' ? `Command+I` : `Ctrl+I`,

                click(item,focusedWindow){
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role:`reload`
            }
        ]
    })
}

ipcMain.on('loaded',()=>{
    console.log('loaded mate!');
    mainWindow.webContents.send('items:get',items);
})