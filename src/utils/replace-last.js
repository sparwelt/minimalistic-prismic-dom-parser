/**
 * Replace the last element of an array with the given value.
 * If an empty array is passed the element gets inserted.
 *
 * @param {*[]} array
 * @param {*} replacement
 * @returns {*[]} The original array with its last element replaced.
 *
 * @example
 * replaceLast([1, 2], 3) // [1, 3]
 * replaceLast([], {foo: 'bar'}) // [{foo: 'bar'}]
 */
export const replaceLast = (array, replacement) =>
  array.splice(-1, 1, replacement) && array
