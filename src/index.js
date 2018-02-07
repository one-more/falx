// @flow

import {BehaviorSubject} from 'rxjs/BehaviorSubject'

export type Actions = {
    [name: string]: Function
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

export function register(name: string, reducer: Reducer) {
    store.states[name] = new BehaviorSubject(reducer.state);
    actions[name] = {};
    for (const actionName in reducer.actions) {
        actions[name][actionName] = function () {
            const nextState = Promise.resolve(
                reducer.actions[actionName].call(null, store.states[name].getValue(), ...arguments)
            );
            return nextState.then(value => {
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