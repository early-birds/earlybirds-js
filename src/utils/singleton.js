const makeSingleton = obj => {
  if (!obj) return null
  let instance = null
  return class {
    getInstance(params) {
      return instance || (instance = new obj(params), instance)
    }
    reset() {
      instance = null
    }
  }
}

export default makeSingleton
