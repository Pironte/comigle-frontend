import { Injectable, signal } from '@angular/core';
import { MessageType } from '../../components/enums/level.enum';
import { Message } from '../../models/message.models';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  messageSource = signal<Message>(new Message('', MessageType.None));
  
  setMessage(message: string, type: MessageType) {
    this.messageSource.set({ message, type });
    setTimeout(() => {
      this.clearMessage();
    }, 4000);
  }

  clearMessage() {
    this.messageSource.set(new Message('', MessageType.None))
  }
}
