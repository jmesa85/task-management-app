import { ChangeDetectionStrategy, Component, OnInit, Signal, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Task } from '../../models/task.model';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-task-detail',
  imports: [RouterLink, DatePipe],
  templateUrl: './task-detail.component.html',
  styleUrl: './task-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly taskService = inject(TaskService);

  task = toSignal(this.taskService.selectedTask$, { initialValue: null as Task | null });
  error: Signal<string | null> = toSignal(this.taskService.error$, { initialValue: null });

  currentState = computed(() => {
    const t = this.task();
    if (!t) return 'new';
    const history = t.stateHistory;
    return history.length > 0 ? history[history.length - 1].state : 'new';
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.taskService.getTask(id).subscribe();
  }
}
