'use strict'

const {dialog} = require('electron').remote
const fs = require('fs')
const { ipcRenderer } = require('electron')
var path = require('path')
const ExcelJS = require('exceljs');

document.getElementById('Refresh').addEventListener('click', () => {
  ipcRenderer.send('maj');
})

// Lorsque l'on clique sur DownloadBtn le renderer process envoie au main process json (cf main.js)
document.getElementById('DownloadBtn').addEventListener('click', () => {
  ipcRenderer.send('json');
})

// Lorsque l'on clique sur clearBtn le renderer process envoie au main process clear-txt (cf main.js)
document.getElementById('clearBtn').addEventListener('click', () => {
    ipcRenderer.send('clear-txt');
  })

// Lorsque l'on clique sur AnnoterBtn le renderer process envoie au main process add-ann-window
// qui sera la fenêtre pour annoter
document.getElementById('AnnoterBtn').addEventListener('click', () => {
    ipcRenderer.send('add-ann-window');
  })

/* Annotation d'une partie de texte */
document.getElementById('AnnoterPartBtn').addEventListener('click', () => {
  console.log(ipcRenderer.send('add-ann-specifique-window'));
  })


// Lorsque l'on clique sur AnnoterBtn le renderer process envoie au main process add-window
// qui sera la fenêtre pour écrire notre texte
document.getElementById('WriteBtn').addEventListener('click', () => {
  ipcRenderer.send('add-window');
})

// Lorsque l'on clique sur AddtxtBtn le renderer process envoie au main process add-txt
// qui permet d'importer du texte dans les différents formats accepté
document.getElementById('AddtxtBtn').addEventListener('click', () => {
  //ouvre le fenetre qui permet de choisir le fichier
  dialog.showOpenDialog((fileNames) => {
    if(fileNames === undefined){
      console.log('No file was selected');
    }else {
      var filePath = String(fileNames);
      var ext = path.extname(filePath);
      //import .txt
      if (ext == '.txt'){
        fs.readFile(fileNames[0], 'utf-8', (err, data) => {
          if (err){
            console.log('cannot read file', err);
          }else{
            ipcRenderer.send('add-txt', data);
          }
        })
        //import json
      }else if(ext == '.json'){
        ipcRenderer.send('add-json-window');
        ipcRenderer.once('key-json', (event, key) => {
          fs.readFile(fileNames[0], 'utf-8', (err, data) => {
            if (err){
              console.log('cannot read file', err);
            }else{
              const obj = data.split('{');
              for (var i = 1; i<obj.length; i++){
                const text = obj[i].split('\"' + key + '\"');
                const txt = text[1].split('\"');
                ipcRenderer.send('add-txt', txt[1]);
              }
            }
          })
        })
        //import csv
      }else if (ext == '.csv'){
        ipcRenderer.send('add-csv-window');
        ipcRenderer.once('key-csv', (event, key_sep) => {
          fs.readFile(fileNames[0], 'utf-8', (err, data) => {
            if (err){
              console.log('cannot read file', err);
            }else{
              const key = key_sep.split(';')[0];
              const sep= key_sep.split(';')[1];
              const obj = data.split('\n');
              var ind = 0;
              const index = obj[0].split(',');
              for (var j = 0; j<index.length; j++){
                if (index[j] == key){
                  ind = j;
                }
              }
              for (var i = 1; i<obj.length-1; i++){
                const text = obj[i].split(sep);
                ipcRenderer.send('add-txt', text[ind]);
              }
            }
          })
        })
        //import xlsx
      }else if (ext == '.xlsx'){
        ipcRenderer.send('add-json-window');
        ipcRenderer.once('key-json', (event, key) => {
          const workBook = new ExcelJS.Workbook();
          workBook.xlsx.readFile(filePath).then(function() {
            const sheet = workBook.getWorksheet(1);
            var print = 0;
            for (var i = 1; i<= sheet.columnCount; i++){
              const col = sheet.getColumn(i);
              col.eachCell({ includeEmpty: false }, function(cell, rowNumber) {
                if (rowNumber == 1){
                  print = 0;
                  if(cell.value ==key){
                    print = 1;
                  }
                }else {
                  if (print == 1){
                    ipcRenderer.send('add-txt', cell.value);
                  }
                }
              })
            }
          })
        })
        //cas d'un fichier non supporté
      }else {
        alert("format non conforme");
      }
    }
  })
})


// Quand ce renderer process reçoit inputstoPrint
// il va ajouter le contenu du JSON file dans la page html ann_menu.html
// dans la balise id=Inputtxt
ipcRenderer.on('inputstoPrint', (event, txt) => {
      const Inputtxt = document.getElementById('Inputtxt');

      const txtItems = txt.reduce((html, text) => {
        html += `<a id="input" class="input-txt" onclick="changeClass(this);">${text}</a>`;
        return html
      }, '')

      Inputtxt.innerHTML = txtItems;

    })


