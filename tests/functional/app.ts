import { IgnitorFactory } from '@adonisjs/core/factories'
import { defineConfig as defineLucidConfig } from '@adonisjs/lucid'
import { ApplicationService } from '@adonisjs/core/types'
import { copyFile, mkdir } from 'node:fs/promises'
import { defineConfig } from '../../src/define_config.js'
import { FakeEngine } from '../fixtures/fake_engine.js'

const APP_ROOT = new URL('../tmp/', import.meta.url)

const IMPORTER = (filePath: string) => {
  if (filePath.startsWith('./') || filePath.startsWith('../')) {
    return import(new URL(filePath, APP_ROOT).href)
  }
  return import(filePath)
}

export async function createApp() {
  const testApp = new IgnitorFactory()
    .merge({
      rcFileContents: {
        commands: [() => import('@adonisjs/lucid/commands')],
        providers: [
          () => import('@adonisjs/lucid/database_provider'),
          () => import('../../providers/magnify_provider.js'),
        ],
      },
      config: {
        magnify: defineConfig({
          default: 'empty',
          engines: {
            empty: () => new FakeEngine(),
          },
        }),
        database: defineLucidConfig({
          connection: 'sqlite',
          connections: {
            sqlite: {
              client: 'better-sqlite3',
              connection: {
                filename: new URL('./db.sqlite', APP_ROOT).pathname,
              },
            },
          },
        }),
      },
    })
    .withCoreConfig()
    .withCoreProviders()
    .create(APP_ROOT, {
      importer: IMPORTER,
    })
    .tap((app) => {
      app.booting(async () => {})
      app.starting(async () => {})
      app.listen('SIGTERM', () => app.terminate())
      app.listenIf(app.managedByPm2, 'SIGINT', () => app.terminate())
    })
    .createApp('console')

  await testApp.init()
  await testApp.boot()

  await mkdir(testApp.migrationsPath(), { recursive: true })

  await copyFile(
    new URL('../fixtures/migrations/create_users_table.ts', import.meta.url),
    testApp.migrationsPath('create_users_table.ts')
  )
}

export async function initializeDatabase(app: ApplicationService) {
  const ace = await app.container.make('ace')
  await ace.exec('migration:fresh', [])
  await seedDatabase()
}

async function seedDatabase() {
  const { default: User } = await import('../fixtures/user.js')
  function* collection() {
    yield { name: 'Adonis Larpor' }

    for (const key of Array(9).keys()) {
      yield { name: `Example ${key + 2}` }
    }

    yield { name: `Larry Casper`, isAdmin: true }
    yield { name: `Reta Larkin` }

    for (const key of Array(7).keys()) {
      yield { name: `Example ${key + 14}` }
    }

    yield { name: 'Prof. Larry Prosacco DVM', isAdmin: true }

    for (const key of Array(18).keys()) {
      yield { name: `Example ${key + 22}` }
    }

    yield { name: 'Linkwood Larkin', isAdmin: true }
    yield { name: 'Otis Larson MD' }
    yield { name: 'Gudrun Larkin' }
    yield { name: 'Dax Larkin' }
    yield { name: 'Dana Larson Sr.' }
    yield { name: 'Amos Larson Sr.' }
  }

  // for (let i = 0; i < 44; i++) {
  const toCreate = [...collection()]
  await User.createMany(toCreate)
  // }
}
