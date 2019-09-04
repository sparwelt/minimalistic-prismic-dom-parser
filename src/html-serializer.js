/*
 * For information see
 * https://prismic.io/docs/javascript/beyond-the-api/html-serializer
 */
import { escapeHtml } from './utils/escape-html'
import { SpanNode } from './utils/nodes'
import { resolveUrl } from './utils/resolve-url'
import { NODE_TYPES } from './utils/types'

export class HtmlSerializer {
  /**
   * Serialize node tree into array of HTML strings.
   *
   * @param {NodeTree} nodeTree
   * @returns {string[]} serialized node tree
   */
  static serializeNodeTree(nodeTree) {
    return nodeTree.children.map(parentNode =>
      (function step(node) {
        const serializedChildren = node.children.reduce(
          (result, node) => result.concat([step(node)]),
          []
        )

        return HtmlSerializer.serialize(node, serializedChildren)
      })(parentNode)
    )
  }

  /**
   * Create <tag> with children inside.
   *
   * @param {string} tag Outer HTML element tag
   * @param {string[]} children Children concatenated and used as inner HTML
   * @returns {string} serialized HTML string (Tag with children)
   */
  static serializeStandardTag(tag, children) {
    return `<${tag}>${children.join('')}</${tag}>`
  }

  /**
   * Create <img> wrapped in <p>.
   * Image is additionally wrapped in <a> tag, if linkTo is provided on the element.
   *
   * @param element Prismic image element
   * @returns {string} serialized HTML string (Image)
   */
  static serializeImage(element) {
    const src = escapeHtml(element.url)
    const alt = escapeHtml(element.alt || '')
    const copyright = escapeHtml(element.copyright || '')

    const img = `<img src="${src}" alt="${alt}" data-copyright="${copyright}">`

    let content = element.linkTo
      ? HtmlSerializer.serializeHyperlink(element.linkTo, img)
      : img

    return `<p>${content}</p>`
  }

  /**
   * Create <div> containing Prismic embed HTML.
   *
   * @param element Prismic embed element
   * @returns {string} serialized HTML string (Div with e.g. iframe inside)
   */
  static serializeEmbed(element) {
    const dataOembed = escapeHtml(element.oembed.embed_url)
    const dataOembedType = escapeHtml(element.oembed.type)
    const dataOembedProvider = escapeHtml(element.oembed.provider_name)

    return `
        <div data-oembed="${dataOembed}"
          data-oembed-type="${dataOembedType}"
          data-oembed-provider="${dataOembedProvider}"
        >
          ${element.oembed.html}
        </div>
      `
  }

  /**
   * Create <a> with content inside.
   *
   * @param link Prismic link with optional target and url
   * @param {string=} content Content to be used as inner HTML
   * @returns {string} serialized HTML string (Link)
   */
  static serializeHyperlink(link, content = '') {
    const href = escapeHtml(resolveUrl(link))
    const escapedTarget = escapeHtml(link.target || '')
    const target = escapedTarget
      ? ` target="${escapedTarget}" rel="noopener" `
      : ' '

    return `<a${target}href="${href}">${content}</a>`
  }

  /**
   * Create <span> with class provided by element.data.label.
   *
   * @param element Prismic element with label
   * @param children Children concatenated and used as inner HTML
   * @returns {string} serialized HTML string (Span with class)
   */
  static serializeLabel(element, children) {
    const label = element.data.label
      ? `class="${escapeHtml(element.data.label)}"`
      : ''
    return `<span ${label}>${children.join('')}</span>`
  }

  /**
   * Escape given text and replace line breaks with <br> tags.
   *
   * @param {string|null} text
   * @returns {string} escaped text
   */
  static serializeSpan(text) {
    return escapeHtml(text || '').replace(/\n/g, '<br>')
  }

  /**
   * Serialize Prismic node by choosing the appropriate method based on its type.
   *
   * @param {*} node Prismic node
   * @param {string[]} children Serialized node children used as inner HTML
   * @returns {string|null} serialized HTML string (Any - based on node type)
   */
  static serialize(node, children) {
    const { type, element } = node
    const content = node instanceof SpanNode ? node.text : null

    switch (type) {
      case NODE_TYPES.heading1.type:
        return HtmlSerializer.serializeStandardTag('h1', children)
      case NODE_TYPES.heading2.type:
        return HtmlSerializer.serializeStandardTag('h2', children)
      case NODE_TYPES.heading3.type:
        return HtmlSerializer.serializeStandardTag('h3', children)
      case NODE_TYPES.heading4.type:
        return HtmlSerializer.serializeStandardTag('h4', children)
      case NODE_TYPES.heading5.type:
        return HtmlSerializer.serializeStandardTag('h5', children)
      case NODE_TYPES.heading6.type:
        return HtmlSerializer.serializeStandardTag('h6', children)
      case NODE_TYPES.paragraph.type:
        return HtmlSerializer.serializeStandardTag('p', children)
      case NODE_TYPES.preformatted.type:
        return HtmlSerializer.serializeStandardTag('pre', children)
      case NODE_TYPES.strong.type:
        return HtmlSerializer.serializeStandardTag('strong', children)
      case NODE_TYPES.em.type:
        return HtmlSerializer.serializeStandardTag('em', children)
      case NODE_TYPES.listItem.type:
        return HtmlSerializer.serializeStandardTag('li', children)
      case NODE_TYPES.oListItem.type:
        return HtmlSerializer.serializeStandardTag('li', children)
      case NODE_TYPES.list.type:
        return HtmlSerializer.serializeStandardTag('ul', children)
      case NODE_TYPES.oList.type:
        return HtmlSerializer.serializeStandardTag('ol', children)
      case NODE_TYPES.image.type:
        return HtmlSerializer.serializeImage(element)
      case NODE_TYPES.embed.type:
        return HtmlSerializer.serializeEmbed(element)
      case NODE_TYPES.hyperlink.type:
        return HtmlSerializer.serializeHyperlink(
          element.data,
          children.join('')
        )
      case NODE_TYPES.label.type:
        return HtmlSerializer.serializeLabel(element, children)
      case NODE_TYPES.span.type:
        return HtmlSerializer.serializeSpan(content)
      default:
        return null
    }
  }
}
