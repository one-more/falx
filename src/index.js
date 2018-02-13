// @flow

import {BehaviorSubject} from './observable'
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

const state = {};

function getState() {
    return state
}

function getStateByName(name: string) {
    return {
        [name]: states[name].getValue(),
        ...actions[name]
    }
}

function dispatch(action: Action): Promise<Action> {
    const nextStatePromise = Promise.resolve({
        ...state
    });
    return applyMiddlewares(nextStatePromise, action).then(nextState => {
        if(shallowDiffers(state, nextState)) {
            applyNextState(nextState)
        }
        callSubscriptions(action);
        return action
    })
}

function callSubscriptions(action: Action) {
    subscriptions.forEach(subscription => {
        subscription.cb(getState(), action)
    });
}

export const store: Store = {
    getState,
    subscribe: factory(subscriptions),
    dispatch
};

const actions = {};

const middlewares = [];

function defineGetter(name: string) {
    Object.defineProperty(store, name, {
        get() {
            return getStateByName(name)
        },
        configurable: true
    });
}

export function register(name: string, reducer: Reducer) {
    states[name] = new BehaviorSubject(reducer.state);
    state[name] = reducer.state;
    actions[name] = {};
    defineGetter(name);
    for (const actionName in reducer.actions) {
        actions[name][actionName] = function () {
            const nextStatePromise = Promise.resolve(
                reducer.actions[actionName].call(
                    null,
                    states[name].getValue(),
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
                callSubscriptions(action)
            })
        }
    }
    return dispatch({
        type: 'REGISTER_REDUCER',
        payload: name
    });
}

export function remove(name: string) {
    delete states[name];
    delete state[name];
    delete actions[name];
    delete store[name];
    return dispatch({
        type: 'REMOVE_REDUCER',
        payload: name
    })
}

function applyNextState(nextState: State) {
    for (const i in states) {
        if (shallowDiffers(nextState[i], states[i].getValue())) {
            states[i].next(nextState[i])
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
    callFn(store[name][name]);
    return states[name].subscribe(callFn)
}

export function use(middleware: Function) {
    middlewares.push(middleware)
}

export function unuse(middleware: Function) {
    const index = middlewares.indexOf(middleware);
    middlewares.splice(index, 1)
}

function applyMiddlewares(statePromise: Promise<any>, action: Action): Promise<any> {
    return middlewares.reduce((promise, middleware, i) => {
        return promise.then(value => {
            return middleware(store, Promise.resolve(value), action)
        })
    }, Promise.resolve(statePromise))
}