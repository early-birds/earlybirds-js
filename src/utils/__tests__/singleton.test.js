import makeSingleton from '../singleton'

describe('makeSingleton', () => {
  it('should return null if obj params is undefined', () => {
    const mySingleton = makeSingleton()
    expect(mySingleton).toEqual(null)
  })
  it('should return an instanciable class', () => {
    const mySingleton = makeSingleton(() => {})
    expect(typeof mySingleton).toEqual('function')
    expect(new mySingleton()).toBeDefined()
  })
  it('should implement a getInstance method that return the current instance', () => {
    const mySingleton = makeSingleton(() => {})
    expect(new mySingleton().getInstance).toBeDefined()
    expect(typeof new mySingleton().getInstance()).toEqual('object')
  })
  it('should not re-instantiate an object', () => {
    const mySingleton = makeSingleton(() => {})
    const a = new mySingleton().getInstance()
    const b = new mySingleton().getInstance()
    expect(a).toBe(b)
  })
})
