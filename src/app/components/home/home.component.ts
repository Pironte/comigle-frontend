import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';
import { AuthenticationServiceService } from '../../service/authentication/authentication-service.service';
import { Router, RouterModule } from '@angular/router';
import { PopupComponent } from '../popup/popup.component';
import { PopupService } from '../../service/popup/popup.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NgOptimizedImage, PopupComponent, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  userName: string | null = '';
  isOpen: boolean = false;

  constructor(public authService: AuthenticationServiceService, private router: Router, public popupService: PopupService) {
    this.userName = this.authService.getUserName();
  }

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
  }

  hideOptions() {
    this.isOpen = false;
  }
}
