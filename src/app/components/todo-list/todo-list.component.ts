import {
  Component,
  computed,
  inject,
  model,
  OnInit,
  signal,
} from '@angular/core';
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
  newTodo = computed(() => ({
    title: this.title(),
    userId: 45,
    completed: false,
  }));

  ngOnInit(): void {
    this.store.loadTodosOnLine();
  }

  async loadTodos() {
    return await this.store.loadAll();
  }
  addTodo() {
    this.store.addTodo(this.newTodo());
  }
}
