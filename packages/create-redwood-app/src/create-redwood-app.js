#!/usr/bin/env node

// This downloads the latest release of Redwood from https://github.com/redwoodjs/create-redwood-app/
// and extracts it into the supplied directory.
//
// Usage:
// `$ yarn create redwood-app ./path/to/new-project`

import path from 'path'

import chalk from 'chalk'
import checkNodeVersion from 'check-node-version'
import execa from 'execa'
import fs from 'fs-extra'
import Listr from 'listr'
import yargs from 'yargs'

import { name, version } from '../package'

/**
 * To keep a consistent color/style palette between cli packages, such as
 * @redwood/create-redwood-app and @redwood/cli, please keep them compatible
 * with one and another. We'll might split up and refactor these into a
 * separate package when there is a strong motivation behind it.
 *
 * Current files:
 *
 * - packages/cli/src/lib/colors.js
 * - packages/create-redwood-app/src/create-redwood-app.js (this file)
 *
 */
const style = {
  error: chalk.bold.red,
  warning: chalk.keyword('orange'),
  success: chalk.greenBright,
  info: chalk.grey,

  header: chalk.bold.underline.hex('#e8e8e8'),
  cmd: chalk.hex('#808080'),
  redwood: chalk.hex('#ff845e'),
  love: chalk.redBright,

  green: chalk.green,
}

const { _: args, 'yarn-install': yarnInstall } = yargs
  .scriptName(name)
  .usage('Usage: $0 <project directory> [option]')
  .example('$0 newapp')
  .option('yarn-install', {
    default: true,
    describe: 'Skip yarn install with --no-yarn-install',
  })
  .version(version)
  .strict().argv

const targetDir = String(args).replace(/,/g, '-')
if (!targetDir) {
  console.error('Please specify the project directory')
  console.log(
    `  ${chalk.cyan('yarn create redwood-app')} ${chalk.green(
      '<project-directory>'
    )}`
  )
  console.log()
  console.log('For example:')
  console.log(
    `  ${chalk.cyan('yarn create redwood-app')} ${chalk.green(
      'my-redwood-app'
    )}`
  )
  process.exit(1)
}

const newAppDir = path.resolve(process.cwd(), targetDir)
const appDirExists = fs.existsSync(newAppDir)
const templateDir = path.resolve(__dirname, '../template')

const createProjectTasks = ({ newAppDir }) => {
  return [
    {
      title: `${appDirExists ? 'Using' : 'Creating'} directory '${newAppDir}'`,
      task: () => {
        if (appDirExists) {
          // make sure that the target directory is empty
          if (fs.readdirSync(newAppDir).length > 0) {
            console.error(`'${newAppDir}' already exists and is not empty.`)
            process.exit(1)
          }
        } else {
          fs.ensureDirSync(path.dirname(newAppDir))
        }
        fs.copySync(templateDir, newAppDir)
      },
    },
  ]
}

const installNodeModulesTasks = ({ newAppDir }) => {
  return [
    {
      title: 'Checking node and yarn compatibility',
      task: () => {
        return new Promise((resolve, reject) => {
          const { engines } = require(path.join(newAppDir, 'package.json'))

          checkNodeVersion(engines, (_error, result) => {
            if (result.isSatisfied) {
              return resolve()
            }

            const errors = Object.keys(result.versions).map((name) => {
              const { version, wanted } = result.versions[name]
              return `${name} ${wanted} required, but you have ${version}.`
            })
            return reject(new Error(errors.join('\n')))
          })
        })
      },
    },
    {
      title: "Running 'yarn install'... (This could take a while)",
      skip: () => {
        if (yarnInstall === false) {
          return 'skipped on request'
        }
      },
      task: () => {
        return execa('yarn install', {
          shell: true,
          cwd: newAppDir,
        })
      },
    },
  ]
}

new Listr(
  [
    {
      title: 'Creating Redwood app',
      task: () => new Listr(createProjectTasks({ newAppDir })),
    },
    {
      title: 'Installing packages',
      task: () => new Listr(installNodeModulesTasks({ newAppDir })),
    },
  ],
  { collapse: false, exitOnError: true }
)
  .run()
  .then(() => {
    // zOMG the semicolon below is a real Prettier thing. What??
    // https://prettier.io/docs/en/rationale.html#semicolons
    ;[
      '',
      style.success('Thanks for trying out Redwood!'),
      '',
      `We've created your app in '${style.green(newAppDir)}'`,
      `Enter the directory and run '${style.green(
        'yarn rw dev'
      )}' to start the development server.`,
      '',
      ` ⚡️ ${style.redwood(
        'Get up and running fast with this Quick Start guide'
      )}: https://redwoodjs.com/docs/quick-start`,
      '',
      style.header('Join the Community'),
      '',
      `${style.redwood(' ❖ Join our Forums')}: https://community.redwoodjs.com`,
      `${style.redwood(' ❖ Join our Chat')}: https://discord.gg/redwoodjs`,
      '',
      style.header('Get some help'),
      '',
      `${style.redwood(
        ' ❖ Get started with the Tutorial'
      )}: https://redwoodjs.com/tutorial`,
      `${style.redwood(
        ' ❖ Read the Documentation'
      )}: https://redwoodjs.com/docs`,
      '',
      style.header('Stay updated'),
      '',
      `${style.redwood(
        ' ❖ Sign up for our Newsletter'
      )}: https://www.redwoodjs.com/newsletter`,
      `${style.redwood(
        ' ❖ Follow us on Twitter'
      )}: https://twitter.com/redwoodjs`,
      '',
      `${style.header(`Become a Contributor`)} ${style.love('❤')}`,
      '',
      `${style.redwood(
        ' ❖ Learn how to get started'
      )}: https://redwoodjs.com/docs/contributing`,
      `${style.redwood(
        ' ❖ Find a Good First Issue'
      )}: https://redwoodjs.com/good-first-issue`,
      '',
    ].map((item) => console.log(item))
  })
  .catch((e) => {
    console.log()
    console.log(e)
    process.exit(1)
  })
