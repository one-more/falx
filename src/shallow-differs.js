// @flow

export function shallowDiffers(a: any, b: any) {
    if (typeof a !== 'object') return a != b;
    if (Object.keys(a).length !== Object.keys(b).length) return true;
    for (const i in a) if (a[i] !== b[i]) return true;
    return false
}