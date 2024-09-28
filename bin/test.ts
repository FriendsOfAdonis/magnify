import 'reflect-metadata'
import { assert } from '@japa/assert'
import { expectTypeOf } from '@japa/expect-type'
import { processCLIArgs, configure, run } from '@japa/runner'
import { createApp } from '../tests/integration/app.js'
import { fileSystem } from '@japa/file-system'
import app from '@adonisjs/core/services/app'
import { ApplicationService } from '@adonisjs/core/types'

let testApp: ApplicationService
processCLIArgs(process.argv.slice(2))
configure({
  suites: [
    {
      name: 'units',
      files: ['tests/units/**/*.spec.(js|ts)'],
    },
    {
      name: 'integration',
      files: ['tests/integration/**/*.spec.(js|ts)'],
    },
    {
      name: 'functional',
      files: ['tests/functional/**/*.spec.(js|ts)'],
    },
  ],
  plugins: [assert(), expectTypeOf(), fileSystem()],
  setup: [
    async () => {
      testApp = await createApp()
    },
  ],
  teardown: [
    async () => {
      await app.terminate()
      await testApp.terminate()
    },
  ],
})

/*
|--------------------------------------------------------------------------
| Run tests
|--------------------------------------------------------------------------
|
| The following "run" method is required to execute all the tests.
|
*/
run()
