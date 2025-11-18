import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { AuthService } from '../../auth/auth-service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [],
  templateUrl: './navbar.component.html'
})
export class NavbarComponent {

  @Input() showBack = false;
  @Input() showLogout = true;

  constructor(
    private loc: Location,
    private auth: AuthService,
    private router: Router
  ) {}

  goBack() {
    this.loc.back();
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}