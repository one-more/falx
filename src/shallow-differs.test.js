import {shallowDiffers} from './shallow-differs'

describe('shallow differs', () => {
    test('objects', () => {
        const a = {
            a: 1,
            b: 2,
            c: 3
        };
        const b = {
            a: 1,
            b: 2,
            c: 4
        };
        const c = {
            a: 1,
            b: 2
        };
        const d = 4;
        const e = {
            a: 1,
            b: 2,
            c: 3
        };
        const f = 4;
        const g = 5;
        expect(shallowDiffers(a,a)).toBeFalsy();
        expect(shallowDiffers(a,e)).toBeFalsy();
        expect(shallowDiffers(d,f)).toBeFalsy();
        expect(shallowDiffers(a,b)).toBeTruthy();
        expect(shallowDiffers(a,c)).toBeTruthy();
        expect(shallowDiffers(a,d)).toBeTruthy();
        expect(shallowDiffers(f,g)).toBeTruthy();
    })
});