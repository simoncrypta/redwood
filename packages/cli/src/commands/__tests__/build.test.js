jest.mock('execa', () => jest.fn((cmd) => cmd))

let mockedRedwoodConfig = {
  api: {},
  web: {},
  browser: {},
}

jest.mock('src/lib', () => {
  return {
    ...jest.requireActual('src/lib'),
    runCommandTask: jest.fn((commands) => {
      return commands.map(({ cmd, args }) => `${cmd} ${args?.join(' ')}`)
    }),
    getPaths: () => ({
      base: './',
      api: {
        dbSchema: '../../__fixtures__/example-todo-main/api/prisma',
      },
      web: {},
    }),
    getConfig: () => {
      return mockedRedwoodConfig
    },
  }
})

// let mockDetectPrerenderRoutes = jest.fn(() => [])
let mockedPrerenderRoutes = ['Pretend', 'Some', 'Routes', 'Are', 'There']
// For the prerender tests
jest.mock('@redwoodjs/prerender', () => {
  return { detectPrerenderRoutes: () => mockedPrerenderRoutes }
})

import execa from 'execa'

import { runCommandTask } from 'src/lib'

import { handler } from '../build'

afterEach(() => {
  jest.clearAllMocks()
})

test('Should clean web dist directory, before build', async () => {
  await handler({})
  expect(execa.mock.results[0].value).toEqual(`rimraf dist/*`)
})

test('The build command runs the correct commands.', async () => {
  await handler({})

  // Prisma command is inserted differently
  expect(runCommandTask.mock.results[0].value[0]).toEqual(
    'yarn prisma generate --schema="../../__fixtures__/example-todo-main/api/prisma"'
  )

  expect(execa.mock.results[1].value).toEqual(
    `yarn cross-env NODE_ENV=production babel src --out-dir dist --delete-dir-on-start --extensions .ts,.js --ignore '**/*.test.ts,**/*.test.js,**/__tests__'`
  )

  expect(execa.mock.results[2].value).toEqual(
    `yarn cross-env NODE_ENV=production webpack --config ../node_modules/@redwoodjs/core/config/webpack.production.js`
  )
})

test('Should run prerender for web, when experimental flag is on', async () => {
  mockedRedwoodConfig = {
    web: {
      experimentalPrerender: true,
    },
  }

  // Prerender is true by default, when experimentalPrerender flag is enabled
  await handler({ side: ['web'], prerender: true })

  expect(execa.mock.results[1].value).toEqual(
    'yarn cross-env NODE_ENV=production webpack --config ../node_modules/@redwoodjs/core/config/webpack.production.js'
  )

  expect(execa.mock.results[2].value).toEqual('yarn rw prerender')
})

test('Should skip prerender if no prerender routes detection', async () => {
  mockedRedwoodConfig = {
    web: {
      experimentalPrerender: true,
    },
  }

  mockedPrerenderRoutes = []

  // Prerender is true by default, when experimentalPrerender flag is enabled
  await handler({ side: ['web'], prerender: true })

  expect(execa.mock.results[2]).toBeFalsy()
})
