import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { TaskDetailComponent } from './task-detail.component';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task.model';
import { BehaviorSubject, of } from 'rxjs';

describe('TaskDetailComponent', () => {
  let component: TaskDetailComponent;
  let fixture: ComponentFixture<TaskDetailComponent>;
  let taskServiceSpy: jasmine.SpyObj<TaskService>;
  let selectedTaskSubject: BehaviorSubject<Task | null>;
  let errorSubject: BehaviorSubject<string | null>;

  const mockTask: Task = {
    id: '1',
    title: 'Test Task',
    description: 'A task for testing',
    dueDate: '2024-01-15',
    completed: false,
    stateHistory: [
      { state: 'new', date: '2024-01-01' },
      { state: 'active', date: '2024-01-05' }
    ],
    notes: ['Note one', 'Note two']
  };

  beforeEach(async () => {
    selectedTaskSubject = new BehaviorSubject<Task | null>(null);
    errorSubject = new BehaviorSubject<string | null>(null);

    taskServiceSpy = jasmine.createSpyObj('TaskService', ['getTask'], {
      selectedTask$: selectedTaskSubject.asObservable(),
      error$: errorSubject.asObservable()
    });
    taskServiceSpy.getTask.and.callFake(() => {
      selectedTaskSubject.next(mockTask);
      return of(mockTask);
    });

    await TestBed.configureTestingModule({
      imports: [TaskDetailComponent],
      providers: [
        { provide: TaskService, useValue: taskServiceSpy },
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => '1' } } }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getTask with id from route', () => {
    expect(taskServiceSpy.getTask).toHaveBeenCalledWith('1');
  });

  it('should render the task title', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.task-detail__title')?.textContent).toContain('Test Task');
  });

  it('should render the task description', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.task-detail__description')?.textContent).toContain('A task for testing');
  });

  it('should render the current state badge', () => {
    const badge = fixture.nativeElement.querySelector('.task-detail__state-badge');
    expect(badge?.textContent?.trim()).toBe('active');
    expect(badge?.getAttribute('data-state')).toBe('active');
  });

  it('should render state history entries', () => {
    const historyItems = fixture.nativeElement.querySelectorAll('.task-detail__history-item');
    expect(historyItems.length).toBe(2);
  });

  it('should render notes', () => {
    const notes = fixture.nativeElement.querySelectorAll('.task-detail__notes-list li');
    expect(notes.length).toBe(2);
    expect(notes[0].textContent).toContain('Note one');
    expect(notes[1].textContent).toContain('Note two');
  });

  it('should render back to list link', () => {
    const backLink = fixture.nativeElement.querySelector('.task-detail__back') as HTMLAnchorElement;
    expect(backLink).toBeTruthy();
    expect(backLink.getAttribute('href')).toBe('/tasks');
  });

  it('should show loading state when task is null', () => {
    selectedTaskSubject.next(null);
    fixture.detectChanges();
    const loading = fixture.nativeElement.querySelector('.task-detail--loading');
    expect(loading).toBeTruthy();
    expect(loading.textContent).toContain('Loading task...');
  });

  it('should render completed status', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.task-detail__completed')?.textContent).toContain('Incomplete');
  });

  it('should render "Completed" when task is completed', () => {
    selectedTaskSubject.next({ ...mockTask, completed: true });
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.task-detail__completed')?.textContent).toContain('Completed');
  });

  it('should render error state instead of loading when error$ has value', () => {
    selectedTaskSubject.next(null);
    errorSubject.next('Failed to load task. Please try again later.');
    fixture.detectChanges();

    const errorEl = fixture.nativeElement.querySelector('.task-detail__error');
    expect(errorEl).toBeTruthy();
    expect(errorEl.textContent).toContain('Failed to load task');
    expect(errorEl.getAttribute('role')).toBe('alert');

    const loading = fixture.nativeElement.querySelector('.task-detail--loading');
    expect(loading).toBeNull();
  });
});
