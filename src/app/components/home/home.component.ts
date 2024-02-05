import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';
import { AuthenticationServiceService } from '../../service/authentication/authentication-service.service';

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

  constructor(private authService: AuthenticationServiceService) {
    this.userName = this.authService.getUserName();
  }

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
    console.log(`estou chamando o toggle ${this.isOpen}`)
  }

  hideOptions() {
    this.isOpen = false;
  }

  logout() {
    this.authService.logout();
  }
}
