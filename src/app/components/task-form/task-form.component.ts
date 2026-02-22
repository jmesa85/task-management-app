import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Task, TaskState } from '../../models/task.model';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-task-form',
  imports: [ReactiveFormsModule],
  templateUrl: './task-form.component.html',
  styleUrl: './task-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly taskService = inject(TaskService);
  private readonly router = inject(Router);

  states: TaskState[] = ['new', 'active', 'resolved', 'closed'];
  submitting = signal(false);
  errorMessage = signal<string | null>(null);

  form: FormGroup = this.fb.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    dueDate: ['', Validators.required],
    state: ['new', Validators.required],
    notes: this.fb.array([this.fb.control('', Validators.required)])
  });

  get notes(): FormArray {
    return this.form.get('notes') as FormArray;
  }

  addNote(): void {
    this.notes.push(this.fb.control('', Validators.required));
  }

  removeNote(index: number): void {
    if (this.notes.length > 1) {
      this.notes.removeAt(index);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);
    const formValue = this.form.getRawValue();

    const task: Task = {
      title: formValue.title,
      description: formValue.description,
      dueDate: formValue.dueDate,
      completed: false,
      stateHistory: [{ state: formValue.state, date: new Date().toISOString().split('T')[0] }],
      notes: formValue.notes
    };

    this.taskService.createTask(task).subscribe({
      next: () => {
        this.submitting.set(false);
        this.router.navigate(['/tasks']);
      },
      error: () => {
        this.submitting.set(false);
        this.errorMessage.set('Failed to create task. Please try again.');
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/tasks']);
  }
}
