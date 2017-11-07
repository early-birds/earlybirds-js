import { isEqual, Encode } from '../utils/Utils'

export const ebProfileExist = isEqual

export const cookieIsValid = (cookie, duration) => {
    if (!cookie) return false
    if (!cookie.lastIdentify) return false
    console.log('hello')
    return new Date().getTime() - cookie.lastIdentify < duration
}

export const profileHasChanged =
    (cookie, profile) =>
        !isEqual(cookie.hash, Encode(profile))

