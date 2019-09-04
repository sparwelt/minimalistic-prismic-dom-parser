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
import { RichTextParser } from '@sparwelt/minimalistic-prismic-dom-parser'

const getHtml = async () => {
  try {
    const documents = await Prismic.api(
      'https://your-repository-name.prismic.io/api'
    )
      .then(api => api.query(''))
      .then(response => response.results)

    return RichTextParser.parseAsHtml(documents[0].data.someRichTextElement)
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
