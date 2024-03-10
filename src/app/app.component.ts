import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AuthenticationServiceService } from './service/authentication/authentication-service.service';
import { MessageService } from './service/message/message.service';
import { PopupService } from './service/popup/popup.service';
import { SignalrService } from './service/chathub/signalr.service';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(public signalrService: SignalrService, @Inject(PLATFORM_ID) private platformId: Object) { }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId))
      this.signalrService.startConnection(`${environment.apiUrl}/chatHub`);
  }
}
