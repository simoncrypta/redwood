/* eslint-disable no-undef, camelcase */
/// <reference types="cypress" />
import path from 'path'

import Step1_1_Routes from './codemods/Step1_1_Routes'
import Step2_1_PagesHome from './codemods/Step2_1_PagesHome'
import Step2_2_PagesAbout from './codemods/Step2_2_PagesAbout'
import Step3_1_LayoutsBlog from './codemods/Step3_1_LayoutsBlog'
import Step3_2_PagesHome from './codemods/Step3_2_PagesHome'
import Step3_3_PagesAbout from './codemods/Step3_3_PagesAbout'
import Step4_1_DbSchema from './codemods/Step4_1_DbSchema'
import Step5_1_ComponentsCellBlogPost from './codemods/Step5_1_ComponentsCellBlogPost'
import Step5_2_ComponentsCellBlogPostTest from './codemods/Step5_2_ComponentsCellBlogPostTest'
import Step5_3_PagesHome from './codemods/Step5_3_PagesHome'
import Step6_1_Routes from './codemods/Step6_1_Routes'
import Step6_2_BlogPostPage from './codemods/Step6_2_BlogPostPage'
import Step6_3_BlogPostCell from './codemods/Step6_3_BlogPostCell'
import Step6_3_BlogPostCellTest from './codemods/Step6_3_BlogPostCellTest'
import Step6_4_BlogPost from './codemods/Step6_4_BlogPost'
import Step6_4_BlogPostTest from './codemods/Step6_4_BlogPostTest'
import Step6_5_BlogPostsCell from './codemods/Step6_5_BlogPostsCell'
import Step6_5_BlogPostsCellMock from './codemods/Step6_5_BlogPostsCellMock'

const BASE_DIR = Cypress.env('RW_PATH')

