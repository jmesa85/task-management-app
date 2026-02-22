import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskStateFormComponent } from './task-state-form.component';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task.model';
import { of, throwError } from 'rxjs';

describe('TaskStateFormComponent', () => {
  let component: TaskStateFormComponent;
  let fixture: ComponentFixture<TaskStateFormComponent>;
  let taskServiceSpy: jasmine.SpyObj<TaskService>;

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
    notes: ['Note one']
  };

  beforeEach(async () => {
    taskServiceSpy = jasmine.createSpyObj('TaskService', ['getTasks', 'createTask', 'updateTask']);

    await TestBed.configureTestingModule({
      imports: [TaskStateFormComponent],
      providers: [
        { provide: TaskService, useValue: taskServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskStateFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('task', mockTask);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compute currentState from last stateHistory entry', () => {
    expect(component.currentState()).toBe('active');
  });

  it('should default currentState to "new" when stateHistory is empty', () => {
    fixture.componentRef.setInput('task', { ...mockTask, stateHistory: [] });
    fixture.detectChanges();
    expect(component.currentState()).toBe('new');
  });

  it('should initialize form with current state', () => {
    expect(component.form.value.state).toBe('active');
  });

  it('should render history entries with correct badges', () => {
    const badges = fixture.nativeElement.querySelectorAll('.task-state-form__state-badge');
    expect(badges.length).toBe(2);
    expect(badges[0].textContent.trim()).toBe('new');
    expect(badges[0].getAttribute('data-state')).toBe('new');
    expect(badges[1].textContent.trim()).toBe('active');
    expect(badges[1].getAttribute('data-state')).toBe('active');
  });

  it('should call updateTask with appended stateHistory and emit stateChanged on submit', () => {
    const savedTask: Task = {
      ...mockTask,
      stateHistory: [
        ...mockTask.stateHistory,
        { state: 'resolved', date: '2024-01-10' }
      ]
    };
    taskServiceSpy.updateTask.and.returnValue(of(savedTask));
    const emitSpy = spyOn(component.stateChanged, 'emit');

    component.form.patchValue({ state: 'resolved' });
    component.onSubmit();

    expect(taskServiceSpy.updateTask).toHaveBeenCalled();
    const callArg = taskServiceSpy.updateTask.calls.mostRecent().args[0];
    expect(callArg.stateHistory.length).toBe(3);
    expect(callArg.stateHistory[2].state).toBe('resolved');
    expect(emitSpy).toHaveBeenCalledWith(savedTask);
  });

  it('should not call updateTask when state is unchanged', () => {
    component.form.patchValue({ state: 'active' });
    component.onSubmit();
    expect(taskServiceSpy.updateTask).not.toHaveBeenCalled();
  });

  it('should disable submit button while submitting', () => {
    component.submitting.set(true);
    fixture.detectChanges();
    const submitBtn = fixture.nativeElement.querySelector('.task-state-form__btn--submit') as HTMLButtonElement;
    expect(submitBtn.disabled).toBeTrue();
  });

  it('should emit cancelled on onCancel()', () => {
    const emitSpy = spyOn(component.cancelled, 'emit');
    component.onCancel();
    expect(emitSpy).toHaveBeenCalled();
  });

  it('should reset submitting to false on error', () => {
    taskServiceSpy.updateTask.and.returnValue(throwError(() => new Error('fail')));
    component.form.patchValue({ state: 'resolved' });
    component.onSubmit();
    expect(component.submitting()).toBeFalse();
  });

  it('should display error message when updateTask fails', () => {
    taskServiceSpy.updateTask.and.returnValue(throwError(() => new Error('fail')));
    component.form.patchValue({ state: 'resolved' });
    component.onSubmit();
    fixture.detectChanges();

    const errorBanner = fixture.nativeElement.querySelector('.task-state-form__error');
    expect(errorBanner).toBeTruthy();
    expect(errorBanner.textContent).toContain('Failed to update state');
    expect(errorBanner.getAttribute('role')).toBe('alert');
  });

  it('should clear error message on resubmission', () => {
    taskServiceSpy.updateTask.and.returnValue(throwError(() => new Error('fail')));
    component.form.patchValue({ state: 'resolved' });
    component.onSubmit();
    expect(component.errorMessage()).toBe('Failed to update state. Please try again.');

    // On resubmission, error should be cleared
    const savedTask: Task = {
      ...mockTask,
      stateHistory: [...mockTask.stateHistory, { state: 'closed', date: '2024-01-10' }]
    };
    taskServiceSpy.updateTask.and.returnValue(of(savedTask));
    component.form.patchValue({ state: 'closed' });
    component.onSubmit();
    expect(component.errorMessage()).toBeNull();
  });
});
