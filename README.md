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
import React, {PureComponent} from 'react'
import {subscribeHOC} from 'falx-react'


const reducer = {
    state: {
        value: 0
    },
    actions: {
        up(state) {
            return {
                ...state,
                value: state.value + 1
            }
        },
        down(state) {
            return {
                ...state,
                value: state.value - 1
            }
        }
    }
};

const COUNTER = 'counter';

register(COUNTER, reducer);

@subscribeHOC(COUNTER)
class Counter extends PureComponent {
    render() {
        return (
            <div>
                <div id="value">
                    {this.props.counter.value}
                </div>
                <button id="up" onClick={this.props.up} >up</button>
                <button id="down" onClick={this.props.down} >down</button>
            </div>
        )
    }
}
````
[falx-react](https://github.com/one-more/falx-react)

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
[falx-redux-devtools](https://github.com/one-more/falx-redux-devtools)

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
