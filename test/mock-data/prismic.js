export default {
  page: 1,
  results_per_page: 20,
  results_size: 1,
  total_results_size: 1,
  total_pages: 1,
  next_page: null,
  prev_page: null,
  results: [
    {
      id: 'XW4dUhEAACUAD8TE',
      uid: null,
      type: 'provider_page',
      href:
        'https://sparwelttest.cdn.prismic.io/api/v2/documents/search?ref=XW9ZdxEAACgAFV9X&q=%5B%5B%3Ad+%3D+at%28document.id%2C+%22XW4dUhEAACUAD8TE%22%29+%5D%5D',
      tags: [],
      first_publication_date: '2019-09-03T07:59:38+0000',
      last_publication_date: '2019-09-04T06:28:07+0000',
      slugs: ['heading-1', 'this-is-my-body-text'],
      linked_documents: [],
      lang: 'en-us',
      alternate_languages: [],
      data: {
        body1: [
          {
            type: 'paragraph',
            text: 'I am bold',
            spans: [{ start: 0, end: 9, type: 'strong' }]
          },
          {
            type: 'paragraph',
            text: 'I am italic',
            spans: [{ start: 0, end: 11, type: 'em' }]
          },
          {
            type: 'paragraph',
            text: 'I am a link',
            spans: [
              {
                start: 0,
                end: 11,
                type: 'hyperlink',
                data: { link_type: 'Web', url: 'https://sparwelt.de' }
              }
            ]
          },
          { type: 'o-list-item', text: 'ordered', spans: [] },
          { type: 'o-list-item', text: 'list', spans: [] },
          { type: 'list-item', text: 'unordered', spans: [] },
          { type: 'list-item', text: 'list', spans: [] },
          {
            type: 'image',
            url:
              'https://wroomdev.s3.amazonaws.com/tutoblanktemplate%2F97109f41-140e-4dc9-a2c8-96fb10f14051_star.gif',
            alt: "<script>function(){alert('malicious')}</script>",
            copyright: null,
            dimensions: { width: 960, height: 800 }
          },
          {
            type: 'embed',
            oembed: {
              type: 'video',
              embed_url: 'https://www.youtube.com/watch?v=ZWsQBy41KP8',
              title: 'The Tunnel — Charlotte de Witte (DJ-set)',
              provider_name: 'YouTube',
              thumbnail_url: 'https://i.ytimg.com/vi/ZWsQBy41KP8/hqdefault.jpg',
              width: 480,
              height: 270,
              version: '1.0',
              author_name: 'Studio Brussel',
              author_url: 'https://www.youtube.com/user/StuBru',
              provider_url: 'https://www.youtube.com/',
              cache_age: null,
              thumbnail_width: 480,
              thumbnail_height: 360,
              html:
                '<iframe width="480" height="270" src="https://www.youtube.com/embed/ZWsQBy41KP8?feature=oembed" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
            }
          },
          { type: 'preformatted', text: 'preformatted', spans: [] },
          { type: 'heading1', text: 'Heading 1', spans: [] },
          { type: 'heading2', text: 'Heading 2', spans: [] },
          { type: 'heading3', text: 'Heading 3', spans: [] },
          { type: 'heading4', text: 'Heading 4', spans: [] },
          { type: 'heading5', text: 'Heading 5', spans: [] },
          { type: 'heading6', text: 'Heading 6', spans: [] },
          { type: 'paragraph', text: 'This is text', spans: [] },
          {
            type: 'paragraph',
            text: "<script>function(){alert('malicious')}</script>",
            spans: []
          },
          {
            type: 'heading1',
            text: "<script>function(){alert('malicious')}</script>",
            spans: []
          }
        ]
      }
    }
  ],
  version: '58698d4',
  license: 'All Rights Reserved'
}
