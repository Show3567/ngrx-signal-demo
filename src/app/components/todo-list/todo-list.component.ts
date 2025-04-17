import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TodoService } from '../../services/todo.service';
import { catchError, ignoreElements, of } from 'rxjs';
import { Todo } from '../../model/todo.model';
import { TodoItemComponent } from '../todo-item/todo-item.component';
import { AsyncPipe, JsonPipe } from '@angular/common';

@Component({
  selector: 'app-todo-list',
  imports: [FormsModule, TodoItemComponent, JsonPipe, AsyncPipe],
  templateUrl: './todo-list.component.html',
  styleUrl: './todo-list.component.scss',
})
export class TodoListComponent {
  private todoService = inject(TodoService);

  todos$ = this.todoService.todolist$;
  todosErr$ = this.todos$.pipe(
    ignoreElements(), // only pass complete and error;
    catchError((err) => {
      return of('this is an err can be catch by async');
    })
  ); // handle error in async pipe

  todo: Todo = {
    userId: 34,
    title: '',
    completed: false,
  } as Todo;

  ngOnInit(): void {
    this.todoService.getTodos().subscribe(console.log, (err) => {
      console.log(err);
    });
    // console.log(this.todoService.currentTodoList);
  }

  deleteTodo(id: number) {
    this.todoService.deleteTodo(id).subscribe();
    // console.log(this.todoService.currentTodoList);
  }

  addTodo() {
    if (this.todo.title.trim() !== '') {
      this.todoService.addTodo(this.todo).subscribe();
    }
  }

  sendNewRequest() {
    this.todoService.getTodos().subscribe({
      next: (v) => {},
      error: (e) => {},
      complete: () => {},
    });
  }
}
