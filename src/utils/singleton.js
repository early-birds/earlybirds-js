const makeSingleton = obj => {
  if (!obj) return null
  let instance = null
  return class {
    getInstance(params) {
      if (!instance)
        instance = new obj(params)
      return instance
    }
    reset() {
      instance = null
    }
  }
}

export default makeSingleton
