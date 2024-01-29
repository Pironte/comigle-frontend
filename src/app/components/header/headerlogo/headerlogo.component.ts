import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-headerlogo',
  standalone: true,
  imports: [NgOptimizedImage],
  templateUrl: './headerlogo.component.html',
  styleUrl: './headerlogo.component.scss'
})
export class HeaderlogoComponent {

}
