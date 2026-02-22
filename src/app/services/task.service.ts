import { HttpClient } from '@angular/common/http';
import { DestroyRef, Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BehaviorSubject, EMPTY, Observable, Subject, merge } from 'rxjs';
import { catchError, distinctUntilChanged, map, shareReplay, switchMap, tap } from 'rxjs/operators';
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

interface PaginationParams {
  page: number;
  perPage: number;
}

const EMPTY_RESPONSE: PaginatedResponse<Task> = {
  data: [],
  pages: 0,
  items: 0,
  first: 1,
  prev: null,
  next: null,
  last: 0
};

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);
  private readonly apiUrl = 'http://localhost:3000/tasks';

  private readonly paginationParams$ = new BehaviorSubject<PaginationParams>({ page: 1, perPage: 5 });
  private readonly tasksResponseSubject = new BehaviorSubject<PaginatedResponse<Task>>(EMPTY_RESPONSE);
  private readonly selectedTaskSubject = new BehaviorSubject<Task | null>(null);
  private readonly refreshTrigger$ = new Subject<void>();
  private readonly errorSubject = new BehaviorSubject<string | null>(null);

  readonly error$ = this.errorSubject.asObservable();
  readonly tasks$ = this.tasksResponseSubject.pipe(map(r => r.data));
  readonly currentPage$ = this.paginationParams$.pipe(map(p => p.page), distinctUntilChanged());
  readonly totalPages$ = this.tasksResponseSubject.pipe(map(r => r.pages), distinctUntilChanged());
  readonly totalItems$ = this.tasksResponseSubject.pipe(map(r => r.items), distinctUntilChanged());
  readonly selectedTask$ = this.selectedTaskSubject.asObservable();

  constructor() {
    merge(
      this.paginationParams$.pipe(
        distinctUntilChanged((a, b) => a.page === b.page && a.perPage === b.perPage)
      ),
      this.refreshTrigger$
    ).pipe(
      switchMap(() => {
        this.errorSubject.next(null);
        const params = this.paginationParams$.value;
        return this.http.get<PaginatedResponse<Task>>(
          `${this.apiUrl}?_page=${params.page}&_per_page=${params.perPage}`
        ).pipe(
          catchError(() => {
            this.errorSubject.next('Failed to load tasks. Please try again later.');
            return EMPTY;
          })
        );
      }),
      tap(response => this.tasksResponseSubject.next(response)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }

  loadTasks(page?: number, perPage?: number): void {
    const current = this.paginationParams$.value;
    this.paginationParams$.next({
      page: page ?? current.page,
      perPage: perPage ?? current.perPage
    });
  }

  nextPage(): void {
    const current = this.paginationParams$.value;
    const totalPages = this.tasksResponseSubject.value.pages;
    if (current.page < totalPages) {
      this.paginationParams$.next({ ...current, page: current.page + 1 });
    }
  }

  previousPage(): void {
    const current = this.paginationParams$.value;
    if (current.page > 1) {
      this.paginationParams$.next({ ...current, page: current.page - 1 });
    }
  }

  goToPage(page: number): void {
    const current = this.paginationParams$.value;
    this.paginationParams$.next({ ...current, page });
  }

  getTask(id: string): Observable<Task> {
    this.errorSubject.next(null);
    return this.http.get<Task>(`${this.apiUrl}/${id}`).pipe(
      tap(task => this.selectedTaskSubject.next(task)),
      catchError(() => {
        this.errorSubject.next('Failed to load task. Please try again later.');
        return EMPTY;
      }),
      shareReplay(1)
    );
  }

  createTask(task: Task): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, task).pipe(
      tap(() => this.refreshTrigger$.next())
    );
  }

  updateTask(task: Task): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/${task.id}`, task).pipe(
      tap(saved => {
        // Update selectedTask if it matches
        const current = this.selectedTaskSubject.value;
        if (current && current.id === saved.id) {
          this.selectedTaskSubject.next(saved);
        }

        // Update task inline in the tasks list
        const response = this.tasksResponseSubject.value;
        const updatedData = response.data.map(t => t.id === saved.id ? saved : t);
        this.tasksResponseSubject.next({ ...response, data: updatedData });
      })
    );
  }
}
