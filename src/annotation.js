const { ipcRenderer } = require('electron')


// Ce renderer process va envoyer ce qui a été entré dans le form input
// et va l'envoyer au main process avec le message 'add-annotation'
document.getElementById('InputText').addEventListener('submit', (evt) => {
  
  // prevent default refresh functionality of forms
  evt.preventDefault()

  // input on the form
  const input = evt.target[0]
  
  // send txt to main process
  ipcRenderer.send('add-annotation', input.value)
  alert("Ajouté")
  // reset input
  input.value = ''

})
