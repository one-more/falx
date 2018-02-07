# falx
single state management for JavaScript applications

## installation
````
npm i -S falx
````

## usage
```` es6
import {store, subscribe, register} from 'falx'

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
    store.getState('timer').reset();
});

setInterval(() => {
    store.getState('timer').tick();
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

## API

### store
#### store.getState(name?: string)

### subscribe(name: string, cb: Function)

### unsubscribe()
````
const subscription = subscribe('timer', reducer);
subscription.unsubscribe()
````

### register(name: string, reducer)
````
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