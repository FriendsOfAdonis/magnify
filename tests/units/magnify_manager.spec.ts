import { test } from '@japa/runner'
import { MagnifyManager } from '../../src/magnify_manager.js'
import { MeilisearchEngine } from '../../src/engines/meilisearch.js'
import { MagnifyEngine } from '../../src/engines/main.js'
import { TypesenseEngine } from '../../src/engines/typesense.js'
import { AlgoliaEngine } from '../../src/engines/algolia.js'
import { MeiliSearch } from 'meilisearch'
import { Client } from 'typesense'

test.group('Magnify manager', () => {
  test('create engine instance from the manager', ({ assert, expectTypeOf }) => {
    const manager = new MagnifyManager({
      default: 'meilisearch',
      engines: {
        meilisearch: () =>
          new MeilisearchEngine({
            host: 'http://localhost',
          }),
        algolia: () =>
          new AlgoliaEngine({
            apiKey: 'TESTEST',
            appId: 'TESTEST',
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
      .toEqualTypeOf<'meilisearch' | 'typesense' | 'algolia' | undefined>()

    expectTypeOf(manager.engine('meilisearch')).toEqualTypeOf<MagnifyEngine>()
    expectTypeOf(manager.engine('algolia')).toEqualTypeOf<MagnifyEngine>()
    expectTypeOf(manager.engine('typesense')).toEqualTypeOf<MagnifyEngine>()

    assert.instanceOf(manager.engine('meilisearch'), MeilisearchEngine)
    assert.instanceOf(manager.engine('algolia'), AlgoliaEngine)
    assert.instanceOf(manager.engine('typesense'), TypesenseEngine)
  })

  test('get the client from an engine', ({ assert }) => {
    const manager = new MagnifyManager({
      default: 'meilisearch',
      engines: {
        meilisearch: () =>
          new MeilisearchEngine({
            host: 'http://localhost',
          }),
        algolia: () =>
          new AlgoliaEngine({
            apiKey: 'TESTEST',
            appId: 'TESTEST',
          }),
        typesense: () =>
          new TypesenseEngine({
            nodes: [{ url: 'http://localhost' }],
            collectionSettings: {},
            apiKey: '',
          }),
      },
    })

    assert.instanceOf(manager.engine('meilisearch').client, MeiliSearch)
    // assert.instanceOf(manager.engine('algolia').client, Algoliasearch) // algolia exports a type and not a class
    assert.instanceOf(manager.engine('typesense').client, Client)
  })
})
