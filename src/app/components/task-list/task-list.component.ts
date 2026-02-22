import { Component, OnInit, computed, inject, signal } from '@angular/core';
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
export class TaskListComponent implements OnInit {
  private readonly taskService = inject(TaskService);

  tasks = signal<Task[]>([]);
  editingTaskId = signal<string | null>(null);
  currentPage = signal(1);
  totalPages = signal(0);
  totalItems = signal(0);

  hasPreviousPage = computed(() => this.currentPage() > 1);
  hasNextPage = computed(() => this.currentPage() < this.totalPages());

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.taskService.getTasks(this.currentPage()).subscribe((response) => {
      this.tasks.set(response.data);
      this.totalPages.set(response.pages);
      this.totalItems.set(response.items);
    });
  }

  nextPage(): void {
    if (this.hasNextPage()) {
      this.currentPage.update((p) => p + 1);
      this.loadTasks();
    }
  }

  previousPage(): void {
    if (this.hasPreviousPage()) {
      this.currentPage.update((p) => p - 1);
      this.loadTasks();
    }
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
    this.loadTasks();
  }

  onToggleComplete(task: Task): void {
    const updatedTask = { ...task, completed: !task.completed };
    this.taskService.updateTask(updatedTask).subscribe((saved) => {
      this.tasks.update((tasks) =>
        tasks.map((t) => (t.id === saved.id ? saved : t))
      );
    });
  }

  onEdit(task: Task): void {
    this.editingTaskId.update((id) => (id === task.id ? null : task.id!));
  }

  onStateChanged(task: Task): void {
    this.editingTaskId.set(null);
    this.tasks.update((tasks) =>
      tasks.map((t) => (t.id === task.id ? task : t))
    );
  }

  onStateFormCancelled(): void {
    this.editingTaskId.set(null);
  }

  onDelete(task: Task): void {
    console.log('Delete task:', task);
  }
}
