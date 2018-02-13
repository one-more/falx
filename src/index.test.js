import {store, subscribe, register, use, unuse, remove} from './index'
import {combineReducers} from 'redux'
import words from 'lodash/_unicodeWords'

const transformActionName = (name: string) => words(name).map(s => s.toUpperCase()).join('_');

use(function (store, promise, action) {
    action.type = transformActionName(action.type);
    return promise
});

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

const timerReducer = {
    state: {
        value: 0
    },
    actions: {
        tick(state, count = 1) {
            return {
                ...state,
                value: state.value + count
            }
        }
    }
};
const TIMER = 'TIMER';

const middleware1value = 'middleware1';
const middleware1valueChanged = 'middleware11111';
const unsubscribedValue = '123lkjaslkd';
const valueReducerChanged = 'poijosvidjvo787';

const middleware1 = (storeProp, promise, action) => {
    expect(action).toEqual({
        type: 'SET_FIELD',
        payload: [FIELD1, middleware1value]
    });
    expect(storeProp).toEqual(store);
    return promise.then(state => {
        return {
            ...state,
            [REDUCER]: {
                ...state[REDUCER],
                [FIELD1]: middleware1valueChanged
            }
        }
    })
};

const REDUCER = 'REDUCER';
const INCREASE_COUNTER = 'INCREASE_COUNTER';

const reduxReducer = combineReducers({
    [REDUCER]: (state = reducer.state, action) => {
        switch (action.type) {
            case 'SET_FIELD':
                return {
                    ...state,
                    [action.payload[0]]: valueReducerChanged
                };
            default:
                return state
        }
    },
    counter: counterReducer
});

function counterReducer(state = {value: 0}, action) {
    if (action.type === INCREASE_COUNTER) {
        return {
            ...state,
            value: state.value + 1
        }
    }
    return state
}

function reduxReducerMiddleware(store, promise, action) {
    return promise.then(state => {
        return reduxReducer(state, action)
    })
}

function counterReducerMiddleware(store, promise, action) {
    return promise.then(state => {
        state.counter = counterReducer(state.counter, action);
        return state
    })
}

const registerListener = function (state, action) {
    expect(action).toEqual({
        type: 'REGISTER_REDUCER',
        payload: REDUCER
    })
};

let expectedTimerValue = 0;

function timerSubscription(state) {
    expect(state).toEqual({
        [TIMER]: {
            value: expectedTimerValue
        },
        tick: expect.any(Function)
    })
}

var subscription;

var timerSub;

const CLEAR_STATES = 'CLEAR_STATES';

function resetValue(value) {
    switch(typeof value) {
        case 'string':
            return '';
        case 'number':
            return 0;
        case 'object':
            if (value instanceof Array) {
                return []
            }
            for (const field in value) {
                value[field] = resetValue(value[field])
            }
            return value;
        default:
            return null
    }
}

use(function (store, statePromise, action) {
    return statePromise.then(state => {
        if (action.type === CLEAR_STATES) {
            action.payload.forEach(branch => {
                state[branch] = resetValue(state[branch])
            });

        }
        return state
    })
});

var listener;
var registerReducerSub;
var reducerListener;

