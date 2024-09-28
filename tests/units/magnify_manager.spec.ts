import { test } from '@japa/runner'
import { MagnifyManager } from '../../src/magnify_manager.js'
import { MeilisearchEngine } from '../../src/engines/meilisearch.js'
import { MagnifyEngine } from '../../src/engines/main.js'
import { TypesenseEngine } from '../../src/engines/typesense.js'
test.group('Magnify manager', () => {
  test('create engine instance from the manager', ({ assert, expectTypeOf }) => {
    const manager = new MagnifyManager({
      default: 'meilisearch',
      engines: {
        meilisearch: () =>
          new MeilisearchEngine({
            host: 'http://localhost',
          }),
        typesense: () =>
          new TypesenseEngine({
            nodes: [{ url: 'http://localhost' }],
            collectionSettings: {},
            apiKey: '',
          }),
      },
    })

    expectTypeOf(manager.engine)
      .parameter(0)
      .toEqualTypeOf<'meilisearch' | 'typesense' | undefined>()

    expectTypeOf(manager.engine('meilisearch')).toEqualTypeOf<MagnifyEngine>()
    // expectTypeOf(manager.engine('algolia')).toEqualTypeOf<MagnifyEngineContract>()
    expectTypeOf(manager.engine('typesense')).toEqualTypeOf<MagnifyEngine>()

    assert.instanceOf(manager.engine('meilisearch'), MeilisearchEngine)
    // assert.instanceOf(manager.engine('algolia'), AlgoliaEngine)
    assert.instanceOf(manager.engine('typesense'), TypesenseEngine)
  })
})
