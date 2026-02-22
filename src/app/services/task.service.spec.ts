import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TaskService, PaginatedResponse } from './task.service';
import { Task } from '../models/task.model';

describe('TaskService', () => {
  let service: TaskService;
  let httpTesting: HttpTestingController;

  const mockTasks: Task[] = [
    {
      id: '1',
      title: 'Task 1',
      description: 'Desc 1',
      dueDate: '2024-01-15',
      completed: false,
      stateHistory: [{ state: 'active', date: '2024-01-01' }],
      notes: []
    },
    {
      id: '2',
      title: 'Task 2',
      description: 'Desc 2',
      dueDate: '2024-01-20',
      completed: true,
      stateHistory: [{ state: 'resolved', date: '2024-01-10' }],
      notes: []
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

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(TaskService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    // Constructor triggers initial fetch
    const req = httpTesting.expectOne('http://localhost:3000/tasks?_page=1&_per_page=5');
    req.flush(mockResponse);
    expect(service).toBeTruthy();
  });

  it('should fetch tasks on construction and emit via tasks$', (done) => {
    const req = httpTesting.expectOne('http://localhost:3000/tasks?_page=1&_per_page=5');
    req.flush(mockResponse);

    service.tasks$.subscribe(tasks => {
      expect(tasks.length).toBe(2);
      expect(tasks[0].title).toBe('Task 1');
      done();
    });
  });

  it('should track currentPage$', (done) => {
    const req = httpTesting.expectOne('http://localhost:3000/tasks?_page=1&_per_page=5');
    req.flush(mockResponse);

    service.currentPage$.subscribe(page => {
      expect(page).toBe(1);
      done();
    });
  });

  it('should track totalPages$ and totalItems$', (done) => {
    const req = httpTesting.expectOne('http://localhost:3000/tasks?_page=1&_per_page=5');
    req.flush(mockResponse);

    service.totalPages$.subscribe(pages => {
      expect(pages).toBe(2);
    });

    service.totalItems$.subscribe(items => {
      expect(items).toBe(7);
      done();
    });
  });

  it('should advance page on nextPage()', () => {
    const req1 = httpTesting.expectOne('http://localhost:3000/tasks?_page=1&_per_page=5');
    req1.flush(mockResponse);

    service.nextPage();
    const req2 = httpTesting.expectOne('http://localhost:3000/tasks?_page=2&_per_page=5');
    req2.flush({ ...mockResponse, data: [] });
  });

  it('should not go past last page on nextPage()', () => {
    const singlePageResponse = { ...mockResponse, pages: 1 };
    const req1 = httpTesting.expectOne('http://localhost:3000/tasks?_page=1&_per_page=5');
    req1.flush(singlePageResponse);

    service.nextPage();
    httpTesting.expectNone('http://localhost:3000/tasks?_page=2&_per_page=5');
  });

  it('should go back on previousPage()', () => {
    const req1 = httpTesting.expectOne('http://localhost:3000/tasks?_page=1&_per_page=5');
    req1.flush(mockResponse);

    service.nextPage();
    const req2 = httpTesting.expectOne('http://localhost:3000/tasks?_page=2&_per_page=5');
    req2.flush(mockResponse);

    service.previousPage();
    const req3 = httpTesting.expectOne('http://localhost:3000/tasks?_page=1&_per_page=5');
    req3.flush(mockResponse);
  });

  it('should not go below page 1 on previousPage()', () => {
    const req1 = httpTesting.expectOne('http://localhost:3000/tasks?_page=1&_per_page=5');
    req1.flush(mockResponse);

    service.previousPage();
    // No additional request should be made
    httpTesting.expectNone('http://localhost:3000/tasks?_page=0&_per_page=5');
  });

  it('should go to specific page on goToPage()', () => {
    const req1 = httpTesting.expectOne('http://localhost:3000/tasks?_page=1&_per_page=5');
    req1.flush(mockResponse);

    service.goToPage(2);
    const req2 = httpTesting.expectOne('http://localhost:3000/tasks?_page=2&_per_page=5');
    req2.flush(mockResponse);
  });

  it('should trigger refresh on createTask', () => {
    const req1 = httpTesting.expectOne('http://localhost:3000/tasks?_page=1&_per_page=5');
    req1.flush(mockResponse);

    const newTask: Task = {
      title: 'New Task',
      description: 'New Desc',
      dueDate: '2024-02-01',
      completed: false,
      stateHistory: [],
      notes: []
    };

    service.createTask(newTask).subscribe();
    const createReq = httpTesting.expectOne('http://localhost:3000/tasks');
    expect(createReq.request.method).toBe('POST');
    createReq.flush({ ...newTask, id: '3' });

    // Should trigger a refresh
    const refreshReq = httpTesting.expectOne('http://localhost:3000/tasks?_page=1&_per_page=5');
    refreshReq.flush(mockResponse);
  });

  it('should update task inline on updateTask', (done) => {
    const req1 = httpTesting.expectOne('http://localhost:3000/tasks?_page=1&_per_page=5');
    req1.flush(mockResponse);

    const updatedTask = { ...mockTasks[0], completed: true };
    service.updateTask(updatedTask).subscribe(() => {
      service.tasks$.subscribe(tasks => {
        const task = tasks.find(t => t.id === '1');
        expect(task?.completed).toBeTrue();
        done();
      });
    });

    const updateReq = httpTesting.expectOne('http://localhost:3000/tasks/1');
    expect(updateReq.request.method).toBe('PUT');
    updateReq.flush(updatedTask);
  });

  it('should push to selectedTask$ on getTask', (done) => {
    const req1 = httpTesting.expectOne('http://localhost:3000/tasks?_page=1&_per_page=5');
    req1.flush(mockResponse);

    service.getTask('1').subscribe();
    const getReq = httpTesting.expectOne('http://localhost:3000/tasks/1');
    getReq.flush(mockTasks[0]);

    service.selectedTask$.subscribe(task => {
      if (task) {
        expect(task.id).toBe('1');
        expect(task.title).toBe('Task 1');
        done();
      }
    });
  });

  it('should update selectedTask$ when updateTask matches current selection', (done) => {
    const req1 = httpTesting.expectOne('http://localhost:3000/tasks?_page=1&_per_page=5');
    req1.flush(mockResponse);

    // First select a task
    service.getTask('1').subscribe();
    const getReq = httpTesting.expectOne('http://localhost:3000/tasks/1');
    getReq.flush(mockTasks[0]);

    // Then update it
    const updatedTask = { ...mockTasks[0], title: 'Updated Title' };
    service.updateTask(updatedTask).subscribe(() => {
      service.selectedTask$.subscribe(task => {
        if (task?.title === 'Updated Title') {
          expect(task.title).toBe('Updated Title');
          done();
        }
      });
    });

    const updateReq = httpTesting.expectOne('http://localhost:3000/tasks/1');
    updateReq.flush(updatedTask);
  });
});
