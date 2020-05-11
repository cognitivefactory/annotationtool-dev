const path = require('path')
const { app, ipcMain} = require('electron')

const DataJson = require('./DataJson')
const Window = require('./Window')
const DataStore = require('./DataStore')
const fs = require('fs')


// Permet de sauvegarde notre json le bon dossier
app.setPath("userData", __dirname + "/config")

// DataStore stocke le texte à annoter dans un fichier JSON
const textData = new DataStore({ name: 'TextMain' })

// DataStructure contient l'annotation
const DataStructure = new DataJson({ name : 'DataStruct'})

const config = require('./config/DataStruct.json')

require('electron-reload')(__dirname)

function main () {

    // Création de la fenêtre principale
    let mainWindow = new Window({
      file: path.join(__dirname,'index.html')
    })

    // Fenêtre secondaire qui va nous permettre d'écrire le texte à annoter
    let addWin
      // create add text window
    ipcMain.on('add-window', () => {
    // if addWin does not already exist
    if (!addWin) {
      // create a new window
      addWin = new Window({
        file: path.join('src', 'ann_type.html'),
        width: 400,
        height: 400,
        // close with the main window
        parent: mainWindow
      })

      // cleanup
      addWin.on('closed', () => {
        addWin = null
      })
    }
  })

  // Fenêtre secondaire qui va nous permettre d'ajouter l'annotation
  let annWin
    // create annotation window
  ipcMain.on('add-ann-window', () => {
  // if annWin does not already exist
  if (!addWin) {
    // create a new  window
    annWin = new Window({
      file: path.join('src', 'annotation.html'),
      width: 200,
      height: 200,
      // close with the main window
      parent: mainWindow
    })

    // cleanup
    annWin.on('closed', () => {
      annWin = null
    })
    }
  })

    // add-text from ann_type_win
  // Lorsque le main process reçoit 'add-text' il ajoute txt dans le fichier JSON textData
  // puis envoie ce fichier à un renderer process (cf ann_menu.js)
  ipcMain.on('add-text', (event, txt) => {
      const updatedText = textData.addinputText(txt).inputs
      console.log(updatedText)
      mainWindow.send('inputstoPrint', updatedText)
      console.log(DataStructure.addText(txt).text)
  })

  // clear-txt from txt list window
  // Supprime le contenu de textData
  ipcMain.on('clear-txt', (event) => {
    textData.clear()
    DataStructure.clear()
  })

  /* ANNOTATION */  
  ipcMain.on('add-annotation', (event, annotation ) => {
    console.log(DataStructure.addType(annotation).type)
    //console.log(DataStructure.set('type', { type : annotation }))
    //console.log(DataStructure.getText().text)
    //console.log(DataStructure.getText().text && DataStructure.getType().type)
  })


  ipcMain.on('json', (event) => {

    //var tabJson = [];
    fs.readFile('./config/DataStruct.json', 'utf8', (err, jsonString) => {
      if (err) {
          console.log("File read failed:", err)
          return
      }
      const jsonString2 = JSON.parse(jsonString);
      var content = "[]"
      fs.writeFile('DataStructure.json', content, (err) => {
        if(err){
            alert("An error ocurred creating the file "+ err.message)
        }
        else {
          fs.readFile('DataStructure.json', 'utf8', function (err, data) {
            if (err) {
                console.log(err)
            } else {
                const file = JSON.parse(data);
                file.push(jsonString2);
                const json = JSON.stringify(file);
         
                fs.writeFile('DataStructure.json', json, 'utf8', function(err){
                     if(err){ 
                           console.log(err); 
                     } else {
                           console.log('Data written to file')
                     }});
            }
         
         });
        }
    });
      /*console.log('File data:', jsonString) 
      tabJson.push(jsonString);
      console.log(tabJson);
      fs.writeFile('structure.json', tabJson, (err) => {
        if (err) throw err;
        console.log('Data written to file');
      });
      */
  })

   

    //var content = fs.readFile('./DataStruct.json', (err) => {
      //if (err) throw err;
      //var content2 = JSON.parse(content);
      //var parseJson = JSON.parse(content2.text);
      //console.log(parseJson);
    //})
    //tabJson.push();
    //console.log(tabJson);
    
  /*
    // destination.txt will be created or overwritten by default.
    fs.copyFile('./config/DataStruct.json', 'DataStructure.json', (err) => {
      if (err) throw err;
      console.log(' ./config/DataStruct.json was copied to DataStructure.json');
    })
    //let data = JSON.stringify(DataStructure, null, 2);
    //let data = JSON.stringify(DataStructure, null, 2);
    //fs.writeFile('structure.json', data, (err) => {
      //if (err) throw err;
      //console.log('Data written to file');
    //});
    */
  //console.log('This is after the write call');

  })

} 

app.on('ready', main)

app.on('window-all-closed', function () {
  app.quit()
})