describe('The Redwood Tutorial - Golden path edition', () => {
  // TODO: https://redwoodjs.com/tutorial/everyone-s-favorite-thing-to-build-forms
  // TODO: https://redwoodjs.com/tutorial/saving-data
  // TODO: https://redwoodjs.com/tutorial/administration

  it('0. Starting Development', () => {
    // https://redwoodjs.com/tutorial/installation-starting-development
    cy.writeFile(path.join(BASE_DIR, 'web/src/Routes.js'), Step1_1_Routes)
    cy.visit('http://localhost:8910')
    cy.get('h1 > span').contains('Welcome to RedwoodJS!')
  })

  it('1. Our First Page', () => {
    //redwoodjs.com/tutorial/our-first-page
    cy.visit('http://localhost:8910')
    cy.exec(`cd ${BASE_DIR}; yarn redwood generate page home / --force`)
    cy.get('h1').should('contain', 'HomePage')
  })

  it('2. A Second Page and a Link', () => {
    // https://redwoodjs.com/tutorial/a-second-page-and-a-link
    cy.exec(`cd ${BASE_DIR}; yarn redwood generate page about --force`)
    cy.writeFile(
      path.join(BASE_DIR, 'web/src/pages/HomePage/HomePage.js'),
      Step2_1_PagesHome
    )
    cy.contains('About').click()
    cy.get('h1').should('contain', 'AboutPage')
    cy.writeFile(
      path.join(BASE_DIR, 'web/src/pages/AboutPage/AboutPage.js'),
      Step2_2_PagesAbout
    )
    cy.get('h1').should('contain', 'AboutPage')
    cy.contains('Return home').click()
  })

  it('3. Layouts', () => {
    cy.exec(`cd ${BASE_DIR}; yarn redwood generate layout blog --force`)
    cy.writeFile(
      path.join(BASE_DIR, 'web/src/layouts/BlogLayout/BlogLayout.js'),
      Step3_1_LayoutsBlog
    )
    cy.writeFile(
      path.join(BASE_DIR, 'web/src/pages/HomePage/HomePage.js'),
      Step3_2_PagesHome
    )
    cy.contains('Redwood Blog').click()
    cy.get('main').should('contain', 'Home')

    cy.writeFile(
      path.join(BASE_DIR, 'web/src/pages/AboutPage/AboutPage.js'),
      Step3_3_PagesAbout
    )
    cy.contains('About').click()
    cy.get('p').should(
      'contain',
      'This site was created to demonstrate my mastery of Redwood: Look on my works, ye mighty, and despair!'
    )
  })

  it('4. Getting Dynamic', () => {
    // https://redwoodjs.com/tutorial/getting-dynamic
    cy.writeFile(path.join(BASE_DIR, 'api/db/schema.prisma'), Step4_1_DbSchema)
    cy.exec(`rm ${BASE_DIR}/api/db/dev.db`, { failOnNonZeroExit: false })
    // need to also handle case where Prisma Client be out of sync
    cy.exec(`cd ${BASE_DIR}; yarn rw prisma migrate reset --skip-seed --force`)
    cy.exec(`cd ${BASE_DIR}; yarn rw prisma migrate dev`)

    cy.exec(`cd ${BASE_DIR}; yarn rw g scaffold post --force`)

    cy.visit('http://localhost:8910/posts')

    cy.get('h1').should('contain', 'Posts')
    cy.contains(' New Post').click()
    cy.get('h2').should('contain', 'New Post')

    // SAVE
    cy.get('input#title').type('First post')
    cy.get('input#body').type('Hello world!')
    cy.get('button').contains('Save').click()

    cy.get('td').contains('First post')

    // EDIT
    cy.contains('Edit').click()
    cy.get('input#body').clear().type('No, Margle the World!')
    cy.get('button').contains('Save').click()
    cy.get('td').contains('No, Margle the World!')

    // DELETE
    cy.contains('Delete').click()

    // No more posts, so it should be in the empty state.
    cy.contains('Post deleted.')

    cy.contains('Create one?').click()
    cy.get('input#title').type('Second post')
    cy.get('input#body').type('Hello world!')
    cy.get('button').contains('Save').click()
  })

  it('5. Cells', () => {
    // https://redwoodjs.com/tutorial/cells
    cy.visit('http://localhost:8910/')

    cy.exec(`cd ${BASE_DIR}; yarn rw g cell BlogPosts --force`)
    cy.writeFile(
      path.join(BASE_DIR, 'web/src/components/BlogPostsCell/BlogPostsCell.js'),
      Step5_1_ComponentsCellBlogPost
    )
    cy.writeFile(
      path.join(
        BASE_DIR,
        'web/src/components/BlogPostsCell/BlogPostsCell.test.js'
      ),
      Step5_2_ComponentsCellBlogPostTest
    )
    cy.writeFile(
      path.join(BASE_DIR, 'web/src/pages/HomePage/HomePage.js'),
      Step5_3_PagesHome
    )
    cy.get('main').should(
      'contain',
      // [{"title":"Second post","body":"Hello world!","__typename":"Post"}]
      '"body":"Hello world!"'
    )
  })

  it('6. Routing Params', () => {
    // https://redwoodjs.com/tutorial/routing-params
    cy.exec(`cd ${BASE_DIR}; yarn rw g page BlogPost --force`)
    cy.exec(`cd ${BASE_DIR}; yarn rw g cell BlogPost --force`)
    cy.exec(`cd ${BASE_DIR}; yarn rw g component BlogPost --force`)

    cy.writeFile(path.join(BASE_DIR, 'web/src/Routes.js'), Step6_1_Routes)
    cy.writeFile(
      path.join(BASE_DIR, 'web/src/pages/BlogPostPage/BlogPostPage.js'),
      Step6_2_BlogPostPage
    )
    cy.writeFile(
      path.join(BASE_DIR, 'web/src/components/BlogPostCell/BlogPostCell.js'),
      Step6_3_BlogPostCell
    )
    cy.writeFile(
      path.join(
        BASE_DIR,
        'web/src/components/BlogPostCell/BlogPostCell.test.js'
      ),
      Step6_3_BlogPostCellTest
    )
    cy.writeFile(
      path.join(BASE_DIR, 'web/src/components/BlogPost/BlogPost.js'),
      Step6_4_BlogPost
    )
    cy.writeFile(
      path.join(BASE_DIR, 'web/src/components/BlogPost/BlogPost.test.js'),
      Step6_4_BlogPostTest
    )
    cy.writeFile(
      path.join(BASE_DIR, 'web/src/components/BlogPostsCell/BlogPostsCell.js'),
      Step6_5_BlogPostsCell
    )
    cy.writeFile(
      path.join(
        BASE_DIR,
        'web/src/components/BlogPostsCell/BlogPostsCell.mock.js'
      ),
      Step6_5_BlogPostsCellMock
    )

    // New entry
    cy.visit('http://localhost:8910/posts')
    cy.contains(' New Post').click()
    cy.get('input#title').type('Third post')
    cy.get('input#body').type('foo bar')
    cy.get('button').contains('Save').click()

    cy.visit('http://localhost:8910/')

    // Detail Page
    cy.contains('Second post').click()
    cy.get('main').should('contain', 'Hello world!')

    cy.visit('http://localhost:8910/')

    cy.contains('Third post').click()
    cy.get('main').should('contain', 'foo bar')
  })
})
