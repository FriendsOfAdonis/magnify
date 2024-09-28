import { test } from '@japa/runner'
import { StartedTestContainer } from 'testcontainers'
import { initializeDatabase } from './app.js'
import SyncIndexSettings from '../../commands/sync_index_settings.js'
import { sleep } from '../utils.js'
import { engineTests } from './engine_tests.js'
import app from '@adonisjs/core/services/app'
import containers from './containers.js'
import { MeilisearchEngine } from '../../src/engines/meilisearch.js'
import User from '../fixtures/user.js'
import Import from '../../commands/import.js'

test.group('Meilisearch', async (group) => {
  let container: StartedTestContainer

  group.setup(async () => {
    User.shouldBeSearchable = false
    container = await containers.meilisearch.start()

    const magnify = await app.container.make('magnify')
    magnify.config = {
      default: 'meilisearch',
      // @ts-ignore
      engines: {
        meilisearch: () =>
          new MeilisearchEngine({
            host: `http://${container.getHost()}:${container.getFirstMappedPort()}`,
            indexSettings: {
              users: {
                filterableAttributes: ['isAdmin'],
                sortableAttributes: ['createdAt'],
              },
            },
          }),
      },
    }

    await initializeDatabase(app)

    User.shouldBeSearchable = true

    const ace = await app.container.make('ace')
    const syncCommand = await ace.create(SyncIndexSettings, [])
    await syncCommand.exec()

    const importCommand = await ace.create(Import, ['../fixtures/user.ts'])
    await importCommand.exec()
    await sleep(1)
  })

  group.teardown(async () => {
    await container.stop()
  })

  engineTests(() => app)
})
