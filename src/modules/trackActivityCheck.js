export const detectEmptyOriginalId = activities => (
  activities.reduce((errorDetected, item) => (
    errorDetected || !item.originalId
  ), false)
)

export const checkActivitiesInputs = activities => {
  if (activities === undefined)
    return false
  if (detectEmptyOriginalId(activities)) {
    return 'empty field originalId in one activity'
  }
  return true
}
