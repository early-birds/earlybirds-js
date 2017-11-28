import Cookies from '../../src/utils/Cookies'

describe('Cookies', () => {
  it('should implement getCookie', () => {
    expect(Cookies.getCookie).toBeDefined()
  })
  it('should implement setCookie', () => {
    expect(Cookies.setCookie).toBeDefined()
  })
  it('should store a cookie and retrieve it by its name', () => {
    Cookies.setCookie('foo', 'bar')
    const res = Cookies.getCookie('foo')
    expect(res).toEqual('bar')
  })
  it('should take into account the cookie duration', () => {

    // duration <= 0. should not create the cookie
    Cookies.setCookie('foo', 'bar', 0)
    expect(Cookies.getCookie('foo')).toEqual(null)

    // duration > 0. should create the cookie
    Cookies.setCookie('foo', 'bar', 1)
    expect(Cookies.getCookie('foo')).toEqual('bar')
  })
})
