import { Component } from '@angular/core';
import { PopupService } from '../../service/popup/popup.service';

@Component({
  selector: 'app-popup',
  standalone: true,
  imports: [],
  templateUrl: './popup.component.html',
  styleUrl: './popup.component.scss'
})
export class PopupComponent {
  // Quando o construtor está apenas injetando alguma dependência, ela está sendo utilizada no HTML
  constructor(public popupService: PopupService) { }
}
