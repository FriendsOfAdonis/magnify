import { test } from '@japa/runner'
import { initializeDatabase } from './app.js'
import { sleep } from '../utils.js'
import { engineTests } from './engine_tests.js'
import app from '@adonisjs/core/services/app'
import containers from './containers.js'
import { TypesenseEngine } from '../../src/engines/typesense.js'
import { StartedTestContainer } from 'testcontainers'
import User from '../fixtures/user.js'
import Import from '../../commands/import.js'

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

  // TODO: Pagination seems inversed and remove does not seem to work properly
  engineTests(() => app, ['removed', 'pagination'])

  // test('can use basic search', async ({ assert }) => {
  //   const { default: User } = await import('../fixtures/user.js')
  //   const results = await User.search('lar').take(10).get()
  //
  //   assertSearchResults(assert, results, [
  //     [1, 'Adonis Larpor'],
  //     [11, 'Larry Casper'],
  //     [12, 'Reta Larkin'],
  //     [20, 'Prof. Larry Prosacco DVM'],
  //     [39, 'Linkwood Larkin'],
  //     [40, 'Otis Larson MD'],
  //     [41, 'Gudrun Larkin'],
  //     [42, 'Dax Larkin'],
  //     [43, 'Dana Larson Sr.'],
  //     [44, 'Amos Larson Sr.'],
  //   ])
  // })
  //
  // test('can search with where', async ({ assert }) => {
  //   const { default: User } = await import('../fixtures/user.js')
  //   const results = await User.search('lar').where('isAdmin', true).take(10).get()
  //
  //   assertSearchResults(assert, results, [
  //     [11, 'Larry Casper'],
  //     [20, 'Prof. Larry Prosacco DVM'],
  //     [39, 'Linkwood Larkin'],
  //   ])
  // })
  //
  // test('can use paginated search', async ({ assert }) => {
  //   const { default: User } = await import('../fixtures/user.js')
  //   const [page1, page2] = [
  //     await User.search('lar').take(10).paginate(5, 1),
  //     await User.search('lar').take(10).paginate(5, 2),
  //   ]
  //
  //   // WARN: It seems that paginated results are reverted??
  //
  //   assertSearchResults(
  //     assert,
  //     [...page1.values()],
  //     [
  //       [40, 'Otis Larson MD'],
  //       [41, 'Gudrun Larkin'],
  //       [42, 'Dax Larkin'],
  //       [43, 'Dana Larson Sr.'],
  //       [44, 'Amos Larson Sr.'],
  //     ]
  //   )
  //
  //   assertSearchResults(
  //     assert,
  //     [...page2.values()],
  //     [
  //       [1, 'Adonis Larpor'],
  //       [11, 'Larry Casper'],
  //       [12, 'Reta Larkin'],
  //       [20, 'Prof. Larry Prosacco DVM'],
  //       [39, 'Linkwood Larkin'],
  //     ]
  //   )
  // })
})
