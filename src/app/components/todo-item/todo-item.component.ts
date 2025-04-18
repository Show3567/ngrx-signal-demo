import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Todo } from '../../model/todo.model';
import { NgStyle } from '@angular/common';

@Component({
  selector: 'app-todo-item',
  imports: [NgStyle],
  templateUrl: './todo-item.component.html',
  styleUrl: './todo-item.component.scss',
})
export class TodoItemComponent {
  @Input() todo!: Todo;
  @Output() idemiter = new EventEmitter();
  @Output() toggleComplete = new EventEmitter();

  getId() {
    this.idemiter.emit(this.todo.id);
  }
  updateComplete() {
    this.toggleComplete.emit({
      id: this.todo.id,
      completed: this.todo.completed,
    });
  }
}
