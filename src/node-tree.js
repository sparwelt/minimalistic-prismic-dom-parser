import { flatten } from './utils/flatten'
import { getLast } from './utils/get-last'
import {
  ListBlockNode,
  ListItemBlockNode,
  Node,
  OrderedListBlockNode,
  OrderedListItemBlockNode,
  SpanNode,
  TextNode
} from './types/nodes'
import { replaceLast } from './utils/replace-last'
import { PRISMIC_ELEMENTS } from './types/prismic-elements'

/**
 * Creates an empty list.
 *
 * @param ordered - Determines if the list is ordered
 * @returns {{spans: [], text: string, type: (*)}}
 */
const createEmptyList = (ordered = false) => ({
  type: ordered ? PRISMIC_ELEMENTS.oList.type : PRISMIC_ELEMENTS.list.type,
  spans: [],
  text: ''
})

/**
 * Process a text block into a tree of text nodes
 *
 * @param textBlock
 * @returns {(TextNode|SpanNode)[]} Array of textNodes
 */
const processTextBlock = textBlock => {
  const boundaries = { lower: 0, upper: textBlock.text.length }
  const spans = textBlock.spans.map(span => {
    const text = textBlock.text.slice(span.start, span.end)
    return new SpanNode(span.start, span.end, span.type, text, [], span)
  })

  return buildTreeAndFill(textBlock.text, spans, boundaries)
}

const buildTreeAndFill = (text, spans, boundaries) => {
  if (spans.length) {
    const tree = buildTree(text, spans)
    return fill(text, tree, boundaries)
  }

  const subtext = text.slice(boundaries.lower, boundaries.upper)
  return [new TextNode(boundaries.lower, boundaries.upper, subtext)]
}

const buildTree = (text, spans) => {
  const sortedSpans = spans.sort((a, b) => a.start - b.start || a.end - b.end)
  const groupedSpans = groupSpans(sortedSpans)
  const postElection = createElection(groupedSpans)
  const partitionedGroups = partitionGroups(text, postElection)
  const flattenedGroups = flatten(partitionedGroups)

  return flattenedGroups.sort((nodeA, nodeB) => nodeA.start - nodeB.start)
}

/**
 * Group spans that style the same text.
 *
 * @param {SpanNode[]} spans
 * @returns {SpanNode[][]}
 */
const groupSpans = spans => {
  if (!spans.length) return []

  let current = spans[0]
  let currentGroup = [current]
  const groupedSpans = [currentGroup]

  for (let i = 1; i < spans.length; i++) {
    const previous = current
    current = spans[i]

    currentGroup.some(span => span.isParentOf(current)) ||
    previous.end >= current.start
      ? currentGroup.push(current)
      : groupedSpans.push((currentGroup = [current]))
  }

  return groupedSpans
}

/**
 * Elect the span node with the highest priority per group.
 *
 * @param {SpanNode[][]} groups
 * @returns {{elected: SpanNode, others: SpanNode[]}[]}
 */
const createElection = groups => {
  return groups.map(group => {
    if (!group.length) throw new Error('Unable to elect node on empty list')

    const [elected, ...others] = group.sort((spanA, spanB) => {
      // Sort spans in a group by parenthood || priority || text length
      const priorityDiff =
        PRISMIC_ELEMENTS[spanA.type].priority -
        PRISMIC_ELEMENTS[spanB.type].priority
      const textLengthDiff = spanA.text.length - spanB.text.length

      return spanA.isParentOf(spanB)
        ? -1
        : spanB.isParentOf(spanA)
        ? 1
        : priorityDiff || textLengthDiff
    })

    return { elected, others }
  })
}

/**
 * Partition not elected spans into slices inside or outside of the elected span.
 *
 *
 * @param {string} text
 * @param {{elected: SpanNode, others: SpanNode[]}[]} groups
 */
