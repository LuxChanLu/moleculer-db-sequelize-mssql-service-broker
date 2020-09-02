const JSON = require('secure-json-parse')
const { QueryTypes } = require('sequelize')
const { readFileSync } = require('fs')
const { join } = require('path')

const SQL = {
  receive: readFileSync(join(__dirname, 'tsql', 'receive.sql')).toString(),
  send: readFileSync(join(__dirname, 'tsql', 'send.sql')).toString()
}

module.exports = {
  afterConnected() {
    this.$mssql = {
      services: {}
    }
    if (this.settings && this.settings.mssql && this.settings.mssql.services) {
      return Promise.all(Object.entries(this.settings.mssql.services).map(([name, service]) => {
        const { count = 1, queue, timeout = 5000, json = true, eventName } = service
        this.$mssql.services[name] = {
          service: this,
          adapter: this.adapter,
          broker: this.broker,
          active: true,
          async start() {
            do {
              const messages = await this.adapter.db.query(SQL.receive.replace(':queue', queue), { // Why 'replace' : https://github.com/sequelize/sequelize/issues/4494
                replacements: { count, timeout },
                type: QueryTypes.SELECT
              })
              await Promise.all(messages.map(message => {
                const event = eventName && typeof eventName == 'function' ? eventName(message, this.service, name) : (eventName || `${this.service.name}.${name}`)
                // TODO: XML ?
                if (json) {
                  message.body = JSON.parse(message.message_body.toString('ucs2'))
                  delete message.message_body
                }
                this.broker.emit(event, message)
              }))
            } while (this.active)
          },
          stop() {
            this.active = false
          },
          send(to, contract, type, payload) {
            const query = SQL.send // Why 'replace' : https://github.com/sequelize/sequelize/issues/4494
              .replace(':from', service.service)
              .replace(':to', to)
              .replace(':contract', contract)
              .replace(':type', type)
            return this.adapter.db.query(query, {
              replacements: { payload },
              type: QueryTypes.SELECT
            })
          }
        }
        this.$mssql.services[name].start()
      }))
    }
  },
  stopped() {
    Object.values(this.$mssql.services).forEach(service => service.stop())
  }
}