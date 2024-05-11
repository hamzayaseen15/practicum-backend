const mongoose = require('mongoose')

/**
 * @class ApiHelper
 * @description Api pagination, sort, and filter helper
 */
module.exports = class ApiHelper {
  /**
   * Returns a paginated, filtered and sorted data with total count
   *
   * @param {import('express').Request} request
   * @param {mongoose.Model} model
   * @param {Object|null} extraFilters
   * @param {string|null} select
   * @param {string|null} populate
   * @returns {{results: object[], pagination: {skip: number, limit: number, total: number}} | object[]}
   */
  static async handleGet(request, model, extraFilters, select, populate) {
    const {
      query: { filters, sort, perPage, page },
    } = request

    let query = model.find()

    let requestFilters = filters ? JSON.parse(filters) : {}
    if (extraFilters) {
      requestFilters = { ...requestFilters, ...extraFilters }
    }
    for (const [key, value] of Object.entries(requestFilters)) {
      if (key && value) {
        if (typeof value == 'string') {
          if (
            model.schema.path(key) instanceof mongoose.Schema.Types.ObjectId
          ) {
            query = query.where(key, value)
          } else {
            query = query.where(key, {
              $regex: `.*${value}.*`,
              $options: 'i',
            })
          }
        } else if (typeof value == 'object') {
          query = query.where(key, value)
        }
      }
    }

    if (sort) {
      const requestSort = JSON.parse(sort)
      const sortParams = {}
      for (let i = 0; i < requestSort.length; i++) {
        const qs = requestSort[i]
        if (qs.field) sortParams[qs.field] = qs.type == 'asc' ? 1 : -1
      }

      if (Object.keys(requestSort).length > 0) {
        query = query.sort(sortParams)
      }
    }

    let skip = 0
    let limit = 0
    if (!!page && !!perPage) {
      limit = parseInt(perPage, 10)
      skip = (page - 1) * perPage

      query = query.skip(skip).limit(limit)
    }

    if (populate) {
      query = query.populate(populate)
    }

    if (select) {
      query = query.select(select)
    }

    if (page) {
      const countQuery = query.model.find().merge(query.getFilter())
      const total = await countQuery.countDocuments()
      const results = await query.exec()
      return { results, pagination: { skip, limit, total } }
    }

    const results = await query.exec()
    return results
  }
}
