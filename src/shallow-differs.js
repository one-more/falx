// @flow

export function shallowDiffers(a: any, b: any) {
    if(typeof a !== typeof b) return true;
    if (typeof a !== 'object') return a != b;
    for (let i in a) {
        if (!(i in b)) return true;
        if (a[i] !== b[i]) return true;
    }
    return false
}