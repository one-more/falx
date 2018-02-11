// @flow

import {factory} from "./subscribe";

export class BehaviorSubject {
    constructor(value: any) {
        this.value = value
    }

    value = undefined;

    getValue = () => {
        return this.value
    };

    subscriptions = [];

    subscribe = factory(this.subscriptions);

    next = (value: any) => {
        this.value = value;
        this.subscriptions.forEach(subscription => {
            subscription.cb(value)
        })
    }
}