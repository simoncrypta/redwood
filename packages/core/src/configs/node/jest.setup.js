const path = require('path')

const { setContext } = require('@redwoodjs/api')
const { getSchemaDefinitions } = require('@redwoodjs/cli/dist/lib')
const { getPaths } = require('@redwoodjs/internal')
const { defineScenario } = require('@redwoodjs/testing/dist/scenario')
const { db } = require(path.join(getPaths().api.src, 'lib', 'db'))
const DEFAULT_SCENARIO = 'standard'

const seedScenario = async (scenario) => {
  if (scenario) {
    const scenarios = {}
    for (const [model, namedFixtures] of Object.entries(scenario)) {
      scenarios[model] = {}
      for (const [name, data] of Object.entries(namedFixtures)) {
        scenarios[model][name] = await db[model].create({ data })
      }
    }
    return scenarios
  } else {
    return {}
  }
}

const teardown = async () => {
  const prismaModelNames = (await getSchemaDefinitions()).datamodel.models.map(
    (m) => m.name
  )

  for (const model of prismaModelNames) {
    await db.$queryRaw(`DELETE FROM "${model}"`)
  }
}

window.scenario = (...args) => {
  let scenarioName, testName, testFunc

  if (args.length === 3) {
    ;[scenarioName, testName, testFunc] = args
  } else if (args.length === 2) {
    scenarioName = DEFAULT_SCENARIO
    ;[testName, testFunc] = args
  } else {
    throw new Error('scenario() requires 2 or 3 arguments')
  }

  return window.it(testName, async () => {
    const path = require('path')
    const testFileDir = path.parse(window.jasmine.testPath)
    const testFilePath = `${testFileDir.dir}/${
      testFileDir.name.split('.')[0]
    }.scenarios`
    let allScenarios, scenario, result

    try {
      allScenarios = require(testFilePath)
    } catch (e) {
      // ignore error if scenario file not found, otherwise re-throw
      if (e.code !== 'MODULE_NOT_FOUND') {
        throw e
      }
    }

    if (allScenarios) {
      if (allScenarios[scenarioName]) {
        scenario = allScenarios[scenarioName]
      } else {
        throw (
          ('UndefinedScenario',
          `There is no scenario named "${scenarioName}" in ${testFilePath}.js`)
        )
      }
    }

    const scenarioData = await seedScenario(scenario)
    try {
      result = await testFunc(scenarioData)
    } finally {
      // if the test fails this makes sure we still remove scenario data
      await teardown()
    }

    return result
  })
}

window.defineScenario = defineScenario

window.mockCurrentUser = (currentUser) => {
  setContext({ currentUser })
}

afterAll(async () => {
  await db.$disconnect()
})
