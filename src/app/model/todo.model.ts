import { Observable } from 'rxjs';

export interface Todo {
  id: number;
  userId: number;
  title: string;
  completed: boolean;
}
export type RequestMap = { [key: string]: Observable<Todo[]> };
