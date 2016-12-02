'use strict'

const winston = require('winston')
const removeProcesses = require('../fixtures/remove-processes')
const startWeb = require('../fixtures/start-web')
const configureBrowser = require('../fixtures/configure-browser')
const api = require('../../integration/fixtures/api')
const DEFAULT_TIMEOUT = 30000
const WEB_URL = 'http://localhost:8002'

const SELECTORS = {
  HOSTS: {
    PROCESSES_LINK: 'a[href="/host/localhost:8001/processes"]',
    APPS_LINK: 'a[href="/host/localhost:8001/apps"]',
    PROCESS_LINK: '.host-list .processName a'
  },
  HOST: {
    HOSTNAME: 'td.hostname',
    PLATFORM: 'td.platform',
    ARCH: 'td.arch',
    RELEASE: 'td.release',
    DAEMON: 'td.daemon'
  },
  PROCESSES: {
    PANEL: '.panel.processes',
    PANEL_TITLE: '.panel.processes .panel-title'
  },
  APPS: {
    PANEL: '.panel.apps',
    PANEL_TITLE: '.panel.apps .panel-title'
  }
}

const test = {
  before: (browser, done) => {
    if (!process.env.QUIET) {
      winston.level = 'debug'
    }

    winston.cli()

    removeProcesses()
    .then(() => startWeb())
    .then(() => configureBrowser(browser, done))
    .then(() => api)
    .then(result => {
      test.api = result

      return test.api.status()
      .then(status => {
        test.server = status
      })
    })
  },

  after: (browser, done) => {
    api
    .then(api => api.disconnect())
    .then(() => done())
  },

  'Should list processes': browser => browser
    .url(WEB_URL)
    .waitForElementVisible(SELECTORS.HOSTS.PROCESS_LINK, DEFAULT_TIMEOUT)
    .waitForElementVisible(SELECTORS.HOSTS.PROCESSES_LINK, DEFAULT_TIMEOUT)
    .click(SELECTORS.HOSTS.PROCESSES_LINK)
    .waitForElementVisible(SELECTORS.PROCESSES.PANEL, DEFAULT_TIMEOUT)
    .assert.containsText(SELECTORS.PROCESSES.PANEL_TITLE, 'Processes')
    .end(),

  'Should list apps': browser => browser
    .url(WEB_URL)
    .waitForElementVisible(SELECTORS.HOSTS.PROCESS_LINK, DEFAULT_TIMEOUT)
    .waitForElementVisible(SELECTORS.HOSTS.APPS_LINK, DEFAULT_TIMEOUT)
    .click(SELECTORS.HOSTS.APPS_LINK)
    .waitForElementVisible(SELECTORS.APPS.PANEL, DEFAULT_TIMEOUT)
    .assert.containsText(SELECTORS.APPS.PANEL_TITLE, 'Apps')
    .end(),

  'Should show server info': browser => browser
    .url(WEB_URL)
    .waitForElementVisible(SELECTORS.HOST.HOSTNAME, DEFAULT_TIMEOUT)
    .assert.containsText(SELECTORS.HOST.HOSTNAME, test.server.hostname)
    .assert.containsText(SELECTORS.HOST.PLATFORM, test.server.platform)
    .assert.containsText(SELECTORS.HOST.ARCH, test.server.arch)
    .assert.containsText(SELECTORS.HOST.RELEASE, test.server.release)
    .assert.containsText(SELECTORS.HOST.DAEMON, test.server.daemon)
    .end()
}

module.exports = test
