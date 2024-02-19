import { Injectable, signal } from '@angular/core';
import { MessageType } from '../../components/enums/level.enum';
import { Message } from '../../models/message.models';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  messageSource = signal<Message>(new Message('', MessageType.None));

  setMessage(message: string, type: MessageType, timeout: number) {
    this.messageSource.set({ message, type });
    setTimeout(() => {
      this.clearMessage();
    }, timeout);
  }

  clearMessage() {
    this.messageSource.set(new Message('', MessageType.None))
  }

  // Get dinâmico para descobrir se o tipo da classe é: sucesso, erro, warning ou info
  get messageClass() {
    if (this.messageSource().type == MessageType.None) return '';

    switch (this.messageSource().type) {
      case MessageType.Success:
        return 'alert-success';
      case MessageType.Error:
        return 'alert-danger';
      case MessageType.Warning:
        return 'alert-warning';
      case MessageType.Info:
        return 'alert-info';
      default:
        return '';
    }
  }
}
