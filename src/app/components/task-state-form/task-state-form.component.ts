import { ChangeDetectionStrategy, Component, computed, inject, input, OnInit, output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { Task, TaskState } from '../../models/task.model';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-task-state-form',
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './task-state-form.component.html',
  styleUrl: './task-state-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskStateFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly taskService = inject(TaskService);

  task = input.required<Task>();
  stateChanged = output<Task>();
  cancelled = output<void>();

  states: TaskState[] = ['new', 'active', 'resolved', 'closed'];
  submitting = signal(false);
  errorMessage = signal<string | null>(null);

  currentState = computed(() => {
    const history = this.task().stateHistory;
    return history.length > 0 ? history[history.length - 1].state : 'new';
  });

  form: FormGroup = this.fb.group({
    state: ['new', Validators.required]
  });

  ngOnInit(): void {
    this.form.patchValue({ state: this.currentState() });
  }

  onSubmit(): void {
    if (this.form.invalid || this.form.value.state === this.currentState()) {
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);

    const newEntry = {
      state: this.form.value.state as TaskState,
      date: new Date().toISOString().split('T')[0]
    };

    const updatedTask: Task = {
      ...this.task(),
      stateHistory: [...this.task().stateHistory, newEntry]
    };

    this.taskService.updateTask(updatedTask).subscribe({
      next: (saved) => {
        this.submitting.set(false);
        this.stateChanged.emit(saved);
      },
      error: () => {
        this.submitting.set(false);
        this.errorMessage.set('Failed to update state. Please try again.');
      }
    });
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
