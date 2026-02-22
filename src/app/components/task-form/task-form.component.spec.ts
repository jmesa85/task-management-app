import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskFormComponent } from './task-form.component';
import { TaskService } from '../../services/task.service';
import { of } from 'rxjs';
import { Task } from '../../models/task.model';

describe('TaskFormComponent', () => {
  let component: TaskFormComponent;
  let fixture: ComponentFixture<TaskFormComponent>;
  let taskServiceSpy: jasmine.SpyObj<TaskService>;

  const mockCreatedTask: Task = {
    id: '10',
    title: 'New Task',
    description: 'A description',
    dueDate: '2024-06-01',
    completed: false,
    stateHistory: [{ state: 'new', date: '2024-06-01' }],
    notes: ['First note']
  };

  beforeEach(async () => {
    taskServiceSpy = jasmine.createSpyObj('TaskService', ['getTasks', 'updateTask', 'createTask']);
    taskServiceSpy.createTask.and.returnValue(of(mockCreatedTask));

    await TestBed.configureTestingModule({
      imports: [TaskFormComponent],
      providers: [
        { provide: TaskService, useValue: taskServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with one note control', () => {
    expect(component.notes.length).toBe(1);
  });

  it('should add a note control on addNote()', () => {
    component.addNote();
    expect(component.notes.length).toBe(2);
  });

  it('should remove a note control on removeNote()', () => {
    component.addNote();
    expect(component.notes.length).toBe(2);
    component.removeNote(1);
    expect(component.notes.length).toBe(1);
  });

  it('should not remove the last note control', () => {
    component.removeNote(0);
    expect(component.notes.length).toBe(1);
  });

  it('should mark all as touched and not call service when form is invalid', () => {
    spyOn(component.form, 'markAllAsTouched');
    component.onSubmit();
    expect(component.form.markAllAsTouched).toHaveBeenCalled();
    expect(taskServiceSpy.createTask).not.toHaveBeenCalled();
  });

  it('should call createTask and emit taskCreated on valid submit', () => {
    component.form.patchValue({
      title: 'New Task',
      description: 'A description',
      dueDate: '2024-06-01',
      state: 'new'
    });
    component.notes.at(0).setValue('First note');

    const emitSpy = spyOn(component.taskCreated, 'emit');
    component.onSubmit();

    expect(taskServiceSpy.createTask).toHaveBeenCalled();
    const callArg = taskServiceSpy.createTask.calls.mostRecent().args[0];
    expect(callArg.title).toBe('New Task');
    expect(callArg.description).toBe('A description');
    expect(callArg.dueDate).toBe('2024-06-01');
    expect(callArg.completed).toBeFalse();
    expect(callArg.stateHistory.length).toBe(1);
    expect(callArg.stateHistory[0].state).toBe('new');
    expect(callArg.notes).toEqual(['First note']);
    expect(emitSpy).toHaveBeenCalledWith(mockCreatedTask);
  });

  it('should emit cancelled on onCancel()', () => {
    const emitSpy = spyOn(component.cancelled, 'emit');
    component.onCancel();
    expect(emitSpy).toHaveBeenCalled();
  });

  it('should show validation errors when fields are touched and empty', () => {
    component.form.get('title')!.markAsTouched();
    component.form.get('description')!.markAsTouched();
    component.form.get('dueDate')!.markAsTouched();
    fixture.detectChanges();

    const errors = fixture.nativeElement.querySelectorAll('.task-form__error');
    expect(errors.length).toBeGreaterThanOrEqual(3);
  });

  it('should disable submit button while submitting', () => {
    component.submitting.set(true);
    fixture.detectChanges();
    const submitBtn = fixture.nativeElement.querySelector('.task-form__btn--submit') as HTMLButtonElement;
    expect(submitBtn.disabled).toBeTrue();
  });
});
