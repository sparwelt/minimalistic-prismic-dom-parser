/**
 * Resolves a link URL based on its link_type
 *
 * from
 * https://github.com/prismicio/prismic-helpers/commit/a1439d8fe5fe388abe20bd69eeed26f67631f5c3
 *
 * @param link Prismic link
 * @returns {string} URL
 */
export const resolveUrl = link =>
  'Document' === link.link_type ? '' : link.url
