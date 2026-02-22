import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TaskComponent } from './task.component';
import { Task } from '../../models/task.model';

describe('TaskComponent', () => {
  let component: TaskComponent;
  let fixture: ComponentFixture<TaskComponent>;

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
    await TestBed.configureTestingModule({
      imports: [TaskComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('task', mockTask);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the task title', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.task-card__title')?.textContent).toContain('Test Task');
  });

  it('should render the task description', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.task-card__description')?.textContent).toContain('A task for testing');
  });

  it('should render the current state badge', () => {
    const badge = fixture.nativeElement.querySelector('.task-card__state-badge');
    expect(badge?.textContent?.trim()).toBe('active');
    expect(badge?.getAttribute('data-state')).toBe('active');
  });

  it('should compute currentState from the last stateHistory entry', () => {
    expect(component.currentState()).toBe('active');
  });

  it('should default currentState to "new" when stateHistory is empty', () => {
    fixture.componentRef.setInput('task', { ...mockTask, stateHistory: [] });
    fixture.detectChanges();
    expect(component.currentState()).toBe('new');
  });

  it('should render notes when present', () => {
    const notes = fixture.nativeElement.querySelectorAll('.task-card__notes-list li');
    expect(notes.length).toBe(2);
    expect(notes[0].textContent).toContain('Note one');
    expect(notes[1].textContent).toContain('Note two');
  });

  it('should hide notes section when notes array is empty', () => {
    fixture.componentRef.setInput('task', { ...mockTask, notes: [] });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.task-card__notes')).toBeNull();
  });

  it('should emit task on edit button click', () => {
    spyOn(component.edit, 'emit');
    const btn = fixture.nativeElement.querySelector('.task-card__btn--edit') as HTMLButtonElement;
    btn.click();
    expect(component.edit.emit).toHaveBeenCalledWith(mockTask);
  });

  it('should emit task on delete button click', () => {
    spyOn(component.delete, 'emit');
    const btn = fixture.nativeElement.querySelector('.task-card__btn--delete') as HTMLButtonElement;
    btn.click();
    expect(component.delete.emit).toHaveBeenCalledWith(mockTask);
  });

  it('should emit task on toggleComplete button click', () => {
    spyOn(component.toggleComplete, 'emit');
    const btn = fixture.nativeElement.querySelector('.task-card__btn--complete') as HTMLButtonElement;
    btn.click();
    expect(component.toggleComplete.emit).toHaveBeenCalledWith(mockTask);
  });

  it('should show "Mark Complete" when task is not completed', () => {
    const btn = fixture.nativeElement.querySelector('.task-card__btn--complete') as HTMLButtonElement;
    expect(btn.textContent?.trim()).toBe('Mark Complete');
  });

  it('should show "Mark Incomplete" when task is completed', () => {
    fixture.componentRef.setInput('task', { ...mockTask, completed: true });
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('.task-card__btn--complete') as HTMLButtonElement;
    expect(btn.textContent?.trim()).toBe('Mark Incomplete');
  });

  it('should apply completed class when task is completed', () => {
    fixture.componentRef.setInput('task', { ...mockTask, completed: true });
    fixture.detectChanges();
    const card = fixture.nativeElement.querySelector('.task-card');
    expect(card.classList.contains('task-card--completed')).toBeTrue();
  });

  it('should not apply completed class when task is not completed', () => {
    const card = fixture.nativeElement.querySelector('.task-card');
    expect(card.classList.contains('task-card--completed')).toBeFalse();
  });

  it('should render task title as a link to detail view', () => {
    const titleLink = fixture.nativeElement.querySelector('.task-card__title-link') as HTMLAnchorElement;
    expect(titleLink).toBeTruthy();
    expect(titleLink.getAttribute('href')).toBe('/tasks/1');
  });
});
