const makeSingleton = obj => {
  if (!obj) return null
  let instance = null
  return class {
    getInstance(params) {
      if (instance) return instance
      console.log('new instance')
      instance = new obj(params)
      return instance
    }
    reset(params) {
      instance = null
    }
  }
}

export default makeSingleton
