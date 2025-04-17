import { Component, inject, model, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { TodoItemComponent } from '../todo-item/todo-item.component';
import { TodoStore } from '../../store/todo.store';

@Component({
  selector: 'app-todo-list',
  imports: [FormsModule, TodoItemComponent],
  templateUrl: './todo-list.component.html',
  styleUrl: './todo-list.component.scss',
})
export class TodoListComponent implements OnInit {
  store = inject(TodoStore);
  title = signal<string>('');
  newtodo: any;

  ngOnInit(): void {
    this.store.loadTodosOnLine();
    // this.loadTodos().then(() => console.log('Todos Loaded!'));
  }

  async loadTodos() {
    return await this.store.loadAll();
  }
  addTodo() {
    this.store.addTodo({ title: this.title(), userId: 45, completed: false });
  }
}
