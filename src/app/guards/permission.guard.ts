import { CanActivateFn } from '@angular/router';
import { PopupService } from '../service/popup/popup.service';
import { Injectable, inject } from '@angular/core';
import { MessageService } from '../service/message/message.service';

@Injectable({ providedIn: 'root' })
class authPermission {
  
  constructor(public popupService: PopupService) { }

  canActivate(token: string | null): boolean {
    if (token)
      return true;

    this.popupService.openPopUpModal();
    return false;
  }
}

export const authPermissionGuard: CanActivateFn = (route, state) => {
  var token = localStorage.getItem("token");
  return inject(authPermission).canActivate(token);
}
