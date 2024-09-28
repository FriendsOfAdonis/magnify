import 'reflect-metadata'
import { assert } from '@japa/assert'
import { expectTypeOf } from '@japa/expect-type'
import { processCLIArgs, configure, run } from '@japa/runner'
import { createApp } from '../tests/functional/app.js'
import { fileSystem } from '@japa/file-system'
import app from '@adonisjs/core/services/app'

processCLIArgs(process.argv.slice(2))
configure({
  suites: [
    {
      name: 'units',
      files: ['tests/units/**/*.spec.(js|ts)'],
    },
    {
      name: 'functional',
      files: ['tests/functional/**/*.spec.(js|ts)'],
    },
  ],
  plugins: [assert(), expectTypeOf(), fileSystem()],
  setup: [
    async () => {
      await createApp()
    },
  ],
  teardown: [
    async () => {
      await app.terminate()
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
