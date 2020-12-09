const { ipcRenderer } = require('electron')


  // Ce renderer process va envoyer ce qui a été entré dans le form input
  // et va l'envoyer au main process avec le message 'add-annotation'
  document.getElementById('InputText').addEventListener('submit', (evt) => {

    evt.preventDefault()

    const input = evt.target[0]

    var annotateAll = document.getElementById("annotateAll");
    // envoie au main process
    ipcRenderer.send('text-selection-annotation',input.value,annotateAll.checked)

    input.value = ''

    ipcRenderer.send('closeAnnSpecWinn');
  })
