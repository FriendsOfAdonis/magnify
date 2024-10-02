import { test } from '@japa/runner'
import { assertSearchResults } from './utils.js'
import { sleep } from '../utils.js'
import { ApplicationService } from '@adonisjs/core/types'
import Flush from '../../commands/flush.js'

type Test = 'removed' | 'pagination'

export function engineTests(app: () => ApplicationService, skip: Test[] = []) {
  test('can use basic search', async ({ assert }) => {
    const { default: User } = await import('../fixtures/user.js')
    const results = await User.search('lar').latest().take(10).get()

    assertSearchResults(assert, results, [
      [1, 'Adonis Larpor'],
      [11, 'Larry Casper'],
      [12, 'Reta Larkin'],
      [20, 'Prof. Larry Prosacco DVM'],
      [39, 'Linkwood Larkin'],
      [40, 'Otis Larson MD'],
      [41, 'Gudrun Larkin'],
      [42, 'Dax Larkin'],
      [43, 'Dana Larson Sr.'],
      [44, 'Amos Larson Sr.'],
    ])
  })

  test('can search with where', async ({ assert }) => {
    const { default: User } = await import('../fixtures/user.js')
    const results = await User.search('lar').latest().where('isAdmin', true).take(10).get()

    assertSearchResults(assert, results, [
      [11, 'Larry Casper'],
      [20, 'Prof. Larry Prosacco DVM'],
      [39, 'Linkwood Larkin'],
    ])
  })

  if (!skip.includes('pagination')) {
    test('can use paginated search', async ({ assert }) => {
      const { default: User } = await import('../fixtures/user.js')
      const [page1, page2] = [
        await User.search('lar').take(10).latest().paginate(5, 1),
        await User.search('lar').take(10).latest().paginate(5, 2),
      ]

      assertSearchResults(
        assert,
        [...page1.values()],
        [
          [1, 'Adonis Larpor'],
          [11, 'Larry Casper'],
          [12, 'Reta Larkin'],
          [39, 'Linkwood Larkin'],
          [40, 'Otis Larson MD'],
        ]
      )

      assertSearchResults(
        assert,
        [...page2.values()],
        [
          [20, 'Prof. Larry Prosacco DVM'],
          [41, 'Gudrun Larkin'],
          [42, 'Dax Larkin'],
          [43, 'Dana Larson Sr.'],
          [44, 'Amos Larson Sr.'],
        ]
      )
    })
  }

  if (!skip.includes('removed')) {
    test('document is removed when model is removed', async ({ assert }) => {
      const { default: User } = await import('../fixtures/user.js')
      let results = await User.search('Gudrun Larkin').take(1).get()
      let result = results[0]

      assert.equal(result.name, 'Gudrun Larkin')

      await result.delete()

      results = await User.search('Gudrun Larkin').take(1).get()
      result = results[0]

      assert.isUndefined(result)
    })
  }

  test('document is updated when model is updated', async ({ assert }) => {
    const { default: User } = await import('../fixtures/user.js')
    let results = await User.search('Dax Larkin').take(1).get()
    let result = results[0]

    assert.equal(result.name, 'Dax Larkin')

    result.name = 'Dax Larkin Updated'
    await result.save()

    results = await User.search('Dax Larkin Updated').take(1).get()
    result = results[0]

    assert.equal(result.name, 'Dax Larkin Updated')
  })

  test('document is added when model is created', async ({ assert }) => {
    const { default: User } = await import('../fixtures/user.js')
    let results = await User.search('New User').take(1).get()
    let result = results[0]

    assert.isUndefined(result)

    await User.create({
      name: 'New User',
    })

    await sleep(2)

    results = await User.search('New User').take(1).get()
    result = results[0]

    assert.equal(result.name, 'New User')
  }).timeout(10000)

  test('flush properly remove all documents', async ({ assert }) => {
    const { default: User } = await import('../fixtures/user.js')
    const ace = await app().container.make('ace')
    const command = await ace.create(Flush, ['../fixtures/user.js'])
    await command.exec()
    command.assertSucceeded()

    // We wait for the documents to be successfully flushed by the engine
    await sleep(2)

    const results = await User.search('').get()
    assert.lengthOf(results, 0)
  }).timeout(10000)
}
