import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Task } from '../models/task.model';

export interface PaginatedResponse<T> {
  data: T[];
  pages: number;
  items: number;
  first: number;
  prev: number | null;
  next: number | null;
  last: number;
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/tasks';

  getTasks(page: number, perPage: number = 5): Observable<PaginatedResponse<Task>> {
    return this.http.get<PaginatedResponse<Task>>(
      `${this.apiUrl}?_page=${page}&_per_page=${perPage}`
    );
  }

  createTask(task: Task): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, task);
  }

  updateTask(task: Task): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/${task.id}`, task);
  }
}
