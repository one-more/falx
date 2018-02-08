import {store, subscribe, register, use, unuse, reduxReducerMiddleware} from './index'

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

const middleware1value = 'middleware1';
const middleware1valueChanged = 'middleware11111';
const unsubscribedValue = '123lkjaslkd';
const valueReducerChanged = 'poijosvidjvo787';

const middleware1 = (storeProp, promise, action) => {
    expect(action).toEqual({
        type: 'SET_FIELD',
        payload: [FIELD1, middleware1value],
        branch: REDUCER
    });
    expect(storeProp).toEqual(store);
    return promise.then(state => ({
        ...state,
        [FIELD1]: middleware1valueChanged
    }))
};

const reduxReducer = (state, action) => {
    switch (action.type) {
        case 'SET_FIELD':
            return {
                ...state,
                [action.payload[0]]: valueReducerChanged
            };
        default:
            return state
    }
};

const REDUCER = 'REDUCER';

register(REDUCER, reducer);

const subscription = subscribe(REDUCER, state => {
    expect(state).toEqual({
        [REDUCER]: expectedState,
        setField: expect.any(Function),
        setFieldWithPromise: expect.any(Function),
    });
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
        return store.getState(REDUCER).setField(FIELD1, value);
    });

    test('change field1 with promise', () => {
        const value = 'asdasd';
        expectedState[FIELD1] = value;
        return store.getState(REDUCER).setFieldWithPromise(FIELD1, value);
    });

    test('change field2', () => {
        const value = 'fgh';
        expectedState[FIELD2] = value;
        return store.getState(REDUCER).setField(FIELD2, value);
    });

    it('final state', () => {
        expect(store.getState(REDUCER)).toEqual({
            [REDUCER]: expectedState,
            setField: expect.any(Function),
            setFieldWithPromise: expect.any(Function),
        })
    });

    test('middleware1', () => {
        use(middleware1);
        expectedState[FIELD1] = middleware1valueChanged;
        return store.getState(REDUCER).setField(FIELD1, middleware1value)
    });

    test('unsubscribe', () => {
        unuse(middleware1);
        subscription.unsubscribe();
        return store.getState(REDUCER).setField(FIELD1, unsubscribedValue)
    });

    test('unsubscribed successfully', () => {
        expect(expectedState[FIELD1]).toEqual(middleware1valueChanged);
        expect(store.getState(REDUCER)[REDUCER][FIELD1]).toEqual(unsubscribedValue)
    });

    test('redux reducer', () => {
        use(reduxReducerMiddleware(reduxReducer));
        return store[REDUCER].setField(FIELD2, '123')
    });

    test('redux reducer change value', () => {
        expect(store[REDUCER][REDUCER][FIELD2]).toEqual(valueReducerChanged)
    })
});