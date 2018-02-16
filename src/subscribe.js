// @flow

export type Subscribe = (cb: Function) => Subscription;

export type Subscription = {
    cb: Function,
    unsubscribe: Function
}

export function factory(subscriptions: Array<Subscription>) {
    function subscribe(cb: Function) {
        const subscription: Subscription = {
            cb,
            unsubscribe: () => {
                const index = subscriptions.indexOf(subscription);
                subscriptions.splice(index, 1)
            }
        };
        subscriptions.push(subscription);
        return subscription
    }
    function callSubscriptions() {
        subscriptions.forEach(sub => {
            sub.cb.apply(null, arguments)
        })
    }
    return {
        subscribe,
        callSubscriptions
    }
}