import { computed, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import {
  distinctUntilChanged,
  interval,
  map,
  pipe,
  switchMap,
  tap,
} from 'rxjs';

import { Todo } from '../model/todo.model';
import { TodoService } from '../services/todo.service';

export type TodoFilter = 'all' | 'pending' | 'completed';
type TodoState = {
  todos: Todo[];
  loading: boolean;
  filter: TodoFilter;
};

const initialState: TodoState = {
  todos: [],
  loading: false,
  filter: 'all',
};

export const TodoStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  // withProps(() => ({
  //   todosService: inject(TodoService),
  // })),
  withMethods((store, todosService = inject(TodoService)) => ({
    // withMethods((store) => ({
    loadAll: async () => {
      patchState(store, { loading: true });
      const todos = await fetch(todosService.url).then((res) => res.json());
      patchState(store, { todos, loading: false });
    },
    loadTodosOnLine: rxMethod<void>(
      pipe(
        distinctUntilChanged(),
        tap(() => patchState(store, { loading: true })),
        switchMap(() => {
          return todosService.getTodoList();
        }),
        tapResponse({
          next: (todos) => patchState(store, { todos, loading: false }),
          error: (err: HttpErrorResponse) => console.error(err),
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
          (err: HttpErrorResponse) => console.error(err),
          () => patchState(store, { loading: false })
        )
      )
    ),
    deleteTodo: rxMethod<number>(
      pipe(
        distinctUntilChanged(),
        tap(() => patchState(store, { loading: true })),
        switchMap((id) => {
          return todosService.deleteTodo(id).pipe(map((_) => id));
        }),
        tapResponse(
          (id) =>
            patchState(store, (state) => {
              return {
                ...state,
                loading: false,
                todos: state.todos.filter((t) => +t.id !== +id),
              } as TodoState;
            }),
          (err: HttpErrorResponse) => console.error(err),
          () => patchState(store, { loading: false })
        )
      )
    ),
    toggleComplete: ({ id, completed }: { id: number; completed: boolean }) => {
      patchState(store, (state) => ({
        ...state,
        todos: state.todos.map((t) =>
          t.id === id ? { ...t, completed: !completed } : t
        ),
      }));
    },
    selectTodos: (filter: TodoFilter) => {
      patchState(store, (state) => ({ ...state, filter }));
    },
  })),
  withComputed((state) => ({
    filteredTodos: computed(() => {
      const todos = state.todos();

      switch (state.filter()) {
        case 'completed':
          return todos.filter((todo) => todo.completed);
        case 'pending':
          return todos.filter((todo) => !todo.completed);
        case 'all':
          return todos;
      }
    }),
  }))
  // withHooks({
  //   onInit(store) {
  //     // 👇 Increment the `count` every 2 seconds.
  //     interval(2_000)
  //       // 👇 Automatically unsubscribe when the store is destroyed.
  //       .pipe(takeUntilDestroyed())
  //       .subscribe(() => console.log('hello ngrx store'));
  //   },
  //   onDestroy(store) {
  //     console.log('count on destroy');
  //   },
  // })
);
