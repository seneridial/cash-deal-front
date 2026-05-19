import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  standalone: true,
  imports: [CommonModule]
})
export class TopbarComponent {
  @Input() title = '';
  @Input() subtitle = '';

  get today(): string {
    return new Date().toLocaleDateString('fr-FR', {
      weekday: 'long', year: 'numeric',
      month: 'long', day: 'numeric'
    });
  }
}