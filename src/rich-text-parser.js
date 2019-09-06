import { NodeTree } from './node-tree'

export class RichTextParser {
  /**
   * Parse Prismic rich text components into HTML string.
   *
   * @param richText - Prismic rich text component
   * @param htmlSerializer - HtmlSerializer used for parsing
   * @returns {string} Rich text as HTML string
   */
  static parseAsHtml(richText, htmlSerializer) {
    const nodeTree = new NodeTree(richText)
    const serializedNodeTree = htmlSerializer.serializeNodeTree(nodeTree)

    return serializedNodeTree.join('')
  }

  /**
   * Parse Prismic rich text components as plain text.
   *
   * @param richText - Prismic rich text component
   * @param {string} [joinString= ] - String used to join parsed text of components
   * @returns {string} Rich text as plain text
   */
  static parseAsText(richText, joinString = ' ') {
    return richText.map(block => block.text).join(joinString)
  }
}
