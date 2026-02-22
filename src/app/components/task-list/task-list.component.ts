import { Component, computed, inject, signal, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { TaskComponent } from '../task/task.component';
import { TaskStateFormComponent } from '../task-state-form/task-state-form.component';
import { Task } from '../../models/task.model';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-task-list',
  imports: [TaskComponent, TaskStateFormComponent, RouterLink],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.scss'
})
export class TaskListComponent {
  private readonly taskService = inject(TaskService);

  tasks = toSignal(this.taskService.tasks$, { initialValue: [] as Task[] });
  currentPage = toSignal(this.taskService.currentPage$, { initialValue: 1 });
  totalPages = toSignal(this.taskService.totalPages$, { initialValue: 0 });
  totalItems = toSignal(this.taskService.totalItems$, { initialValue: 0 });

  error: Signal<string | null> = toSignal(this.taskService.error$, { initialValue: null });
  toggleError = signal<string | null>(null);
  editingTaskId = signal<string | null>(null);

  hasPreviousPage = computed(() => this.currentPage() > 1);
  hasNextPage = computed(() => this.currentPage() < this.totalPages());

  loadTasks(): void {
    this.taskService.loadTasks();
  }

  nextPage(): void {
    this.taskService.nextPage();
  }

  previousPage(): void {
    this.taskService.previousPage();
  }

  goToPage(page: number): void {
    this.taskService.goToPage(page);
  }

  onToggleComplete(task: Task): void {
    this.toggleError.set(null);
    const updatedTask = { ...task, completed: !task.completed };
    this.taskService.updateTask(updatedTask).subscribe({
      error: () => {
        this.toggleError.set('Failed to update task. Please try again.');
      }
    });
  }

  onEdit(task: Task): void {
    this.editingTaskId.update((id) => (id === task.id ? null : task.id!));
  }

  onStateChanged(): void {
    this.editingTaskId.set(null);
  }

  onStateFormCancelled(): void {
    this.editingTaskId.set(null);
  }

  onDelete(task: Task): void {
    console.log('Delete task:', task);
  }
}
