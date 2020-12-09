const {BrowserWindow} = require('electron')


// default window settings
const defaultProps = {
    width: 1600,
    height: 1000,
    show: false,
    icon : '/src/style/icons/256x256.ico' , 
    backgroundColor: '#313536',

    // update for electron V5+
    webPreferences: {
      nodeIntegration: true
    }
  }

  class Window extends BrowserWindow {
    constructor ({ file, ...windowSettings }) {
      // calls new BrowserWindow with these props
      super({ ...defaultProps, ...windowSettings })

      // load the html and open devtools
      this.loadFile(file)
      // this.webContents.openDevTools()

      // gracefully show when ready to prevent flickering
      this.once('ready-to-show', () => {
        this.show()
      })
    }
  }

  module.exports = Window
