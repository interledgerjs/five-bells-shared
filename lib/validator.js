'use strict'

const fs = require('fs')
const path = require('path')

const skeemas = require('skeemas')

const BASE_DIR = path.join(__dirname, '/../schemas')

/**
 * @typedef {Object} ValidationResult
 * @property {Boolean} valid Whether the data matched the schema.
 * @property {Object[]} errors A list of validation errors if any.
 */

/**
 * Filter function for JSON data.
 *
 * @callback ValidatorFunction
 * @param {Object} data Data to be validated
 * @return {ValidationResult} Validation result
 */

/**
 * Validation helper class.
 */
class Validator {
  constructor () {
    this.skeemas = skeemas()
    this.loadedDirectories = new Set()
  }

  /**
   * Load the schemas shipped with five-bells-shared.
   */
  loadSharedSchemas () {
    this.loadSchemasFromDirectory(BASE_DIR)
  }

  /**
   * Load additional schemas from the provided directory.
   *
   * The schemas must be individual JSON files with the `.json` extension.
   *
   * @param {String} dirPath Absolute path to the schemas
   */
  loadSchemasFromDirectory (dirPath) {
    // Only load each directory once
    if (this.loadedDirectories.has(dirPath)) return
    this.loadedDirectories.add(dirPath)

    fs.readdirSync(dirPath)
      .filter((fileName) => {
        return /^[\w\s]+\.json$/.test(fileName)
      })
      .forEach((fileName) => {
        try {
          let schemaJson = fs.readFileSync(path.join(dirPath, fileName), 'utf8')
          this.skeemas.addRef(fileName, JSON.parse(schemaJson))
        } catch (e) {
          throw new Error('Failed to parse schema: ' + fileName)
        }
      })
  }

  /**
   * Create a validation function for schema `schema`.
   *
   * @return {ValidatorFunction} Validation function
   */
  create (schema) {
    return (data) => {
      const result = this.skeemas.validate(data, schema + '.json')
      result.schema = schema
      return result
    }
  }
}

module.exports = Validator