import { inject, Injectable } from '@angular/core';
import { mockTodos } from '../model/mock.data';
import { HttpClient } from '@angular/common/http';
import { Todo } from '../model/todo.model';

async function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

@Injectable({
  providedIn: 'root',
})
export class TodoService {
  private http = inject(HttpClient);
  private url = 'https://jsonplaceholder.typicode.com/todos';

  async getTodos() {
    await sleep(1000);
    return mockTodos;
  }

  getTodoList() {
    return this.http.get<Todo[]>(this.url);
  }
  addTodo(todo: Partial<Todo>) {
    return this.http.post(this.url, todo);
  }
}
