// @flow

type Subscription = {
    cb: Function,
    unsubscribe: Function
}

export class BehaviorSubject {
    constructor(value: any) {
        this.value = value
    }

    value = undefined;

    getValue = () => {
        return this.value
    };

    subscriptions = [];

    subscribe(cb: Function) {
        const subscription: Subscription = {
            cb,
            unsubscribe: () => {
                this.subscriptions = this.subscriptions.filter(el => {
                    return el != subscription
                })
            }
        };
        this.subscriptions.push(subscription);
        return subscription
    }

    next = (value: any) => {
        this.value = value;
        this.subscriptions.forEach((subscription: Subscription) => {
            subscription.cb(value)
        })
    }
}