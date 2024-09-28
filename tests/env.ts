import { Env } from '@adonisjs/core/env'

export default await Env.create(new URL('../', import.meta.url), {
  ALGOLIA_APP_ID: Env.schema.string(),
  ALGOLIA_API_KEY: Env.schema.string(),
})
