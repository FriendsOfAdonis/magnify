import { test } from '@japa/runner'
import { initializeDatabase } from './app.js'
import { sleep } from '../utils.js'
import app from '@adonisjs/core/services/app'
import containers from './containers.js'
import { TypesenseEngine } from '../../src/engines/typesense.js'
import { StartedTestContainer } from 'testcontainers'
import User from '../fixtures/user.js'
import Import from '../../commands/import.js'
import { assertSearchResults } from './utils.js'
import Flush from '../../commands/flush.js'

test.group('Typesense', (group) => {
  let container: StartedTestContainer
  group.setup(async () => {
    User.shouldBeSearchable = false

    container = await containers.typesense.start()

    const magnify = await app.container.make('magnify')
    magnify.config = {
      default: 'typesense',
      // @ts-ignore
      engines: {
        typesense: () =>
          new TypesenseEngine({
            apiKey: 'superrandomkey',
            nodes: [{ url: `http://${container.getHost()}:${container.getFirstMappedPort()}` }],
            collectionSettings: {
              users: {
                queryBy: ['name'],
                fields: [
                  {
                    name: 'name',
                    type: 'string',
                  },
                  {
                    name: 'isAdmin',
                    type: 'bool',
                    optional: true,
                  },
                  {
                    name: 'updatedAt',
                    type: 'string',
                  },
                  {
                    name: 'createdAt',
                    type: 'int32',
                  },
                ],
              },
            },
          }),
      },
    }

    await sleep(5)

    await initializeDatabase(app)

    User.shouldBeSearchable = true

    const ace = await app.container.make('ace')

    const importCommand = await ace.create(Import, ['../fixtures/user.ts'])
    await importCommand.exec()
    await sleep(1)
  })

  group.teardown(async () => {
    await container.stop()
  })

  group.each.timeout(30000)

  test('can use basic search', async ({ assert }) => {
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
    const results = await User.search('lar').latest().where('isAdmin', true).take(10).get()

    assertSearchResults(assert, results, [
      [11, 'Larry Casper'],
      [20, 'Prof. Larry Prosacco DVM'],
      [39, 'Linkwood Larkin'],
    ])
  })

  test('can use paginated search', async ({ assert }) => {
    const [page1, page2] = [
      await User.search('lar').take(10).latest().paginate(5, 1),
      await User.search('lar').take(10).latest().paginate(5, 2),
    ]

    assertSearchResults(
      assert,
      [...page2.values()],
      [
        [1, 'Adonis Larpor'],
        [11, 'Larry Casper'],
        [12, 'Reta Larkin'],
        [20, 'Prof. Larry Prosacco DVM'],
        [39, 'Linkwood Larkin'],
      ]
    )

    assertSearchResults(
      assert,
      [...page1.values()],
      [
        [40, 'Otis Larson MD'],
        [41, 'Gudrun Larkin'],
        [42, 'Dax Larkin'],
        [43, 'Dana Larson Sr.'],
        [44, 'Amos Larson Sr.'],
      ]
    )
  })

  // WARN: Typesense seems to take a lot of time removing a record
  // test('document is removed when model is removed', async ({ assert }) => {
  //   let results = await User.search('Gudrun Larkin').take(1).get()
  //   let result = results[0]
  //
  //   assert.equal(result.name, 'Gudrun Larkin')
  //
  //   await result.delete()
  //
  //   results = await User.search('Gudrun Larkin').take(1).get()
  //   result = results[0]
  //
  //   assert.isUndefined(result)
  // })

  test('document is updated when model is updated', async ({ assert }) => {
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
  })

  test('flush properly remove all documents', async ({ assert }) => {
    const ace = await app.container.make('ace')
    const command = await ace.create(Flush, ['../fixtures/user.js'])
    await command.exec()
    command.assertSucceeded()

    // We wait for the documents to be successfuly flushed by the engine
    await sleep(2)

    const results = await User.search('').get()
    assert.lengthOf(results, 0)
  })
})
