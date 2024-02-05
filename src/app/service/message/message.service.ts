import { Injectable, NgZone } from '@angular/core';
import { Message } from '../../models/message.models';
import { MessageType } from '../../components/enums/level.enum';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private messageSource = new BehaviorSubject<{ message: string, type: MessageType } | null>(null);
  currentMessage = this.messageSource.asObservable();

  constructor() {}

  setMessage(message: string, type: MessageType) {
    this.messageSource.next({ message, type });
    setTimeout(() => {
      this.clearMessage();
    }, 4000);
  }

  clearMessage() {
    this.messageSource.next(null);
  }
}
