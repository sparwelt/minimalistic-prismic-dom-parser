import { RichTextParser } from '../../src/rich-text-parser'
import prismicMockData from '../mock-data/prismic'

describe('RichTextParser', function() {
  const mock = prismicMockData.results[0].data.body1
  const { parseAsHtml, parseAsText } = RichTextParser

  describe('parseAsHtml()', function() {
    let parsedHtml = parseAsHtml(mock)

    it('should parse bold text correctly', function() {
      expect(parsedHtml).toContain('<p><strong>I am bold</strong></p>')
    })

    it('should parse italic text correctly', function() {
      expect(parsedHtml).toContain('<p><em>I am italic</em></p>')
    })

    it('should parse links correctly', function() {
      expect(parsedHtml).toContain(
        '<p><a href="https:&#x2F;&#x2F;sparwelt.de">I am a link</a></p>'
      )
    })

    it('should parse ordered lists correctly', function() {
      expect(parsedHtml).toContain('<ol><li>ordered</li><li>list</li></ol>')
    })

    it('should parse unordered lists correctly', function() {
      expect(parsedHtml).toContain('<ul><li>unordered</li><li>list</li></ul>')
    })

    it('should parse images correctly', function() {
      expect(parsedHtml).toContain(
        '<p><img src="https:&#x2F;&#x2F;wroomdev.s3.amazonaws.com&#x2F;tutoblanktemplate%2F97109f41-140e-4dc9-a2c8-96fb10f14051_star.gif" alt="&lt;script&gt;function(){alert(&#x27;malicious&#x27;)}&lt;&#x2F;script&gt;" data-copyright=""></p>'
      )
    })

    it('should parse embedded content correctly', function() {
      expect(parsedHtml)
        .toContain(`<div data-oembed="https:&#x2F;&#x2F;www.youtube.com&#x2F;watch?v=ZWsQBy41KP8"
          data-oembed-type="video"
          data-oembed-provider="YouTube"
        >
          <iframe width="480" height="270" src="https://www.youtube.com/embed/ZWsQBy41KP8?feature=oembed" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        </div>`)
    })

    it('should parse pre correctly', function() {
      expect(parsedHtml).toContain('<pre>preformatted</pre>')
    })

    it('should parse heading1 correctly', function() {
      expect(parsedHtml).toContain('<h1>Heading 1</h1>')
    })

    it('should parse heading2 correctly', function() {
      expect(parsedHtml).toContain('<h2>Heading 2</h2>')
    })

    it('should parse heading3 correctly', function() {
      expect(parsedHtml).toContain('<h3>Heading 3</h3>')
    })

    it('should parse heading4 correctly', function() {
      expect(parsedHtml).toContain('<h4>Heading 4</h4>')
    })

    it('should parse heading5 correctly', function() {
      expect(parsedHtml).toContain('<h5>Heading 5</h5>')
    })

    it('should parse heading6 correctly', function() {
      expect(parsedHtml).toContain('<h6>Heading 6</h6>')
    })

    it('should parse text correctly', function() {
      expect(parsedHtml).toContain('<p>This is text</p>')
    })

    it('should escape malicious content correctly', function() {
      expect(parsedHtml).toContain(
        '<p>&lt;script&gt;function(){alert(&#x27;malicious&#x27;)}&lt;&#x2F;script&gt;</p>'
      )
      expect(parsedHtml).toContain(
        '<h1>&lt;script&gt;function(){alert(&#x27;malicious&#x27;)}&lt;&#x2F;script&gt;</h1>'
      )
    })
  })

  describe('parseAsText()', function() {
    it('should match the PrismicDOM.RichText.asText() parsing result', function() {
      expect(parseAsText(mock)).toContain('I am bold I am italic')
    })
  })
})