/* Effacer le texte */
ipcRenderer.on('toClear', (event) => {
    var list1 = document.getElementsByClassName("input-txt");
    var list2 = document.getElementsByClassName('input-txt-toggle');
    var list = list1.concat(list2);

    for(var i = list.length-1; i=>0; i--){
      list[i].parentElement.removeChild(list[i]);
    }
  })

/* Ajout des annotations dans la barre latérale */  
ipcRenderer.on('annAddList', (event, txt,annotation, num ) => {
  var div = document.createElement('div');
  var ann = annotation;
  var AnnNode = document.createTextNode(ann);
  div.appendChild(AnnNode);
  var txtList = txt + ":";
  var textarea = document.createElement('textarea');
  textarea.id = "Mytextarea";

  var a = document.createElement('a');
  var li = document.createElement('li');
  var button = document.createElement('button');
  button.setAttribute("id", "buttonerase");
  var buttonModify = document.createElement('button');
  buttonModify.setAttribute("id","buttonModify");

  var buttonConfirmer = document.createElement('button');
  buttonConfirmer.setAttribute("id","buttonConfirmer");

  a.appendChild(document.createTextNode(txtList));
  a.appendChild(div);
  a.appendChild(button);
  a.appendChild(buttonModify);


  li.appendChild(a);

  document.getElementById('annList').appendChild(li);


  button.onclick = function() {

    li.removeChild(a);


    fs.readFile('./config/DataStorage.json','utf8', (err,content) => {
      if (err) {
        alert("An error ocurred creating the file " + err.message);
      }else {
        const contentJson = JSON.parse(content);

        fs.readFile('./config/TextMain.json','utf8', (err,inputs) => {
          if (err){
            alert("An error ocurred opening the file " + err.message);
          }else{
            const inputsJson = JSON.parse(inputs);
            const textAnnote = inputsJson['inputs'][num];

            if (txt.search("Annotation du texte") != -1 || txt.search("Annotation Objet") != -1){
              for(var i = 0; i < contentJson.length; i ++){
                var elem = contentJson[i];

                if (elem['text'].localeCompare(textAnnote)==0 && elem['type'].localeCompare(annotation)==0){
                  contentJson.splice(i,1);

                }
              }

            }else {
              for(var i = 0; i < contentJson.length; i ++){
                var elem = contentJson[i];

                if (elem['text'].localeCompare(textAnnote)==0 && elem['entities'][0][2].localeCompare(annotation)==0){
                  contentJson.splice(i,1);
                }
              }
            }
            var newContent = JSON.stringify(contentJson);

            fs.writeFile('./config/DataStorage.json', newContent, (err) => {
              if (err) {
                alert("An error ocurred creating the file " + err.message);
              } 
            })

          }

        })

      }
    })

   };


  /* Bouton modifier annotation */
  buttonModify.onclick = function() {
    a.removeChild(div);
    a.removeChild(button);
    a.removeChild(buttonModify);
    a.appendChild(textarea);
    a.appendChild(button);
    a.appendChild(buttonConfirmer);
  };

  /* Boutton confirmer annotation et modification des fichiers sauvegarde dans config*/
  buttonConfirmer.onclick = function(){
    var oldAnn = div.childNodes[0].nodeValue;
    div.removeChild(AnnNode);
    var ann = document.getElementById("Mytextarea").value;
    AnnNode = document.createTextNode(ann);
    div.appendChild(AnnNode);
    a.removeChild(textarea);
    a.removeChild(button);
    a.removeChild(buttonConfirmer);
    a.appendChild(div);
    a.appendChild(button);
    a.appendChild(buttonModify);

    fs.readFile('./config/DataStorage.json','utf8', (err,content) => {
      if (err) {
        alert("An error ocurred creating the file " + err.message);
      }else {
        const contentJson = JSON.parse(content);

        fs.readFile('./config/TextMain.json','utf8', (err,inputs) => {
          if (err){
            alert("An error ocurred opening the file " + err.message);
          }else{
            const inputsJson = JSON.parse(inputs);
            const textAnnote = inputsJson['inputs'][num];

            if (txt.search("Annotation du texte") != -1 || txt.search("Annotation Objet") != -1){
              for(var i = 0; i < contentJson.length; i ++){
                var elem = contentJson[i];

                if (elem['text'].localeCompare(textAnnote)==0 && elem['type'].localeCompare(oldAnn)==0){
                  contentJson.splice(i,1);
                  contentJson.push({"text": textAnnote, "type": ann});
                }
              }
            }else {
              for(var i = 0; i < contentJson.length; i ++){
                var elem = contentJson[i];
                if (elem['text'].localeCompare(textAnnote)==0 && elem['entities'][0][2].localeCompare(oldAnn)==0){
                  var range =  elem['entities'][0];
                  contentJson.splice(i,1);
                  contentJson.push({"text": textAnnote, "type":"", "entities": [[range[0],range[1],ann]]});
                }
              }
            }
            var newContent = JSON.stringify(contentJson);

            fs.writeFile('./config/DataStorage.json', newContent, (err) => {
              if (err) {
                alert("An error ocurred creating the file " + err.message);
              } 
            })

          }

        })

      }
    })

  };

})
