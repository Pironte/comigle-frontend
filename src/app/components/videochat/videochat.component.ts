import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthenticationServiceService } from '../../service/authentication/authentication-service.service';
import { RouterLink, RouterModule } from '@angular/router';

@Component({
  selector: 'app-videochat',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule, NgOptimizedImage],
  templateUrl: './videochat.component.html',
  styleUrl: './videochat.component.scss'
})
export class VideochatComponent {
  messages: string[] = [];
  newMessage: string = '';
  userName: string | null = '';
  isOpen: boolean = false;

  constructor(private authService: AuthenticationServiceService) {
    this.userName = this.authService.getUserName();
    console.log(`peguei o nome de usuario ${this.userName}`)
  }

  sendMessage(): void {
    if (this.newMessage.trim() !== '') {
      this.messages.push(`${this.userName}: ${this.newMessage}`);
      this.newMessage = '';
    }
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
}