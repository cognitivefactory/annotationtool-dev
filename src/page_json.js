'use strict'

const { ipcRenderer } = require('electron')


// Ce renderer process va envoyer ce qui a été entré dans le form input
// et va l'envoyer au main process avec le message 'add-text'
document.getElementById('InputText').addEventListener('submit', (evt) => {

  evt.preventDefault();

  const input = evt.target[0];

  // envoie au main process
  ipcRenderer.send('add-json-key', input.value);

  input.value = '';

  ipcRenderer.send('closejsonWin');
})
