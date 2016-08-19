'use strict'

const Joi = require('joi')
const Boom = require('boom')
const context = require('../../../../lib/context')
const processStatistics = require('../../../../lib/process-statistics')

const deleteExceptions = (request, reply) => {
  return request.server.methods.findProcess(context(request), request.params.name)
  .then(proc => {
    if (!proc) {
      throw Boom.notFound(`No process found for ${request.params.name}`)
    }

    return processStatistics(context(request), request.params.name)
  })
  .then(stats => {
    return stats.exceptions
  })
}

module.exports = {
  path: '/processes/{name}/exceptions',
  method: 'GET',
  handler: deleteExceptions,
  config: {
    auth: {
      strategy: 'certificate',
      scope: ['user']
    },
    validate: {
      params: {
        name: Joi.string().required()
      }
    }
  }
}