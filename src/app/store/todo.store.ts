import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { tapResponse } from '@ngrx/operators';
import { rxMethod } from '@ngrx/signals/rxjs-interop';

import { Todo } from '../model/todo.model';
import { TodoService } from '../services/todo.service';
import {
  catchError,
  distinctUntilChanged,
  map,
  of,
  pipe,
  switchMap,
  tap,
} from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

export type TodoFilter = 'all' | 'pending' | 'completed';
type TodoState = { todos: Todo[]; loading: boolean; filter: TodoFilter };

const initialState: TodoState = {
  todos: [],
  loading: false,
  filter: 'all',
};

export const TodoStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, todosService = inject(TodoService)) => ({
    loadAll: async () => {
      patchState(store, { loading: true });
      // const todos = await todosService.getTodos();
      const todos = await fetch(
        'https://jsonplaceholder.typicode.com/todos'
      ).then((res) => res.json());
      patchState(store, { todos, loading: false });
    },
    loadTodosOnLine: rxMethod<void>(
      pipe(
        distinctUntilChanged(),
        tap(() => patchState(store, { loading: true })),
        switchMap(() => {
          return todosService.getTodoList();
        }),
        // map((todos: Todo[]) => {
        //   return patchState(store, { todos, loading: false });
        // }),
        // catchError((err) => {
        //   patchState(store, { loading: false });
        //   return of(err);
        // })
        tapResponse({
          next: (todos) => patchState(store, { todos, loading: false }),
          error: console.error,
          finalize: () => patchState(store, { loading: false }),
        })
      )
    ),
    addTodo: rxMethod<Partial<Todo>>(
      pipe(
        distinctUntilChanged(),
        tap(() => patchState(store, { loading: true })),
        switchMap((todo) => {
          return todosService.addTodo(todo);
        }),
        tapResponse(
          (todo) =>
            patchState(store, (state) => {
              return {
                loading: false,
                todos: [todo, ...state.todos],
              } as TodoState;
            }),
          console.error,
          () => patchState(store, { loading: false })
        )
      )
    ),
  }))
);
