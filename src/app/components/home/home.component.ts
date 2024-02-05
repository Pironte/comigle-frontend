import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';
import { AuthenticationServiceService } from '../../service/authentication/authentication-service.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NgOptimizedImage],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  userName: string | null = '';
  isOpen: boolean = false;

  constructor(private authService: AuthenticationServiceService, private router: Router) {
    this.userName = this.authService.getUserName();
  }

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
  }

  hideOptions() {
    this.isOpen = false;
  }

  logout() {
    this.authService.logout();
  }

  navigateToLogin(){
    this.router.navigate(['/login']);
  }

  navigateToVideoChat(){
    this.router.navigate(['/video']);
  }
}
