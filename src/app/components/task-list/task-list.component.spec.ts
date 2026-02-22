import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TaskListComponent } from './task-list.component';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task.model';
import { BehaviorSubject, of } from 'rxjs';

describe('TaskListComponent', () => {
  let component: TaskListComponent;
  let fixture: ComponentFixture<TaskListComponent>;
  let taskServiceSpy: jasmine.SpyObj<TaskService>;

  let tasksSubject: BehaviorSubject<Task[]>;
  let currentPageSubject: BehaviorSubject<number>;
  let totalPagesSubject: BehaviorSubject<number>;
  let totalItemsSubject: BehaviorSubject<number>;

  const mockTasks: Task[] = [
    {
      id: '1',
      title: 'Task 1',
      description: 'Description 1',
      dueDate: '2024-01-15',
      completed: false,
      stateHistory: [{ state: 'active', date: '2024-01-01' }],
      notes: []
    },
    {
      id: '2',
      title: 'Task 2',
      description: 'Description 2',
      dueDate: '2024-01-20',
      completed: true,
      stateHistory: [{ state: 'resolved', date: '2024-01-10' }],
      notes: ['A note']
    }
  ];

  beforeEach(async () => {
    tasksSubject = new BehaviorSubject<Task[]>(mockTasks);
    currentPageSubject = new BehaviorSubject<number>(1);
    totalPagesSubject = new BehaviorSubject<number>(2);
    totalItemsSubject = new BehaviorSubject<number>(7);

    taskServiceSpy = jasmine.createSpyObj('TaskService',
      ['loadTasks', 'nextPage', 'previousPage', 'goToPage', 'updateTask', 'createTask'],
      {
        tasks$: tasksSubject.asObservable(),
        currentPage$: currentPageSubject.asObservable(),
        totalPages$: totalPagesSubject.asObservable(),
        totalItems$: totalItemsSubject.asObservable()
      }
    );

    await TestBed.configureTestingModule({
      imports: [TaskListComponent],
      providers: [
        { provide: TaskService, useValue: taskServiceSpy },
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render task list from mock data', () => {
    const taskCards = fixture.nativeElement.querySelectorAll('app-task');
    expect(taskCards.length).toBe(2);
  });

  it('should show pagination controls when multiple pages', () => {
    const pagination = fixture.nativeElement.querySelector('.task-list__pagination');
    expect(pagination).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.task-list__pagination-info')?.textContent).toContain('Page 1 of 2');
  });

  it('should hide pagination controls when single page', () => {
    totalPagesSubject.next(1);
    fixture.detectChanges();
    const pagination = fixture.nativeElement.querySelector('.task-list__pagination');
    expect(pagination).toBeNull();
  });

  it('should disable Previous button on first page', () => {
    const prevBtn = fixture.nativeElement.querySelector('.task-list__pagination-btn:first-child') as HTMLButtonElement;
    expect(prevBtn.disabled).toBeTrue();
  });

  it('should enable Next button when there are more pages', () => {
    const nextBtn = fixture.nativeElement.querySelector('.task-list__pagination-btn:last-child') as HTMLButtonElement;
    expect(nextBtn.disabled).toBeFalse();
  });

  it('should disable Next button on last page', () => {
    currentPageSubject.next(2);
    fixture.detectChanges();
    const nextBtn = fixture.nativeElement.querySelector('.task-list__pagination-btn:last-child') as HTMLButtonElement;
    expect(nextBtn.disabled).toBeTrue();
  });

  it('should call service nextPage on nextPage()', () => {
    component.nextPage();
    expect(taskServiceSpy.nextPage).toHaveBeenCalled();
  });

  it('should call service previousPage on previousPage()', () => {
    component.previousPage();
    expect(taskServiceSpy.previousPage).toHaveBeenCalled();
  });

  it('should call service goToPage on goToPage()', () => {
    component.goToPage(3);
    expect(taskServiceSpy.goToPage).toHaveBeenCalledWith(3);
  });

  it('should call service updateTask on onToggleComplete', () => {
    const task = mockTasks[0];
    const updatedTask = { ...task, completed: true };
    taskServiceSpy.updateTask.and.returnValue(of(updatedTask));

    component.onToggleComplete(task);

    expect(taskServiceSpy.updateTask).toHaveBeenCalledWith(updatedTask);
  });

  it('should show empty state when no tasks', () => {
    tasksSubject.next([]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.task-list__empty')?.textContent).toContain('No tasks found.');
  });

  it('should set editingTaskId on onEdit', () => {
    component.onEdit(mockTasks[0]);
    expect(component.editingTaskId()).toBe('1');
  });

  it('should toggle editingTaskId to null when editing same task', () => {
    component.onEdit(mockTasks[0]);
    expect(component.editingTaskId()).toBe('1');
    component.onEdit(mockTasks[0]);
    expect(component.editingTaskId()).toBeNull();
  });

  it('should switch editingTaskId when editing a different task', () => {
    component.onEdit(mockTasks[0]);
    expect(component.editingTaskId()).toBe('1');
    component.onEdit(mockTasks[1]);
    expect(component.editingTaskId()).toBe('2');
  });

  it('should render state form when editingTaskId matches', () => {
    component.onEdit(mockTasks[0]);
    fixture.detectChanges();
    const stateForm = fixture.nativeElement.querySelector('app-task-state-form');
    expect(stateForm).toBeTruthy();
  });

  it('should not render state form when editingTaskId does not match', () => {
    const stateForm = fixture.nativeElement.querySelector('app-task-state-form');
    expect(stateForm).toBeNull();
  });

  it('should clear editingTaskId on onStateChanged', () => {
    component.onEdit(mockTasks[0]);
    component.onStateChanged();
    expect(component.editingTaskId()).toBeNull();
  });

  it('should clear editingTaskId on onStateFormCancelled', () => {
    component.onEdit(mockTasks[0]);
    expect(component.editingTaskId()).toBe('1');
    component.onStateFormCancelled();
    expect(component.editingTaskId()).toBeNull();
  });

  it('should render add task link with routerLink to /tasks/new', () => {
    const addLink = fixture.nativeElement.querySelector('.task-list__add-btn') as HTMLAnchorElement;
    expect(addLink).toBeTruthy();
    expect(addLink.textContent).toContain('+ Add Task');
    expect(addLink.getAttribute('href')).toBe('/tasks/new');
  });

  it('should update view when tasks$ emits new data', () => {
    const newTasks: Task[] = [mockTasks[0]];
    tasksSubject.next(newTasks);
    fixture.detectChanges();
    const taskCards = fixture.nativeElement.querySelectorAll('app-task');
    expect(taskCards.length).toBe(1);
  });
});
