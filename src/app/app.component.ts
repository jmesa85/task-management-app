import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TaskComponent } from './components/task/task.component';
import { Task } from './models/task.model';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TaskComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class App {
  protected readonly title = signal('task-management-app');

  protected readonly sampleTask = signal<Task>({
    id: 1,
    title: 'Complete Project Proposal',
    description: 'Prepare and submit the project proposal for approval.',
    dueDate: '2023-12-15',
    completed: false,
    stateHistory: [
      { state: 'new', date: '2023-12-01' },
      { state: 'active', date: '2023-12-05' }
    ],
    notes: [
      'Check proposal guidelines',
      'Include budget estimates'
    ]
  });

  onEdit(task: Task): void {
    console.log('Edit task:', task);
  }

  onDelete(task: Task): void {
    console.log('Delete task:', task);
  }
}
