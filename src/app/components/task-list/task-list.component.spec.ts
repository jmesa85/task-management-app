import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TaskListComponent } from './task-list.component';
import { TaskService, PaginatedResponse } from '../../services/task.service';
import { Task } from '../../models/task.model';
import { of } from 'rxjs';

describe('TaskListComponent', () => {
  let component: TaskListComponent;
  let fixture: ComponentFixture<TaskListComponent>;
  let taskServiceSpy: jasmine.SpyObj<TaskService>;

  const mockTasks: Task[] = [
    {
      id: 1,
      title: 'Task 1',
      description: 'Description 1',
      dueDate: '2024-01-15',
      completed: false,
      stateHistory: [{ state: 'active', date: '2024-01-01' }],
      notes: []
    },
    {
      id: 2,
      title: 'Task 2',
      description: 'Description 2',
      dueDate: '2024-01-20',
      completed: true,
      stateHistory: [{ state: 'resolved', date: '2024-01-10' }],
      notes: ['A note']
    }
  ];

  const mockResponse: PaginatedResponse<Task> = {
    data: mockTasks,
    pages: 2,
    items: 7,
    first: 1,
    prev: null,
    next: 2,
    last: 2
  };

  const singlePageResponse: PaginatedResponse<Task> = {
    data: mockTasks,
    pages: 1,
    items: 2,
    first: 1,
    prev: null,
    next: null,
    last: 1
  };

  beforeEach(async () => {
    taskServiceSpy = jasmine.createSpyObj('TaskService', ['getTasks', 'updateTask']);
    taskServiceSpy.getTasks.and.returnValue(of(mockResponse));

    await TestBed.configureTestingModule({
      imports: [TaskListComponent],
      providers: [
        { provide: TaskService, useValue: taskServiceSpy }
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

  it('should call getTasks on init', () => {
    expect(taskServiceSpy.getTasks).toHaveBeenCalledWith(1);
  });

  it('should show pagination controls when multiple pages', () => {
    const pagination = fixture.nativeElement.querySelector('.task-list__pagination');
    expect(pagination).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.task-list__pagination-info')?.textContent).toContain('Page 1 of 2');
  });

  it('should hide pagination controls when single page', () => {
    taskServiceSpy.getTasks.and.returnValue(of(singlePageResponse));
    component.ngOnInit();
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
    const lastPageResponse: PaginatedResponse<Task> = {
      ...mockResponse,
      pages: 2,
      prev: 1,
      next: null
    };
    taskServiceSpy.getTasks.and.returnValue(of(lastPageResponse));
    component.goToPage(2);
    fixture.detectChanges();
    const nextBtn = fixture.nativeElement.querySelector('.task-list__pagination-btn:last-child') as HTMLButtonElement;
    expect(nextBtn.disabled).toBeTrue();
  });

  it('should call getTasks with next page on nextPage()', () => {
    taskServiceSpy.getTasks.calls.reset();
    component.nextPage();
    expect(taskServiceSpy.getTasks).toHaveBeenCalledWith(2);
  });

  it('should call service and update local state on onToggleComplete', () => {
    const task = mockTasks[0];
    const updatedTask = { ...task, completed: true };
    taskServiceSpy.updateTask.and.returnValue(of(updatedTask));

    component.onToggleComplete(task);

    expect(taskServiceSpy.updateTask).toHaveBeenCalledWith(updatedTask);
    expect(component.tasks().find(t => t.id === 1)?.completed).toBeTrue();
  });

  it('should show empty state when no tasks', () => {
    const emptyResponse: PaginatedResponse<Task> = {
      data: [],
      pages: 0,
      items: 0,
      first: 1,
      prev: null,
      next: null,
      last: 0
    };
    taskServiceSpy.getTasks.and.returnValue(of(emptyResponse));
    component.ngOnInit();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.task-list__empty')?.textContent).toContain('No tasks found.');
  });
});
