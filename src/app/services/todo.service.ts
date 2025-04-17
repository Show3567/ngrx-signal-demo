import { Inject, inject, Injectable } from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  mergeMap,
  Observable,
  retry,
  shareReplay,
  tap,
  throwError,
} from 'rxjs';
import { RequestMap, Todo } from '../model/todo.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class TodoService {
  private readonly baseUrl = 'https://jsonplaceholder.typicode.com';
  private readonly todoPath = 'todos';
  private requestMap: RequestMap = {};
  private todos$ = new BehaviorSubject<Todo[]>([]);
  private readonly http = inject(HttpClient);
  todolist$ = this.todos$.asObservable();

  get currentTodoList() {
    return this.todos$.value;
  }

  getTodos(): Observable<Todo[]> {
    const url = [this.baseUrl, this.todoPath].join('/');
    if (!this.requestMap[url]) {
      this.requestMap[url] = this.http.get<Todo[]>(url).pipe(
        tap((todos: Todo[]) => {
          this.todos$.next(todos.reverse());
        }),
        shareReplay(1), // what is shareReplay
        catchError((err) => {
          // console.log('got an error: ', err);
          return throwError(() => 'err');
        })
      );
    }
    return this.requestMap[url];
  }

  deleteTodo(id: number): Observable<null> {
    const todos = this.todos$.value.filter((todo) => +todo.id !== +id);
    this.todos$.next(todos);

    return this.http
      .delete<null>([this.baseUrl, this.todoPath, id].join('/'))
      .pipe(
        mergeMap((_) => {
          return throwError(() => 'err');
        }),
        retry(4) // if error, retry this obs;
      );
  }

  addTodo(todo: Todo): Observable<Todo | string> {
    return this.http
      .post<Todo>([this.baseUrl, this.todoPath].join('/'), todo)
      .pipe(
        tap((todo: Todo) => {
          const findTodo = this.todos$.value.find(
            (ele) => todo.title === ele.title
          );
          const todos = findTodo
            ? this.todos$.value
            : [todo, ...this.todos$.value];

          this.todos$.next(todos);
        }),
        catchError((err) => {
          return throwError(() => err);
        })
      );
  }
}
