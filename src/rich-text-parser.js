import { HtmlSerializer } from './html-serializer'
import { NodeTree } from './node-tree'

export class RichTextParser {
  /**
   * Parse Prismic rich text components into HTML string.
   *
   * @param richText
   * @returns {string} HTML string from rich text
   */
  static parseAsHtml(richText) {
    return HtmlSerializer.serializeNodeTree(new NodeTree(richText)).join('')
  }

  /**
   * Parse Prismic rich text components as plain text.
   *
   * @param richText
   * @param {string=} joinString
   * @returns {string}
   */
  static parseAsText(richText, joinString = ' ') {
    return richText.map(block => block.text).join(joinString)
  }
}
