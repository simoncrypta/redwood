import { detectPrerenderRoutes } from '../router'

jest.mock('@redwoodjs/internal', () => {
  return {
    getPaths: jest.fn(() => {
      return {
        base: '/mock/path',
        web: `/mock/path/web`,
      }
    }),
    processPagesDir: jest.fn(() => []),
  }
})

// Mock route detection, tested in @redwoodjs/structure separately

let mockedRoutes = []
jest.mock('@redwoodjs/structure', () => {
  return {
    getProject: jest.fn(() => {
      return {
        getRouter: jest.fn(() => {
          return {
            routes: mockedRoutes,
          }
        }),
      }
    }),
  }
})

const expectPresence = (output, expectedOutput) => {
  expect(output).toContainEqual(expect.objectContaining(expectedOutput))
}

describe('Detecting routes', () => {
  it('Should correctly detect routes with prerender prop', () => {
    mockedRoutes = [
      { name: 'home', path: '/', prerender: true },
      { name: 'private', path: '/private', prerender: false },
      { name: 'about', path: '/about', prerender: true },
    ]
    const output = detectPrerenderRoutes()
    expect(output.length).toBe(2)
    expectPresence(output, { name: 'home', path: '/' })
    expectPresence(output, { name: 'about', path: '/about' })

    expect(output).not.toContainEqual(
      expect.objectContaining({ name: 'private', path: '/private' })
    )
  })

  it('Should ignore not found page', () => {
    mockedRoutes = [
      {
        name: 'bazinga',
        path: '/bazinga',
        prerender: true,
        isNotFound: true,
      },
    ]

    const output = detectPrerenderRoutes()
    expect(output.length).toBe(0)
  })

  it('Should ignore routes with params', () => {
    mockedRoutes = [
      {
        name: 'taskDetail',
        path: '/task/${id}',
        hasParameters: true,
        prerender: true,
      },
    ]

    const output = detectPrerenderRoutes()
    expect(output.length).toBe(0)
  })

  it('Should return required keys', () => {
    mockedRoutes = [
      {
        name: 'tasks',
        path: '/tasks',
        hasParameters: false,
        prerender: true,
        page: {
          filePath: '/mocked_path/tasks',
        },
      },
      {
        name: 'kittens',
        path: '/kittens',
        hasParameters: false,
        prerender: true,
        page: {
          filePath: '/mocked_path/Kittens.tsx',
        },
      },
    ]

    const output = detectPrerenderRoutes()

    expectPresence(output, {
      name: 'tasks',
      path: '/tasks',
      filePath: '/mocked_path/tasks',
    })

    expectPresence(output, {
      name: 'kittens',
      path: '/kittens',
      filePath: '/mocked_path/Kittens.tsx',
    })
  })
})
