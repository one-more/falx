// @flow

import {factory} from "./subscribe"
import type {Subscribe} from "./subscribe"
import {shallowDiffers} from './shallow-differs'

export type Actions = {
    [name: string]: Function
}

export type Action = {
    type: string,
    payload: any
}

export type State = {
    [name: string]: any,
    actions: Actions
}

export type Store = {
    getState: () => State,
    subscribe: Subscribe,
    dispatch: Function,
    callSubscriptions: Function
}

export type Reducer = {
    state: any,
    actions: Actions
}

const state = {};

const listeners = {};

function getState() {
    return state
}

function getStateByName(name: string) {
    return {
        [name]: state[name],
        ...actions[name]
    }
}

function dispatch(action: Action): Promise<Action> {
    const nextStatePromise = Promise.resolve({...state});
    return applyMiddlewares(nextStatePromise, action).then(nextState => {
        if(shallowDiffers(state, nextState)) {
            applyNextState(nextState)
        }
        store.callSubscriptions(getState(), action);
        return action
    })
}

export const store: Store = {
    getState,
    dispatch,
    ...factory([])
};

const actions = {};

const middlewares = [];

export function register(name: string, reducer: Reducer) {
    state[name] = reducer.state;
    actions[name] = {};
    listeners[name] = factory([]);
    Object.defineProperty(store, name, {
        get() { return getStateByName(name) },
        configurable: true
    });
    for (const actionName in reducer.actions) {
        actions[name][actionName] = function () {
            const nextStatePromise = Promise.resolve(
                reducer.actions[actionName].call(
                    null,
                    state[name],
                    ...Array.from(arguments)
                )
            ).then(value => {
                return {
                    ...state,
                    [name]: value
                }
            });
            const action: Action = {
                type: actionName,
                payload: Array.from(arguments)
            };
            return applyMiddlewares(nextStatePromise, action).then(nextState => {
                applyNextState(nextState);
                store.callSubscriptions(getState(), action)
            })
        }
    }
    return dispatch({
        type: 'REGISTER_REDUCER',
        payload: name
    });
}

export function remove(name: string) {
    delete state[name];
    delete actions[name];
    delete store[name];
    return dispatch({
        type: 'REMOVE_REDUCER',
        payload: name
    })
}

function applyNextState(nextState: State) {
    for (const i in listeners) {
        if (shallowDiffers(nextState[i], state[i])) {
            listeners[i].callSubscriptions(nextState[i])
        }
    }
    Object.assign(state, nextState);
}

export function subscribe(name: string, fn: Function) {
    const callFn = nextState => {
        fn({
            [name]: nextState,
            ...actions[name]
        })
    };
    callFn(state[name]);
    return listeners[name].subscribe(callFn)
}

export function use(middleware: Function) {
    middlewares.push(middleware)
}

export function unuse(middleware: Function) {
    const index = middlewares.indexOf(middleware);
    middlewares.splice(index, 1)
}

function applyMiddlewares(statePromise: Promise<any>, action: Action): Promise<any> {
    return middlewares.reduce((promise, middleware) => {
        return promise.then(value => {
            return middleware(store, Promise.resolve(value), action)
        })
    }, Promise.resolve(statePromise))
}