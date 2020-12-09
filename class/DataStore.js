'use strict'

const Store = require('electron-store')

class DataStore extends Store {
  constructor (settings) {
    super(settings)

    // initialize with inputs or empty array
    this.inputs = this.get('inputs') || []
    this.text = this.get('text') || []
    this.type = this.get('type') || []
  }

  saveinputs () {
    this.set('inputs', this.inputs)
    return this
  }

  getinputs () {
    this.inputs = this.get('inputs') || []
    return this.inputs
  }

  addinputText (inputText) {
    this.inputs = [ ...this.inputs, inputText ]
    //this.inputs = [ inputText ]
    return this.saveinputs()
  }


  saveText(){
    this.set('text', this.text)
    return this
  }

  addText (inputText) {
    //this.text = inputText
    this.text = [ ...this.text, inputText ]
    return this.saveText()
  }

  saveType(){
    this.set('type', this.type)
    return this
  }

  addType (inputText) {
    this.type = inputText
    return this.saveType()
  }

  getAnn () {
    return (this.get('text') || this.get('type'))
  }

  getText(){
    this.text = this.get('text') || []
    return this
  }

  deleteText() {
    this.text = []
    this.inputs = []
    return this.saveinputs()
  }

}

module.exports = DataStore
