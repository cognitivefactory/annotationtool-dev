'use strict'

const Store = require('electron-store')

class DataJson extends Store {
  constructor (settings) {
    super(settings)

    // initialize with inputs or empty array
    this.text = this.get('text') || []
    this.type = this.get('type') || []
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

  getText () {
    this.text = this.get('text')
    return this
  }

  getType() {
    this.type = this.get('type')
    return this
  }


}

module.exports = DataJson
