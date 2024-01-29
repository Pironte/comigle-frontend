import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-videochat',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './videochat.component.html',
  styleUrl: './videochat.component.scss'
})
export class VideochatComponent {
  messages: string[] = [];
  newMessage: string = '';

  sendMessage(): void {
    if (this.newMessage.trim() !== '') {
      this.messages.push(this.newMessage);
      this.newMessage = '';
    }
  }
}
