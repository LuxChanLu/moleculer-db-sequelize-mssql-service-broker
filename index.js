const Sqlssb = require('sqlssb')
const SqlssbDataAdapter = require('./SqlssbDataAdapter.js')

module.exports = {
  afterConnected() {
    this.$mssql = {
      services: {}
    }
    if (this.settings && this.settings.mssql && this.settings.mssql.services) {
      return Promise.all(Object.entries(this.settings.mssql.services).map(([name, service]) => {
        this.$mssql.services[name] = new Sqlssb({ ...service, adapter: SqlssbDataAdapter, service: this })
        this.$mssql.services[name].emit = (name, context) => {
          this.broker.emit(`${this.name}.${name}`, context)
        }
        return this.$mssql.services[name].start()
      }))
    }
  }
}