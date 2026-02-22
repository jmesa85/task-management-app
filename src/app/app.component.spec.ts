import { TestBed } from '@angular/core/testing';
import { App } from './app.component';
import { TaskService } from './services/task.service';
import { of } from 'rxjs';

describe('App', () => {
  beforeEach(async () => {
    const taskServiceSpy = jasmine.createSpyObj('TaskService', ['getTasks', 'updateTask']);
    taskServiceSpy.getTasks.and.returnValue(of({ data: [], pages: 0, items: 0, first: 1, prev: null, next: null, last: 0 }));

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        { provide: TaskService, useValue: taskServiceSpy }
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('task-management-app');
  });
});
