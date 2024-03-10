import { CanActivateFn } from '@angular/router';
import { PopupService } from '../service/popup/popup.service';
import { Inject, Injectable, PLATFORM_ID, inject } from '@angular/core';
import { MessageService } from '../service/message/message.service';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
class authPermission {

  constructor(public popupService: PopupService, @Inject(PLATFORM_ID) private platformId: Object) { }

  canActivate(): boolean {
    var token = null;
    if (isPlatformBrowser(this.platformId)) {
      token = localStorage.getItem("token");
    }
    if (token)
      return true;

    this.popupService.openPopUpModal();
    return false;
  }
}

export const authPermissionGuard: CanActivateFn = (route, state) => {

  return inject(authPermission).canActivate();
}
