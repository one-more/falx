// @flow

export type Subscribe = (cb: Function) => Subscription;

export type Subscription = {
    cb: Function,
    unsubscribe: Function
}

export function factory(subscriptions: Array<Subscription>) {
    return function subscribe(cb: Function) {
        const subscription: Subscription = {
            cb,
            unsubscribe: () => {
                this.subscriptions = this.subscriptions.filter(el => {
                    return el != subscription
                })
            }
        };
        subscriptions.push(subscription);
        return subscription
    }
}