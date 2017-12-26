import { detectEmptyOriginalId } from '../trackActivityCheck'

describe('Activities checking', () => {

  describe('detectEmptyOriginalId', () => {
    it('should be falsy if originalId is provided in all activities', () => {
      const activities = [
        {
          originalId: '4324',
          verb: 'buy'
        },
        {
          originalId: '4323',
          verb: 'add-to-cart'
        },
        {
          originalId: '4323',
          verb: 'add-to-cart'
        },
      ]
      expect(detectEmptyOriginalId(activities)).toBeFalsy()
    })
    it('should be falsy if originalId is not provided in one activity', () => {
      const activities = [
        {
          originalId: '4324',
          verb: 'buy'
        },
        {
          verb: 'add-to-cart'
        },
        {
          originalId: '4323',
          verb: 'add-to-cart'
        },
      ]
      expect(detectEmptyOriginalId(activities)).toBeTruthy()
    })
  })
})
