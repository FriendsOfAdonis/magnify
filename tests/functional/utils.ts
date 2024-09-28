import { Assert } from '@japa/assert'

export function assertSearchResults(assert: Assert, results: any[], expected: [number, string][]) {
  assert.lengthOf(results, expected.length)
  for (const [index, result] of results.entries()) {
    assert.equal(result.id, expected[index][0])
    assert.equal(result.name, expected[index][1])
  }
}
