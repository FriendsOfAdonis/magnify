import { RuntimeException } from '@adonisjs/core/exceptions'
import { ManagerEngineFactory } from './types.js'
import { MagnifyEngine } from './engines/main.js'

export class MagnifyManager<KnownEngines extends Record<string, ManagerEngineFactory>> {
  #cachedEngines: Partial<Record<keyof KnownEngines, MagnifyEngine>> = {}

  constructor(public config: { default?: keyof KnownEngines; engines: KnownEngines }) {}

  /**
   * Use one of the registered engines.
   *
   * ```ts
   * manager.use() // returns default engine
   * manager.use('meilisearch')
   * ```
   */
  engine<EngineName extends keyof KnownEngines>(engine?: EngineName): MagnifyEngine {
    const engineToUse = engine || this.config.default

    if (!engineToUse) {
      throw new RuntimeException(
        'Cannot create engine instance. No default engine is defined in the config.'
      )
    }

    const cachedEngine = this.#cachedEngines[engineToUse]
    if (cachedEngine) {
      return cachedEngine
    }

    return this.config.engines[engineToUse]()
  }
}
