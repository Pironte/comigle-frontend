import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PopupService {
  openPopUp = signal(false);

  openPopUpModal() {
    this.openPopUp.set(true);
  }

  closePopUpModal() {
    this.openPopUp.set(false);
  }
}
