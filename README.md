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
    state: [],
    actions: {
        add(state, text) {
          const todo = {
            id: getNextId(),
            done: false,
            text
          }
          return state.concat(todo)
        },
        done(state, id) {
            return state.map(todo => {
              if (todo.id == id) {
                return {
                  ...todo,
                  done: !todo.done
                }
              }
              return todo
            })
        },
        remove(state, id) {
            return state.filter(todo => todo.id != id)
        }
    }
}

const TODOS = 'todos';
const todoList = document.querySelector('#todos');

register(TODOS, reducer);
subscribe(TODOS, state => {
    const html = state.todos.map(todo => `
        <li ${todo.done ? 'class="completed"' : ''} >
          <div class="view">
            <input class="toggle" type="checkbox" id="${todo.id}" ${todo.done ? 'checked' : ''} />
            <label>${todo.text}</label>
            <button class="destroy" id="${todo.id}"></button>
          </div>
          <input class="edit" value="${todo.text}" />
        </li>
   `);
   todoList.innerHTML = html.join('')
});
````
[TodoApp demo](https://stackblitz.com/edit/typescript-iehr6d?file=index.ts)

## with React
````es6
import {PureComponent} from 'react'
import {store} from 'falx'

export function subscribeHOC(name, Component) {
    return class extends PureComponent {
        state = store[name];

        componentDidMount() {
            this.subscription = subscribe(name, nextState => {
                this.setState(nextState)
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

## connect redux devtools
````es6
import {connectDevtools} from 'falx-redux-devtools'


connectDevtools(
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);
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
#### getter
````es6
register('timer', reducer);
store.time.tick(2)
````
#### store.subscribe(cb: Function)
#### store.dispatch(action)
````es6
store.dispatch({
    type: 'ACTION_TYPE'
})
````

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

### remove(name: string)

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
