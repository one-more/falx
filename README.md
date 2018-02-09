# falx
single state management for JavaScript applications

## installation
````
npm i -S falx
````

## usage
````es6
import {store, subscribe, register} from 'falx'

const reducer = {
    state: {
        value: 0
    },
    actions: {
        tick(state, inc = 1) {
            return {
                ...state,
                value: state.value + inc
            }
        },
        reset(state) {
            return {
                ...state,
                value: 0
            }
        }
    }
}

register('timer', reducer);

const $timer = document.querySelector('#timer');
const $resetBtn = document.querySelector('#reset-btn');

$resetBtn.addEventListener('click', () => {
    store.timer.reset();
});

setInterval(() => {
    store.timer.tick();
}, 1000)

subscribe('timer', state => {
    $timer.innerHTML = state.timer.value;
});

// with React

function subscribeHOC(name, Component) {
    return class extends PureComponent {
        state = store.getState(name);

        componentDidMount() {
            this.subscription = subscribe(name, nextState => {
                this.setState({
                    ...nextState
                })
            });
        }

        componentWillUnmount() {
            this.subscription.unsubscribe()
        }

        render() {
            return (
                <Component {...this.props} {...this.state} />
            )
        }
    }
}

function Timer(props) {
    return (
        <div>
            <div>
                {props.timer.value}
            </div>
            <button onClick={props.reset} >
                reset
            </button>
        </div>
    )
}

subscriptionHOC('timer', Timer)

````

## async actions
to make action async just return promise
````es6
const reducer = {
    state: {
        value: 0
    },
    actions: {
        tick(state, inc = 1) {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve({
                        ...state,
                        value: state.value + inc
                    })
                }, 100)
            })
        }
    }
}
````

## middleware
````es6
import {use} from 'falx'
const middleware = (store, statePromise, action) => {
    console.log('action', action);
    return statePromise.then(state => {
        console.log('next state', state);
        return state
    })
}
````

## API

### store
#### store.getState()
#### getter - store.reducerName
#### subscribe(cb: Function)

### subscribe(name: string, cb: Function)

### unsubscribe()
````es6
const subscription = subscribe('timer', reducer);
subscription.unsubscribe()
````

### register(name: string, reducer)
````es6
const reducer = {
    state: {
        value: 0
    },
    actions: {
        tick(state) {
            return {
                ...state,
                value: state.value + 1
            }
        }
    }
}
````

### use(middleware: Function)
````es6
const middleware = (store, statePromise, action) => {
    console.log('action', action);
    return statePromise.then(state => {
        console.log('next state', state);
        return state
    })
}
````

### unuse(middleware: Function)