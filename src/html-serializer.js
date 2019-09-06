/*
 * For information see
 * https://prismic.io/docs/javascript/beyond-the-api/html-serializer
 */
import { escapeHtml } from './utils/escape-html'
import { SpanNode } from './types/nodes'
import { resolveUrl } from './utils/resolve-url'
import { PRISMIC_ELEMENTS } from './types/prismic-elements'

export class HtmlSerializer {
  /**
   * @param {Object} [options={}] - HtmlSerializerOptions
   * @param {string} [options.defaultHyperlinkTarget=_self] - Value for hyperlink target attribute used as fallback if no link.target is provided by Prismic
   * @param {string} [options.imageCopyrightAttribute=data-copyright] - Attribute to assign the imageElement.copyright to
   */
  constructor({ defaultHyperlinkTarget, imageCopyrightAttribute } = {}) {
    this.defaultHyperlinkTarget = defaultHyperlinkTarget || '_self'
    this.imageCopyrightAttribute = imageCopyrightAttribute || 'data-copyright'
  }

  /**
   * Serialize node tree into array of HTML strings.
   *
   * @param {NodeTree} nodeTree
   * @returns {string[]} serialized node tree
   */
  serializeNodeTree(nodeTree) {
    const step = node => {
      const serializedChildren = node.children.reduce(
        (result, node) => result.concat([step(node)]),
        []
      )

      return this.serialize(node, serializedChildren)
    }

    return nodeTree.children.map(parentNode => {
      return step(parentNode)
    })
  }

  /**
   * Create <tag> with children inside.
   *
   * @param {string} tag - Outer HTML element tag
   * @param {string[]} children - Children concatenated and used as inner HTML
   * @returns {string} serialized HTML string (Tag with children)
   */
  serializeStandardTag(tag, children) {
    return `<${tag}>${children.join('')}</${tag}>`
  }

  /**
   * Create <img> wrapped in <p>.
   * Image is additionally wrapped in <a> tag, if linkTo is provided on the element.
   *
   * @param element - Prismic image element
   * @returns {string} serialized HTML string (Image)
   */
  serializeImage(element) {
    const src = escapeHtml(element.url)
    const alt = escapeHtml(element.alt || '')
    const copyright = escapeHtml(element.copyright || '')

    const img = `<img src="${src}" alt="${alt}" ${this.imageCopyrightAttribute}="${copyright}">`

    let content = element.linkTo
      ? HtmlSerializer.serializeHyperlink(element.linkTo, img)
      : img

    return `<p>${content}</p>`
  }

  /**
   * Create <div> containing Prismic embed HTML.
   *
   * @param element - Prismic embed element
   * @returns {string} serialized HTML string (Div with e.g. iframe inside)
   */
  serializeEmbed(element) {
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
   * @param link - Prismic link with optional target and url
   * @param {string} [content=] - Content to be used as inner HTML
   * @returns {string} serialized HTML string (Link)
   */
  serializeHyperlink(link, content = '') {
    const href = escapeHtml(resolveUrl(link))
    const escapedTarget = escapeHtml(link.target || this.defaultHyperlinkTarget)
    const targetSegment = `target="${escapedTarget}" rel="noopener"`

    return `<a ${targetSegment} href="${href}">${content}</a>`
  }

  /**
   * Create <span> with class provided by element.data.label.
   *
   * @param element - Prismic element with label
   * @param children - Children concatenated and used as inner HTML
   * @returns {string} serialized HTML string (Span with class)
   */
  serializeLabel(element, children) {
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
  serializeSpan(text) {
    return escapeHtml(text || '').replace(/\n/g, '<br>')
  }

  /**
   * Serialize Prismic node by choosing the appropriate method based on its type.
   *
   * @param {*} node - Prismic node
   * @param {string[]} children - Serialized node children used as inner HTML
   * @returns {string|null} serialized HTML string (Any - based on node type)
   */
  serialize(node, children) {
    const { type, element } = node
    const content = node instanceof SpanNode ? node.text : null

    switch (type) {
      case PRISMIC_ELEMENTS.heading1.type:
        return this.serializeStandardTag('h1', children)
      case PRISMIC_ELEMENTS.heading2.type:
        return this.serializeStandardTag('h2', children)
      case PRISMIC_ELEMENTS.heading3.type:
        return this.serializeStandardTag('h3', children)
      case PRISMIC_ELEMENTS.heading4.type:
        return this.serializeStandardTag('h4', children)
      case PRISMIC_ELEMENTS.heading5.type:
        return this.serializeStandardTag('h5', children)
      case PRISMIC_ELEMENTS.heading6.type:
        return this.serializeStandardTag('h6', children)
      case PRISMIC_ELEMENTS.paragraph.type:
        return this.serializeStandardTag('p', children)
      case PRISMIC_ELEMENTS.preformatted.type:
        return this.serializeStandardTag('pre', children)
      case PRISMIC_ELEMENTS.strong.type:
        return this.serializeStandardTag('strong', children)
      case PRISMIC_ELEMENTS.em.type:
        return this.serializeStandardTag('em', children)
      case PRISMIC_ELEMENTS.listItem.type:
        return this.serializeStandardTag('li', children)
      case PRISMIC_ELEMENTS.oListItem.type:
        return this.serializeStandardTag('li', children)
      case PRISMIC_ELEMENTS.list.type:
        return this.serializeStandardTag('ul', children)
      case PRISMIC_ELEMENTS.oList.type:
        return this.serializeStandardTag('ol', children)
      case PRISMIC_ELEMENTS.image.type:
        return this.serializeImage(element)
      case PRISMIC_ELEMENTS.embed.type:
        return this.serializeEmbed(element)
      case PRISMIC_ELEMENTS.hyperlink.type:
        return this.serializeHyperlink(element.data, children.join(''))
      case PRISMIC_ELEMENTS.label.type:
        return this.serializeLabel(element, children)
      case PRISMIC_ELEMENTS.span.type:
        return this.serializeSpan(content)
      default:
        return null
    }
  }
}
