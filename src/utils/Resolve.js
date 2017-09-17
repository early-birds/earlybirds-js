function when (testConditionFn) {
  return new Promise(function (resolve, reject) {
    const check = () => {
      if (testConditionFn()) {
        resolve()
      }
      else {
        setTimeout(check, 500, testConditionFn)
      }
    }
    check()
  })
}

function whenProperty (objectToObserve, propertyToObserve) {
      console.log('data layer loading')
  return when(() => objectToObserve[propertyToObserve] !== undefined)
}

module.exports = {
  when,
  whenProperty
}