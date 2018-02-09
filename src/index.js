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

let state = {};

function getState() {
    return state
}

function getStateByName(name: string) {
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

function defineGetter(name: string) {
    Object.defineProperty(store, name, {
        get() {
            return getStateByName(name)
        }
    });
}

export function register(name: string, reducer: Reducer) {
    states[name] = new BehaviorSubject(reducer.state);
    state[name] = reducer.state;
    actions[name] = {};
    defineGetter(name);
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
            ).then(value => {
                state[name] = value;
                return state
            });
            const action: Action = {
                type: transformActionName(actionName),
                payload: Array.from(arguments)
            };
            return applyMiddlewares(nextState, action).then(state => {
                for (const i in states) {
                    if (shallowDiffers(state[i], states[i].getValue())) {
                        states[i].next(state[i], action);
                    }
                }
                store.dispatch(action)
            })
        }
    }
}

function shallowDiffers (a, b) {
    if(typeof a != typeof b) return true;
    if (typeof a != 'object') return a == b;
    for (let i in a) if (!(i in b)) return true;
    for (let i in b) if (a[i] !== b[i]) return true;
    return false
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
        store = enhancer(enhanceStore)(reducer);
        defineGetters()
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

function defineGetters() {
    for (const name in states) {
        defineGetter(name)
    }
}