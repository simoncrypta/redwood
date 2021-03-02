[![RedwoodJS](https://raw.githubusercontent.com/redwoodjs/redwoodjs.com/main/publish/images/mark-logo-cover.png)](https://redwoodjs.com)

<!-- prettier-ignore-start -->
<p align="center">
  <a aria-label="Start the Tutorial" href="https://redwoodjs.com/tutorial">
    <img alt="" src="https://img.shields.io/badge/Start%20the%20Tutorial-%23BF4722?style=for-the-badge&labelColor=000000&logoWidth=20&logo=RedwoodJS">
  </a>
  <a aria-label="Join the Forums" href="https://community.redwoodjs.com">
    <img alt="" src="https://img.shields.io/badge/Join%20the%20Forums-%23FFF9AE?style=for-the-badge&labelColor=000000&logoWidth=20&logo=Discourse">
  </a>
  <a aria-label="Join the Chat" href="https://discord.gg/redwoodjs">
    <img alt="" src="https://img.shields.io/badge/Join%20the%20Chat-%237289DA?style=for-the-badge&labelColor=000000&logoWidth=20&logo=Discord&logoColor=white">
  </a>
</p>
<!-- prettier-ignore-end -->
<br>
<h1 align="center">Bringing full-stack to the Jamstack</h1>

<h2 align="center">An opinionated, edge-ready framework for modern multi-client applications. <br>Built on React, GraphQL, and Prisma.</h2>

Do you love the Jamstack philosophy but need a database-backed web app? Want great developer experience and easy scaling? Redwood is here! Redwood works with the components and development workflow you love but with simple conventions and helpers to make your experience even better.

<br>

<h2>Quick Start</h2>

Redwood requires Node.js v12 and Yarn v1.15 (or newer).
```console
yarn create redwood-app redwood-project
cd redwood-project
yarn redwood dev
```

<h3>Resources</h3>

- The [Redwood Tutorial](https://redwoodjs.com/tutorial): The best way to learn Redwood
- The [Redwood CLI](https://redwoodjs.com/docs/cli-commands): code generators, DB helpers, setup commands, and more
- [Documentation](https://redwoodjs.com/docs) and [Cookbooks](https://redwoodjs.com/cookbook/custom-function)
- Join the Community [Forums](https://community.redwoodjs.com) and [Chat](https://discord.gg/redwoodjs)

<br>

<h1>Contributing to create-redwood-app</h1>

_Contributors are Welcome! Get started [here](https://redwoodjs.com/docs/contributing). And don't hesitate to ask for help on the forums and chat_

**Table of Contents**
<!-- toc -->
- [Description](#description)
- [Package Leads](#package-leads)
- [Roadmap](#roadmap)
- [Local Development](#local-development)
  - [Installation Script](#installation-script)
  - [Template Codebase](#template-codebase)
  - [How to run create-redwood-app and create a project](#how-to-run-create-redwood-app-and-create-a-project)
  - [Develop using the new project](#develop-using-the-new-project)

## Description

This package creates and installs a Redwood project, which is the entry point for anyone using Redwood. It has two parts:
- The installation script `create-redwood-app.js`
- Project template code in the `template/` directory

> _For information about contributing to the Redwood Framework in general, [please start here](https://redwoodjs.com/docs/contributing)._

## Package Leads
- [@peterp](https://github.com/peterp)
- [@thedavidprice](https://github.com/thedavidprice)

## Roadmap

v1 Priorities:
- convert `template/` codebase to TypeScript
- add option to install as either TypeScript or JavaScript project (defaults to TypeScript)
- add package tests, which may be accomplished by including in Cypress E2E CI

## Local Development

### Installation Script
The installation script is built with [Yargs](https://github.com/yargs/yargs)

### Template Codebase
The project codebase in `template/` uses [Yarn Workspace v1](https://classic.yarnpkg.com/en/docs/workspaces/) for a monorepo project containing the API and Web Sides. Redwood packages are included in `template/package.json`, `template/web/package.json`, and `template/api/package.json`, respectively.

### How to run create-redwood-app and create a project
Make sure you to first run `yarn install` in your project root.

Step into the `create-redwood-app` package and run the script:

```bash
cd packages/create-redwood-app
yarn babel-node src/create-redwood-app.js /path/to/new/redwood-app
```

This will create a new project using the local `template/` codebase

> Note: the new project will install with the most recent stable Redwood package version by default

### Develop using the new project
There are three options for developing with the installed project:

**1. Upgrade the project to use the latest canary release**
```bash
cd /path/to/new/redwood-app
yarn rw upgrade -t canary
```
**2. Install packages specific to a PR, for example**
```bash
cd /path/to/new/redwood-app
yarn rw upgrade --pr 1703:0.23.0-b06dd35
```
**3. Use the workflow and tools for local package development**
- [Local Development Instructions](https://github.com/redwoodjs/redwood/blob/main/CONTRIBUTING.md#local-development)
