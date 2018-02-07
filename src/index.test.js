import {store, subscribe, register} from './index'

const FIELD1 = 'field1';
const FIELD2 = 'field2';

const expectedState = {
    [FIELD1]: 1,
    [FIELD2]: 2
};

const reducer = {
    state: expectedState,
    actions: {
        setField(state, name, value) {
            return {
                ...state,
                [name]: value
            }
        },
        setFieldWithPromise(state, name, value) {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve({
                        ...state,
                        [name]: value
                    })
                }, 10)
            })
        },
    }
};

const REDUCER = 'REDUCER';

let action;
let actionWithPromise;

register(REDUCER, reducer);

subscribe(REDUCER, state => {
    expect(state).toEqual({
        [REDUCER]: expectedState,
        setField: expect.any(Function),
        setFieldWithPromise: expect.any(Function),
    });
    action = state.setField;
    actionWithPromise = state.setFieldWithPromise;
});

describe('falx', () => {
    it('initial states', () => {
        expect(store.getState()).toEqual({
            [REDUCER]: {
                [REDUCER]: expectedState,
                setField: expect.any(Function),
                setFieldWithPromise: expect.any(Function),
            }
        })
    });

    it('initial state for reducer', () => {
        expect(store.getState(REDUCER)).toEqual({
            [REDUCER]: expectedState,
            setField: expect.any(Function),
            setFieldWithPromise: expect.any(Function),
        })
    });

    test('change field1', () => {
        const value = 'asd';
        expectedState[FIELD1] = value;
        return action(FIELD1, value);
    });

    test('change field1 with promise', () => {
        const value = 'asdasd';
        expectedState[FIELD1] = value;
        return actionWithPromise(FIELD1, value);
    });

    test('change field2', () => {
        const value = 'fgh';
        expectedState[FIELD2] = value;
        return action(FIELD2, value);
    });

    it('final state', () => {
        expect(store.getState(REDUCER)).toEqual({
            [REDUCER]: expectedState,
            setField: expect.any(Function),
            setFieldWithPromise: expect.any(Function),
        })
    })
});