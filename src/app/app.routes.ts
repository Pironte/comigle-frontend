import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';

export const routes: Routes = [
    {
      path: '',
      pathMatch: 'full',
      redirectTo: 'home'
    },
    {
      path: 'home',
      component: HomeComponent
    },
    {
      path: 'register',
      loadComponent: () => import('./components/register/register.component').then(p => p.RegisterComponent)
    },
    {
      path: 'login',
      loadComponent: () => import('./components/login/login.component').then(p => p.LoginComponent)
    },
    {
      path: 'video',
      loadComponent: () => import('./components/videochat/videochat.component').then(p => p.VideochatComponent)
    }
  ];

