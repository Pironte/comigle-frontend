import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { RegisterComponent } from './components/register/register.component';
import { LoginComponent } from './components/login/login.component';
import { VideochatComponent } from './components/videochat/videochat.component';
import { ForgetPasswordComponent } from './components/forget-password/forget-password.component';

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
      component: RegisterComponent
    },
    {
      path: 'login',
      component: LoginComponent
    },
    {
      path: 'video',
      component: VideochatComponent
    },
    {
      path: 'forgetpassword',
      component: ForgetPasswordComponent
    }
  ];

