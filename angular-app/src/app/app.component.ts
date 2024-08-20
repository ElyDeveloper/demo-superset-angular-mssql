import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SupersetEmbedService } from './services/superset-embed.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'angular-app';
  private superService = inject(SupersetEmbedService)
  constructor() {
    this.superService.embedDashboardU().subscribe({
      next: (url) => {
        console.log('Dashboard URL:', url);
      },
      error: (error) => {
        console.error('Error embedding dashboard:', error);
      }
    });
  }



}
