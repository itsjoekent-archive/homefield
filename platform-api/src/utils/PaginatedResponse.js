/**
 * Store data describing the result of a paginated query.
 *
 * @param {Number} total The total number of documents meeting the criteria
 * @param {Array<Mixed>} data An array of data returned by the query
 */
module.exports = function PaginatedResponse(total, data) {
  return {
    total,
    data,
  }
}
