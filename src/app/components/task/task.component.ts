import { Component, computed, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-task',
  imports: [DatePipe],
  templateUrl: './task.component.html',
  styleUrl: './task.component.scss'
})
export class TaskComponent {
  task = input.required<Task>();
  edit = output<Task>();
  delete = output<Task>();

  currentState = computed(() => {
    const history = this.task().stateHistory;
    return history.length > 0 ? history[history.length - 1].state : 'new';
  });
}
