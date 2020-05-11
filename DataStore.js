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
    // save inputs to JSON file
    this.set('inputs', this.inputs)

    // returning 'this' allows method chaining
    return this
  }

  getinputs () {
    // set object's inputs to inputs in JSON file
    this.inputs = this.get('inputs') || []
    return this
  }

  addinputText (inputText) {
    // merge the existing inputs with the new inputText
    this.inputs = [ ...this.inputs, inputText ]

    return this.saveinputs()
  }


  saveText(){
    this.set('text', this.text)
    return this
  }

  addText (inputText) {
    //this.text = [ ...this.text, inputText ]
    this.text = inputText
    return this.saveText()
  }

  saveType(){
    this.set('type', this.type)
    return this
  }

  addType (inputText) {
    this.type = [ ...this.type, inputText ]
    return this.saveType()
  }

  getAnn () {
    // set object's inputs to inputs in JSON file
    //this.inputs = this.get('inputs') || []
    return (this.get('text') || this.get('type'))
  }

}

module.exports = DataStore
