import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-headerlogo',
  standalone: true,
  imports: [NgOptimizedImage, RouterModule],
  templateUrl: './headerlogo.component.html',
  styleUrl: './headerlogo.component.scss'
})
export class HeaderlogoComponent {

}
