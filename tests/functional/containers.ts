import { GenericContainer } from 'testcontainers'

export const meilisearchContainer = new GenericContainer('getmeili/meilisearch:v1.10')
  .withExposedPorts(7700)
  .withHealthCheck({
    test: ['CMD-SHELL', 'curl -f http://localhost:7700/health || exit 1'],
    interval: 1000,
    timeout: 3000,
    retries: 5,
    startPeriod: 1000,
  })

export default {
  meilisearch: new GenericContainer('getmeili/meilisearch:v1.10')
    .withExposedPorts(7700)
    .withHealthCheck({
      test: ['CMD-SHELL', 'curl -f http://localhost:7700/health || exit 1'],
      interval: 1000,
      timeout: 3000,
      retries: 5,
      startPeriod: 1000,
    }),
  typesense: new GenericContainer('typesense/typesense:27.0')
    .withCommand(['--api-key=superrandomkey', '--data-dir=/tmp'])
    .withExposedPorts(8108)
    .withHealthCheck({
      test: ['CMD-SHELL', `curl -f http://localhost:8108/health || exit 1`],
      interval: 1000,
      timeout: 3000,
      retries: 5,
      startPeriod: 1000,
    }),
}
