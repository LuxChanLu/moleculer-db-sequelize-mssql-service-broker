const DataAdapter = require("sqlssb/source/dataAdapter")

const DataAdapter = require('sqlssb/source/dataAdapter.js')

module.exports = class extends DataAdapter {
  constructor(config) {
    this._config = config
  }

  _connect() {
    return this._config.service.adapter.db.connectionManager.getConnection()
  }

  stop() {
  }
}