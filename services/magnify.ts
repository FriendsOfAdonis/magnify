import app from '@adonisjs/core/services/app'
import type { MagnifyService } from '../src/types.js'

let magnify: MagnifyService

await app.booted(async () => {
  magnify = await app.container.make('magnify')
})

export { magnify as default }
