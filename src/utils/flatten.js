/**
 * Transform multidimensional array into one dimensional array.
 *
 * @param {*[]} array
 * @returns {*[]}
 *
 * @example
 * [1, [2], [[3, 4]]] => [1, 2, 3, 4]
 */
export const flatten = array =>
  !Array.isArray(array) || !array.some(Array.isArray)
    ? array
    : array.reduce((flat, current) => flat.concat(flatten(current)), [])
