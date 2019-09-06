# minimalistic-prismic-dom-parser

Minimalistic prismic dom parser as alternative to prismic-dom
with zero dependencies.

## Prerequisites

Make sure that you use Prismic API v2, otherwise this library will not work for you. Your API endpoint should look like `your-repo-name.prismic.io/api/v2`.

## Installation

```shell script
# Using yarn
$ yarn add --dev @sparwelt/minimalistic-prismic-dom-parser

# Using npm
$ npm i -D @sparwelt/minimalistic-prismic-dom-parser
```

## Usage

### Parse as HTML

```javascript
import { Prismic } from 'prismic-javascript'
import {
  HtmlSerializer,
  RichTextParser
} from '@sparwelt/minimalistic-prismic-dom-parser'

const getHtml = async () => {
  try {
    const documents = await Prismic.api(
      'https://your-repository-name.prismic.io/api'
    )
      .then(api => api.query(''))
      .then(response => response.results)

    return RichTextParser.parseAsHtml(
      documents[0].data.someRichTextElement,
      new HtmlSerializer()
    )
  } catch (err) {
    return `Something went wrong: ${JSON.stringify(err)}`
  }
}

const element = document.createElement('div')
element.innerHTML = getHtml()
```

### Parse as Text

```javascript
import { Prismic } from 'prismic-javascript'
import { RichTextParser } from '@sparwelt/minimalistic-prismic-dom-parser'

const getText = async () => {
  try {
    const documents = await Prismic.api(
      'https://your-repository-name.prismic.io/api'
    )
      .then(api => api.query(''))
      .then(response => response.results)

    return RichTextParser.parseAsText(documents[0].data.someRichTextElement)
  } catch (err) {
    return `Something went wrong: ${JSON.stringify(err)}`
  }
}

const element = document.createElement('div')
element.innerText = getText()
```

## Customisation

### HtmlSerializer

Sometimes you might want to customise the HTML output of the rich text parser. This can be done by passing an options object to the htmlSerializer or even writing a complete custom serializer.

We recommend you to use the HtmlSerializer from this package and pass it the options that suit your needs. You can find a list of all options below.

```javascript
import { HtmlSerializer } from '@sparwelt/minimalistic-prismic-dom-parser/src/html-serializer'

const htmlSerializer = new HtmlSerializer({
  imageCopyrightAttribute: 'title'
})

const html = RichTextParser.parseAsHtml(someRichText, htmlSerializer)
```

Alternatively, when providing your own serializer to the parser, it must at least have a function `serializeNodeTree` that returns an array of strings. It gets passed the parsed node tree as first parameter.

The array of strings returned by `serializeNodeTree` will be concatenated by the parser and returned as string.

```javascript
class CustomHtmlSerializer {
  serializeNodeTree(nodeTree) {
    const step = node => {
      const serializedChildren = node.children.reduce(
        (result, node) => result.concat([step(node)]),
        []
      )

      return `<p>${node.type}${serializedChildren.join('')}</p>`
    }

    return nodeTree.children.map(parentNode => {
      return step(parentNode)
    })
  }
}

const html = RichTextParser.parseAsHtml(
  someRichText,
  new CustomHtmlSerializer()
)
```

### HtmlSerializer Options

| Option                  | Default  | Description                                                           |
| ----------------------- | -------------- | --------------------------------------------------------------------- |
|defaultHyperlinkTarget| _self | Value for hyperlink target attribute used as fallback if no link.target is provided by Prismic |
| imageCopyrightAttribute | data-copyright | Attribute to assign the imageElement.copyright to |
