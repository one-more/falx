// @flow

import {BehaviorSubject} from './observable'
import words from 'lodash/_unicodeWords'
import {factory} from "./subscribe";
import type {Subscribe} from "./subscribe";

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
    getState: (name: string) => State | States,
    subscribe: Subscribe,
    dispatch: Function
}

export type Reducer = {
    state: any,
    actions: Actions
}

const states = {};

const subscriptions = [];

function getState(name?: string) {
    if (!name) {
        const state = {};
        for (const i in states) {
            state[i] = states[i].getValue()
        }
        return state
    }
    return {
        [name]: states[name].getValue(),
        ...actions[name]
    }
}

function dispatch(action: Action) {
    subscriptions.forEach(subscription => {
        subscription.cb(getState(), action)
    })
}

export let store: Store = {
    getState,
    subscribe: factory(subscriptions),
    dispatch
};

const actions = {};

let middlewares = [];

export function register(name: string, reducer: Reducer) {
    states[name] = new BehaviorSubject(reducer.state);
    actions[name] = {};
    Object.defineProperty(store, name, {
        get() {
            return store.getState(name)
        }
    });
    store.dispatch({
        type: 'REGISTER_REDUCER',
        payload: [reducer.state]
    });
    for (const actionName in reducer.actions) {
        actions[name][actionName] = function () {
            const nextState = Promise.resolve(
                reducer.actions[actionName].call(
                    null,
                    states[name].getValue(),
                    ...Array.from(arguments)
                )
            );
            const action: Action = {
                type: transformActionName(actionName),
                payload: Array.from(arguments)
            };
            return applyMiddlewares(nextState, action).then(value => {
                states[name].next(value, action);
                store.dispatch(action)
            })
        }
    }
}

export function subscribe(name: string, fn: Function) {
    return states[name].subscribe(nextState => {
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

export function enhanceStore(reducer: Function, enhancer: Function) {
    if (typeof enhancer !== 'undefined') {
        store = enhancer(enhanceStore)(reducer)
    }

    if (typeof reducer === 'function') {
        use(function(store, promise, action) {
            return promise.then(state => {
                return reducer(state, action)
            })
        });
    }

    return store
}