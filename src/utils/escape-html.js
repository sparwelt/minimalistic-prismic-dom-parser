const CHARACTER_ENTITIES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;'
}

/**
 * Escape special HTML characters with their character entities to prevent XSS.
 *
 * Read https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html
 * to get more information about XSS prevention strategies and techniques.
 *
 * @param {string} html HTML to be escaped
 * @returns {string} escaped HTML
 */
export const escapeHtml = html =>
  html.replace(/[&<>"'\/]/g, substring => CHARACTER_ENTITIES[substring])
