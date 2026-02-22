import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/tasks', pathMatch: 'full' },
  { path: 'tasks', loadComponent: () => import('./components/task-list/task-list.component').then(m => m.TaskListComponent) },
  { path: 'tasks/new', loadComponent: () => import('./components/task-form/task-form.component').then(m => m.TaskFormComponent) },
  { path: 'tasks/:id', loadComponent: () => import('./components/task-detail/task-detail.component').then(m => m.TaskDetailComponent) },
  { path: '**', redirectTo: '/tasks' }
];
