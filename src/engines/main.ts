import { SimplePaginator } from '@adonisjs/lucid/database'
import { Builder } from '../builder.js'
import { SearchableModel, SearchableRow } from '../types.js'

export abstract class MagnifyEngine {
  /**
   * Update the given models in the index.
   */
  abstract update(...models: SearchableRow[]): Promise<void>

  /**
   * Remove the given models in the index.
   */
  abstract delete(...models: SearchableRow[]): Promise<void>

  /**
   * Perform the given search on the engine.
   */
  abstract search(builder: Builder): Promise<any>

  /**
   * Map the given results to instances of the given model.
   */
  abstract map(builder: Builder, results: any): Promise<any[]>

  /**
   * Perform the given search on the engine.
   */
  abstract paginate(builder: Builder, perPage: number, page: number): Promise<SimplePaginator>

  /**
   * Flush all of the model's records from the engine.
   */
  abstract flush(model: SearchableModel): Promise<void>

  /**
   * Synchronize index's settings.
   */
  syncIndexSettings?(): Promise<void>

  /**
   * Get the results of the given query mapped onto models.
   */
  async get(builder: Builder): Promise<any[]> {
    return this.map(builder, await this.search(builder))
  }
}
