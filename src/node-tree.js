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
} from './utils/nodes'
import { replaceLast } from './utils/replace-last'
import { NODE_TYPES } from './utils/types'

/**
 * Creates an empty list.
 *
 * @param ordered Determines if the list is ordered
 * @returns {{spans: [], text: string, type: (*)}}
 */
const createEmptyList = (ordered = false) => ({
  type: ordered ? NODE_TYPES.oList.type : NODE_TYPES.list.type,
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
  const spanNodes = textBlock.spans.map(span => {
    const text = textBlock.text.slice(span.start, span.end)
    return new SpanNode(span.start, span.end, span.type, text, [], span)
  })

  return buildTreeAndFill(textBlock.text, spanNodes, boundaries)

  function buildTreeAndFill(text, spanNodes, boundaries) {
    if (spanNodes.length) {
      const tree = buildTree(text, spanNodes)
      return fill(text, tree, boundaries)
    }

    const subtext = text.slice(boundaries.lower, boundaries.upper)
    return [new TextNode(boundaries.lower, boundaries.upper, subtext)]
  }

  function buildTree(text, spanNodes) {
    const sortedSpanNodes = spanNodes.sort(
      (a, b) => a.start - b.start || a.end - b.end
    )
    const groupedSpanNodes = groupSpanNodes(sortedSpanNodes)
    const postElection = createElection(groupedSpanNodes)
    const partitionedGroups = partitionGroups(text, postElection)
    const flattenedGroups = flatten(partitionedGroups)

    return flattenedGroups.sort((nodeA, nodeB) => nodeA.start - nodeB.start)
  }

  /**
   * Group together span nodes that style the same part of the text.
   *
   * @param {SpanNode[]} spanNodes
   * @returns {SpanNode[][]}
   */
  function groupSpanNodes(spanNodes) {
    if (!spanNodes.length) return []

    let currentNode = spanNodes[0]
    let currentGroup = [currentNode]
    const groupedTextNodes = [currentGroup]

    for (let i = 1; i < spanNodes.length; i++) {
      const previousNode = currentNode
      currentNode = spanNodes[i]

      currentGroup.some(node => node.isParentOf(currentNode)) ||
      previousNode.end >= currentNode.start
        ? currentGroup.push(currentNode)
        : groupedTextNodes.push((currentGroup = [currentNode]))
    }

    return groupedTextNodes
  }

  /**
   * Elect the span node with the highest priority per group.
   *
   * @param {SpanNode[][]} groups
   * @returns {{elected: SpanNode, others: SpanNode[]}[]}
   */
  function createElection(groups) {
    return groups.map(group => {
      if (!group.length) throw new Error('Unable to elect node on empty list')

      const [elected, ...others] = group.sort((nodeA, nodeB) => {
        // Sort span nodes in a group by parenthood || priority || text length
        const priorityDiff =
          NODE_TYPES[nodeA.type].priority - NODE_TYPES[nodeB.type].priority
        const textLengthDiff = nodeA.text.length - nodeB.text.length

        return nodeA.isParentOf(nodeB)
          ? -1
          : nodeB.isParentOf(nodeA)
          ? 1
          : priorityDiff || textLengthDiff
      })

      return { elected, others }
    })
  }

  /**
   * Partition nodes not elected into slices inside the elected span node and
   * slices outside the elected span node
   *
   * @param {string} text
   * @param {{elected: SpanNode, others: SpanNode[]}[]} groups
   */
  function partitionGroups(text, groups) {
    return groups.map(group => {
      const { innerNodes, outerNodes } = group.others.reduce(
        ({ innerNodes, outerNodes }, spanNode) => {
          const { inner, outer } = sliceNode(text, spanNode, group.elected)

          return {
            innerNodes: innerNodes.concat(inner),
            outerNodes: outer ? outerNodes.concat(outer) : outerNodes
          }
        },
        { innerNodes: [], outerNodes: [] }
      )

      const head = group.elected.setChildren(
        // recursion
        buildTreeAndFill(text, innerNodes, group.elected.boundaries())
      )

      return [head].concat(buildTree(text, outerNodes))
    })
  }

  /**
   * Slice span node into inner and outer part, if it exceeds the elected span node.
   * If the span node is inherited completely by the elected,
   * the whole node is returned as inner slice.
   *
   * @param {string} text
   * @param {SpanNode} spanNode
   * @param {SpanNode} elected
   * @returns {{outer: SpanNode| undefined, inner: SpanNode}}
   */
  function sliceNode(text, spanNode, elected) {
    return spanNode.start < elected.start
      ? {
          inner: SpanNode.slice(spanNode, elected.start, spanNode.end, text),
          outer: SpanNode.slice(spanNode, spanNode.start, elected.start, text)
        }
      : spanNode.end > elected.end
      ? {
          inner: SpanNode.slice(spanNode, spanNode.start, elected.end, text),
          outer: SpanNode.slice(spanNode, elected.end, spanNode.end, text)
        }
      : { inner: spanNode }
  }

  /**
   * Fill an array with the span nodes of a given tree.
   * Adds text outside of the given boundaries as text nodes.
   *
   * @param {string} text
   * @param {SpanNode[]} tree
   * @param {{lower: number, upper: number}} boundaries
   * @returns {(TextNode|SpanNode)[]}
   */
  function fill(text, tree, boundaries) {
    return tree.reduce((result, spanNode, index) => {
      const previousNode = tree[index - 1]
      const fillStart = 0 === index && spanNode.start > boundaries.lower
      const fillEnd =
        tree.length - 1 === index && boundaries.upper > spanNode.end

      const sliceStart = fillStart
        ? boundaries.lower
        : previousNode
        ? previousNode.end
        : null

      if (null !== sliceStart) {
        const textNode = new TextNode(
          sliceStart,
          spanNode.start,
          text.slice(sliceStart, spanNode.start)
        )
        result.push(textNode)
      }

      result.push(spanNode)

      if (fillEnd) {
        const textNode = new TextNode(
          spanNode.end,
          boundaries.upper,
          text.slice(spanNode.end, boundaries.upper)
        )
        result.push(textNode)
      }

      return result
    }, [])
  }
}

/**
 * Tree with array of Prismic nodes as children, which are created from rich text.
 */
export class NodeTree {
  constructor(richText) {
    this.children = richText.reduce((children, currentBlock) => {
      const { type } = currentBlock

      if (type === NODE_TYPES.embed.type || type === NODE_TYPES.image.type)
        return children.concat(new Node(type, currentBlock, []))

      const textNodes = processTextBlock(currentBlock)

      const previousBlock = getLast(children)

      if (type === NODE_TYPES.listItem.type) {
        const listItem = new ListItemBlockNode(currentBlock, textNodes)

        if (previousBlock && previousBlock instanceof ListBlockNode) {
          const updatedPreviousBlock = previousBlock.addChild(listItem)
          return replaceLast(children, updatedPreviousBlock)
        }

        const list = new ListBlockNode(createEmptyList(), [listItem])
        return children.concat(list)
      }

      if (type === NODE_TYPES.oListItem.type) {
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
