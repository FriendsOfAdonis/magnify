import Configure from '@adonisjs/core/commands/configure'
import { IgnitorFactory } from '@adonisjs/core/factories'
import { FileSystem } from '@japa/file-system'
import { test } from '@japa/runner'
import { fileURLToPath } from 'node:url'

const BASE_URL = new URL('../tmp/configure/', import.meta.url)

async function configure(fs: FileSystem, choice: number) {
  const ignitor = new IgnitorFactory()
    .withCoreProviders()
    .withCoreConfig()
    .create(BASE_URL, {
      importer: (filePath) => {
        if (filePath.startsWith('./') || filePath.startsWith('../')) {
          return import(new URL(filePath, BASE_URL).href)
        }

        return import(filePath)
      },
    })

  const app = ignitor.createApp('console')
  await app.init()
  await app.boot()

  await fs.create('.env', '')
  await fs.createJson('tsconfig.json', {})
  await fs.create('start/env.ts', `export default Env.create(new URL('./'), {})`)
  await fs.create('adonisrc.ts', `export default defineConfig({})`)

  const ace = await app.container.make('ace')

  ace.prompt.trap('Select the Search engine you want to use').chooseOption(choice)
  ace.prompt
    .trap(
      'Do you want to install additional packages required by "@foadonis/magnify" and the selected search engine?'
    )
    .reject()

  const command = await ace.create(Configure, ['../../../index.js'])
  await command.exec()

  command.assertSucceeded()

  return app
}

test.group('Configuration', (group) => {
  group.each.setup(({ context }) => {
    context.fs.baseUrl = BASE_URL
    context.fs.basePath = fileURLToPath(BASE_URL)
  })

  group.each.disableTimeout()

  test('configure algolia engine', async ({ fs, assert }) => {
    await configure(fs, 0)

    await assert.fileExists('config/magnify.ts')
    await assert.fileContains('config/magnify.ts', 'defineConfig')
    await assert.fileContains('config/magnify.ts', 'algolia')

    await assert.fileExists('adonisrc.ts')
    await assert.fileContains('adonisrc.ts', '@foadonis/magnify/commands')
    await assert.fileContains('adonisrc.ts', '@foadonis/magnify/magnify_provider')

    await assert.fileContains('.env', 'ALGOLIA_APP_ID')
    await assert.fileContains('.env', 'ALGOLIA_API_KEY')
  })

  test('configure meilisearch engine', async ({ fs, assert }) => {
    await configure(fs, 1)

    await assert.fileExists('config/magnify.ts')
    await assert.fileContains('config/magnify.ts', 'defineConfig')
    await assert.fileContains('config/magnify.ts', 'meilisearch')

    await assert.fileExists('adonisrc.ts')
    await assert.fileContains('adonisrc.ts', '@foadonis/magnify/commands')
    await assert.fileContains('adonisrc.ts', '@foadonis/magnify/magnify_provider')

    await assert.fileContains('.env', 'MEILISEARCH_HOST')
  })

  test('configure typesense engine', async ({ fs, assert }) => {
    await configure(fs, 2)

    await assert.fileExists('config/magnify.ts')
    await assert.fileContains('config/magnify.ts', 'defineConfig')
    await assert.fileContains('config/magnify.ts', 'typesense')

    await assert.fileExists('adonisrc.ts')
    await assert.fileContains('adonisrc.ts', '@foadonis/magnify/commands')
    await assert.fileContains('adonisrc.ts', '@foadonis/magnify/magnify_provider')

    await assert.fileContains('.env', 'TYPESENSE_API_KEY')
  })
})
