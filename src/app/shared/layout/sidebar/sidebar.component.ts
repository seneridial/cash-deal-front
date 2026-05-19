import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService, User } from '../../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class SidebarComponent implements OnInit {
  currentUser: User | null = null;

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    this.auth.currentUser$.subscribe(user => this.currentUser = user);
  }

  get initiales(): string {
    if (!this.currentUser) return '?';
    return this.currentUser.name
      .split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  get isAdmin(): boolean  { return this.auth.hasRole(['admin']); }
  get isGerant(): boolean { return this.auth.hasRole(['admin', 'gerant']); }

  logout(): void { this.auth.logout(); }
}