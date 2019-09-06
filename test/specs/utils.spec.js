import { escapeHtml } from '../../src/utils/escape-html'
import { flatten } from '../../src/utils/flatten'
import { getLast } from '../../src/utils/get-last'
import { replaceLast } from '../../src/utils/replace-last'

describe('utils', function() {
  describe('escapeHtml()', function() {
    it('should replace characters with HTML entities', function() {
      expect(escapeHtml('&<>"\'/')).toBe('&amp;&lt;&gt;&quot;&#x27;&#x2F;')
    })

    it('should escape all blacklisted special characters', function() {
      expect(escapeHtml('<p>Hello<p>')).toBe('&lt;p&gt;Hello&lt;p&gt;')
    })
  })

  describe('flatten()', function() {
    it('should create one dimensional array', function() {
      expect(flatten([1, [[2], [[3, [4]]]]])).toEqual([1, 2, 3, 4])
    })
  })

  describe('getLast()', function() {
    it('should return last element of array', function() {
      expect(getLast([1, 2, 3])).toBe(3)
    })

    it('should be undefined when array is empty', function() {
      expect(getLast([])).toBeUndefined()
    })
  })

  describe('replaceLast()', function() {
    it('should replace the last element', function() {
      expect(replaceLast([1, 2], 3)).toEqual([1, 3])
    })

    it('should insert the element if the array is empty', function() {
      expect(replaceLast([], 1)).toEqual([1])
    })
  })
})
