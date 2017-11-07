import {
    ebProfileExist,
    cookieIsValid,
    profileHasChanged } from '../../src/modules/profileValidationCheck'

const defaultProfile = {
    hash: null,
    lastIdentify: null,
}

describe('profileValidationCheck', () => {
    describe('ebProfileExist', () => {

        it('should be truthy when cookie and defaultProfile are the same', () => {
            expect(ebProfileExist(defaultProfile, defaultProfile)).toBeTruthy()
        })
        it('should be falsy when cookie and defaultProfile are different', () => {
            expect(ebProfileExist({}, defaultProfile)).toBeFalsy()
        })
    })

    describe('cookieIsValid', () => {

        it('should be falsy if cookie does not exist', () => {
            expect(cookieIsValid(null)).toBeFalsy()
        })
        it('should be falsy if cookie.lastIdentify does not exist', () => {
            expect(cookieIsValid({})).toBeFalsy()
        })
        it('should be falsy if lastIdentify > duration', () => {
            Date.prototype.getTime = () => 5
            const cookie = {
                lastIdentify: 0
            }
            expect(cookieIsValid(cookie, 2)).toBeFalsy()
        })
        it('should be truthy if lastIdentify < duration', () => {
            Date.prototype.getTime = () => 0
            const cookie = {
                lastIdentify: 0
            }
            expect(cookieIsValid(cookie, 2)).toBeTruthy()            
        })
    })
})