describe('falx', () => {
    test('register subscription', () => {
        listener = jest.fn(registerListener);

        registerReducerSub = store.subscribe(listener);

        return register(REDUCER, reducer);
    });

    test('listener have been called', () => {
        const fn = state => {
            expect(state).toEqual({
                [REDUCER]: expectedState,
                setField: expect.any(Function),
                setFieldWithPromise: expect.any(Function),
            });
        };
        reducerListener = jest.fn(fn);
        subscription = subscribe(REDUCER, reducerListener);

        expect(listener).toHaveBeenCalled();

        registerReducerSub.unsubscribe();
    });

    it('initial states', () => {
        expect(store.getState()).toEqual({
            [REDUCER]: expectedState
        })
    });

    it('initial state for reducer', () => {
        expect(store[REDUCER]).toEqual({
            [REDUCER]: {
                [FIELD1]: 1,
                [FIELD2]: 2
            },
            setField: expect.any(Function),
            setFieldWithPromise: expect.any(Function),
        })
    });

    test('change field1', () => {
        const value = 'asd';
        expectedState[FIELD1] = value;
        return store[REDUCER].setField(FIELD1, value);
    });

    test('reducer listener have been called', () => {
        expect(reducerListener).toHaveBeenCalled()
    });

    test('change field1 with promise', () => {
        const value = 'asdasd';
        expectedState[FIELD1] = value;
        return store[REDUCER].setFieldWithPromise(FIELD1, value);
    });

    test('change field2', () => {
        const value = 'fgh';
        expectedState[FIELD2] = value;
        return store[REDUCER].setField(FIELD2, value);
    });

    it('final state', () => {
        expect(store[REDUCER]).toEqual({
            [REDUCER]: expectedState,
            setField: expect.any(Function),
            setFieldWithPromise: expect.any(Function),
        })
    });

    test('middleware1', () => {
        use(middleware1);
        expectedState[FIELD1] = middleware1valueChanged;
        return store[REDUCER].setField(FIELD1, middleware1value)
    });

    test('unsubscribe', () => {
        unuse(middleware1);
        subscription.unsubscribe();
        return store[REDUCER].setField(FIELD1, unsubscribedValue)
    });

    test('unsubscribed successfully', () => {
        expect(expectedState[FIELD1]).toEqual(middleware1valueChanged);
        expect(store[REDUCER][REDUCER][FIELD1]).toEqual(unsubscribedValue)
    });

    test('redux reducer', () => {
        use(reduxReducerMiddleware);
        return store[REDUCER].setField(FIELD2, '123')
    });

    test('redux reducer change value', () => {
        expect(store.getState()).toEqual({
            [REDUCER]: {
                [FIELD1]: unsubscribedValue,
                [FIELD2]: valueReducerChanged
            },
            counter: {
                value: 0
            }
        })
    });

    test('remove reducer', () => {
        unuse(reduxReducerMiddleware);
        return remove(REDUCER);
    });

    test('removed reducer state', () => {
        expect(store[REDUCER]).toEqual(undefined);
        expect(store.getState()).toEqual({
            counter: {
                value: 0
            }
        })
    });

    test('dispatch action', () => {
        use(counterReducerMiddleware);
        return store.dispatch({
            type: INCREASE_COUNTER
        })
    });

    test('increased value', () => {
        expect(store.getState()).toEqual({
            counter: {
                value: 1
            }
        })
    });

    test('timer tick', () => {
        register(TIMER, timerReducer);
        timerSub = subscribe(TIMER, timerSubscription);
        expectedTimerValue = 2;
        return store[TIMER].tick(2)
    });

    test('clear timer', () => {
        timerSub.unsubscribe();
        return store.dispatch({
            type: CLEAR_STATES,
            payload: [TIMER]
        })
    });

    test('timer reset', () => {
        expect(store.getState()).toEqual({
            [TIMER]: {
                value: 0
            },
            counter: {
                value: 1
            }
        })
    });

    test('todo app', () => {
        const reducer = {
            state: [],
            actions: {
                add(state, text) {
                    const todo = {
                        id: state.length + 1,
                        done: false,
                        text
                    };
                    return state.concat(todo)
                },
                done(state, id) {
                    return state.map(todo => {
                        if (todo.id == id) {
                            return ({
                                ...todo,
                                done: !todo.done
                            })
                        }
                        return todo
                    })
                },
                remove(state, id) {
                    return state.filter(todo => todo.id != id)
                }
            }
        };

        const TODOS = 'todos';

        const expectedTodos = [];

        register(TODOS, reducer);
        const listener = jest.fn(state => {
            expect(state.todos).toEqual(expectedTodos)
        });
        subscribe(TODOS, listener);
        expect(listener).toHaveBeenCalled();

        const todo1 = 'todo1';
        const todo2 = 'todo2';
        expectedTodos.push({
            id: 1,
            text: todo1,
            done: false
        });
        return store[TODOS].add(todo1).then(() => {
            expect(listener).toHaveBeenCalledTimes(2);
            expectedTodos.push({
                id: 2,
                text: todo2,
                done: false
            });
            return store[TODOS].add(todo2)
        }).then(() => {
            expect(listener).toHaveBeenCalledTimes(3);
            expectedTodos[0].done = true;
            return store[TODOS].done(1);
        }).then(() => {
            expect(listener).toHaveBeenCalledTimes(4);
            expectedTodos.splice(0, 1);
            return store[TODOS].remove(1);
        }).then(() => {
            expect(listener).toHaveBeenCalledTimes(5);
            expect(listener).toHaveBeenLastCalledWith({
                add: expect.any(Function),
                done: expect.any(Function),
                remove: expect.any(Function),
                todos: [
                    {
                        id: 2,
                        done: false,
                        text: todo2
                    }
                ]
            });
            expect(store[TODOS][TODOS]).toEqual(
                [
                    {
                        id: 2,
                        done: false,
                        text: todo2
                    }
                ]
            );
        });
    })
});