// @flow

export function shallowDiffers(a: any, b: any) {
    if(typeof a !== typeof b) return true;
    if (typeof a !== 'object') return a != b;
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return true;
    for (const i in a) {
        if (a[i] !== b[i]) return true
    }
    return false
}