import { NODE_TYPES } from './types'

export class Node {
  constructor(type, element, children) {
    this.type = type
    this.element = element
    this.children = children
  }
}

export class SpanNode extends Node {
  constructor(start, end, type, text, children, element) {
    super(type, element, children)
    this.start = start
    this.end = end
    this.text = text
    this.children = children
  }

  boundaries() {
    return {
      lower: this.start,
      upper: this.end
    }
  }

  isParentOf(node) {
    return this.start <= node.start && this.end >= node.end
  }

  setChildren(children) {
    return new SpanNode(
      this.start,
      this.end,
      this.type,
      this.text,
      children,
      this.element
    )
  }

  static slice(node, start, end, text) {
    return new SpanNode(
      start,
      end,
      node.type,
      text.slice(start, end),
      node.children,
      node.element
    )
  }
}

export class TextNode extends SpanNode {
  constructor(start, end, text) {
    const { type } = NODE_TYPES.span
    const element = {
      type,
      start,
      end,
      text
    }

    super(start, end, type, text, [], element)
  }
}

export class ListItemBlockNode extends Node {
  constructor(block, children = []) {
    super(NODE_TYPES.listItem.type, block, children)
  }
}

export class OrderedListItemBlockNode extends Node {
  constructor(block, children = []) {
    super(NODE_TYPES.oListItem.type, block, children)
  }
}

export class ListBlockNode extends Node {
  constructor(block, children = []) {
    super(NODE_TYPES.list.type, block, children)
  }

  addChild(node) {
    return new ListBlockNode(this.element, this.children.concat(node))
  }
}

export class OrderedListBlockNode extends Node {
  constructor(block, children = []) {
    super(NODE_TYPES.oList.type, block, children)
  }

  addChild(node) {
    return new OrderedListBlockNode(this.element, this.children.concat(node))
  }
}