const partitionGroups = (text, groups) => {
  return groups.map(group => {
    const { innerSpans, outerSpans } = group.others.reduce(
      ({ innerSpans, outerSpans }, span) => {
        const { inner, outer } = sliceSpan(text, span, group.elected)

        return {
          innerSpans: innerSpans.concat(inner),
          outerSpans: outer ? outerSpans.concat(outer) : outerSpans
        }
      },
      { innerSpans: [], outerSpans: [] }
    )

    const head = group.elected.setChildren(
      // recursion
      buildTreeAndFill(text, innerSpans, group.elected.boundaries())
    )

    return [head].concat(buildTree(text, outerSpans))
  })
}

/**
 * Slice span into parts inside and outside of the elected span.
 *
 * @param {string} text
 * @param {SpanNode} span
 * @param {SpanNode} elected
 * @returns {{outer: SpanNode| undefined, inner: SpanNode}}
 */
const sliceSpan = (text, span, elected) => {
  return span.start < elected.start
    ? {
        inner: SpanNode.slice(span, elected.start, span.end, text),
        outer: SpanNode.slice(span, span.start, elected.start, text)
      }
    : span.end > elected.end
    ? {
        inner: SpanNode.slice(span, span.start, elected.end, text),
        outer: SpanNode.slice(span, elected.end, span.end, text)
      }
    : { inner: span }
}

/**
 * Fill an array with the spans of a given tree.
 * Adds text outside of the given boundaries as text nodes.
 *
 * @param {string} text
 * @param {SpanNode[]} tree
 * @param {{lower: number, upper: number}} boundaries
 * @returns {(TextNode|SpanNode)[]}
 */
const fill = (text, tree, boundaries) => {
  return tree.reduce((result, span, index) => {
    const previousNode = tree[index - 1]
    const fillStart = 0 === index && span.start > boundaries.lower
    const fillEnd = tree.length - 1 === index && boundaries.upper > span.end

    const sliceStart = fillStart
      ? boundaries.lower
      : previousNode
      ? previousNode.end
      : null

    if (null !== sliceStart) {
      const textNode = new TextNode(
        sliceStart,
        span.start,
        text.slice(sliceStart, span.start)
      )
      result.push(textNode)
    }

    result.push(span)

    if (fillEnd) {
      const textNode = new TextNode(
        span.end,
        boundaries.upper,
        text.slice(span.end, boundaries.upper)
      )
      result.push(textNode)
    }

    return result
  }, [])
}

/**
 * Tree with array of Prismic nodes as children, which are created from rich text.
 */
export class NodeTree {
  constructor(richText) {
    this.richText = richText
    this.children = this._createChildren()
  }

  /**
   * Parse node trees rich text into an array of nodes
   *
   * @returns {*[]}
   * @private
   */
  _createChildren() {
    return this.richText.reduce((children, currentBlock) => {
      const { type } = currentBlock

      if (
        type === PRISMIC_ELEMENTS.embed.type ||
        type === PRISMIC_ELEMENTS.image.type
      )
        return children.concat(new Node(type, currentBlock, []))

      const textNodes = processTextBlock(currentBlock)

      const previousBlock = getLast(children)

      if (type === PRISMIC_ELEMENTS.listItem.type) {
        const listItem = new ListItemBlockNode(currentBlock, textNodes)

        if (previousBlock && previousBlock instanceof ListBlockNode) {
          const updatedPreviousBlock = previousBlock.addChild(listItem)
          return replaceLast(children, updatedPreviousBlock)
        }

        const list = new ListBlockNode(createEmptyList(), [listItem])
        return children.concat(list)
      }

      if (type === PRISMIC_ELEMENTS.oListItem.type) {
        const orderedListItem = new OrderedListItemBlockNode(
          currentBlock,
          textNodes
        )

        if (previousBlock && previousBlock instanceof OrderedListBlockNode) {
          const updatedPreviousBlock = previousBlock.addChild(orderedListItem)
          return replaceLast(children, updatedPreviousBlock)
        }
        const orderedList = new OrderedListBlockNode(createEmptyList(true), [
          orderedListItem
        ])
        return children.concat(orderedList)
      }

      return children.concat(new Node(type, currentBlock, textNodes))
    }, [])
  }
}
