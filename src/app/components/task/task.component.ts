import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-task',
  imports: [DatePipe, RouterLink],
  templateUrl: './task.component.html',
  styleUrl: './task.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskComponent {
  task = input.required<Task>();
  edit = output<Task>();
  delete = output<Task>();
  toggleComplete = output<Task>();

  currentState = computed(() => {
    const history = this.task().stateHistory;
    return history.length > 0 ? history[history.length - 1].state : 'new';
  });
}
