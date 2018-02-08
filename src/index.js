// @flow

import {BehaviorSubject} from './observable'
import words from 'lodash/_unicodeWords'

export type Actions = {
    [name: string]: Function
}

export type Action = {
    type: string,
    payload: Array<any>
}

export type State = {
    [name: string]: any,
    actions: Actions
}

export type States = {
    [name: string]: State
}

export type Store = {
    states: Object,
    getState: (name: string) => State | States
}

export type Reducer = {
    state: any,
    actions: Actions
}

export const store: Store = {
    states: {},
    getState(name: string) {
        if (!name) {
            const state = {};
            for (const i in store.states) {
                state[i] = {
                    [i]: store.states[i].getValue(),
                    ...actions[i]
                }
            }
            return state
        }
        return {
            [name]: store.states[name].getValue(),
            ...actions[name]
        }
    }
};

const actions = {};

let middlewares = [];

export function register(name: string, reducer: Reducer) {
    store.states[name] = new BehaviorSubject(reducer.state);
    actions[name] = {};
    Object.defineProperty(store, name, {
        get() {
            return store.getState(name)
        }
    });
    for (const actionName in reducer.actions) {
        actions[name][actionName] = function () {
            const nextState = Promise.resolve(
                reducer.actions[actionName].call(
                    null,
                    store.states[name].getValue(),
                    ...Array.from(arguments)
                )
            );
            const action: Action = {
                type: transformActionName(actionName),
                payload: Array.from(arguments),
                branch: name
            };
            return applyMiddlewares(nextState, action).then(value => {
                store.states[name].next(value)
            })
        }
    }
}

export function subscribe(name: string, fn: Function) {
    return store.states[name].subscribe(nextState => {
        fn({
            [name]: nextState,
            ...actions[name]
        })
    })
}

export function use(middleware: Function) {
    middlewares.push(middleware)
}

export function unuse(middleware: Function) {
    middlewares = middlewares.filter(el => {
        return el != middleware
    })
}

function applyMiddlewares(statePromise: Promise<any>, action: Action): Promise<any> {
    return middlewares.reduce((promise, middleware) => {
        return promise.then(value => {
            return middleware(store, Promise.resolve(value), action)
        })
    }, Promise.resolve(statePromise))
}

const transformActionName = (name: string) => words(name).map(s => s.toUpperCase()).join('_');

export function reduxReducerMiddleware(reducer: Function): Function {
    return (store: Store, statePromise: Promise<any>, action: Action) => {
        return statePromise.then((state: any) => {
            return reducer(state, action)
        })
    }
}