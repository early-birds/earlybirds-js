import Cookies from '../src/utils/Cookies'
import Config from '../config'
import Eb from '../src/eb'

class Mock {

  static start() {
    // mute console.log when tests are running.
    console.log = () => {}

    // avoid using the same instance of Eb for each test
    new Eb().reset()

    // since all async tasks are mocked and should resolve instantly we don't need timeout
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 0;

    // some shortcuts...
    global.FAKE_PROFILE = {
      hash: 'fakeHash',
      lastIdentify: 10
    }

    global.DEFAULT_PROFILE = {
      hash: null,
      lastIdentify: null,
    }

    // mock http protocol
    Config.HTTP_PROTOCOL = 'fakeHttpProtocol/'
    Config.API_URL = 'fakeApiUrl'

    // fetch should resolve to an empty string by default.
    // mock response can be overriden in the test
    global.fetch = require('jest-fetch-mock')
    fetch.mockResponse(JSON.stringify({}))

    // returning the current date may prevent the tests from working properly.
    // should return the same value for all
    Date.prototype.getTime = jest.fn(() => 0)

    // spy cookies
    Cookies.setCookie = jest.fn()
    Cookies.getCookie = jest.fn()
  }
  static restore() {
    Date.prototype.getTime.mockRestore()

    // reset spies and function implementation
    fetch.mockReset()
    fetch.mockRestore()
    Cookies.setCookie.mockRestore()
    Cookies.setCookie.mockReset()
    Cookies.getCookie.mockRestore()
    Cookies.getCookie.mockReset()
  }
}
Mock.FAKE_PROFILE = {
  hash: 'fakeHash',
  lastIdentify: 10
}
Mock.DEFAULT_PROFILE = {
  hash: null,
  lastIdentify: null,
}
Mock.defaultHttpProtocol = Config.HTTP_PROTOCOL
Mock.defaultApiUrl = Config.API_URL
Mock.jasmineDefaultTimeoutInterval = jasmine.DEFAULT_TIMEOUT_INTERVAL

/*
const mock = () => {
  // mute console.log when tests are running.
console.log = () => {}

  // avoid using the same instance of Eb for each test
new Eb().reset()

  // since all async tasks are mocked and should resolve instantly we don't need timeout
jasmine.DEFAULT_TIMEOUT_INTERVAL = 0;

  // some shortcuts...
global.FAKE_PROFILE = {
  hash: 'fakeHash',
  lastIdentify: 10
}

global.DEFAULT_PROFILE = {
  hash: null,
  lastIdentify: null,
}

// mock http protocol
Config.HTTP_PROTOCOL = 'fakeHttpProtocol/'
Config.API_URL = 'fakeApiUrl'

// fetch should resolve to an empty string by default.
// mock response can be overriden in the test
global.fetch = require('jest-fetch-mock')
fetch.mockResponse(JSON.stringify({}))

// returning the current date may prevent the tests from working properly.
// should return the same value for all
Date.prototype.getTime = jest.fn(() => 0)

// spy cookies
Cookies.setCookie = jest.fn()
Cookies.getCookie = jest.fn()
}
*/

export default Mock
