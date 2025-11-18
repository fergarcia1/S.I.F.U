import { Component } from '@angular/core';
import { AuthService } from '../auth/auth-service';
import { Router,RouterLink } from '@angular/router';
import { NavbarComponent } from '../shared/navbar/navbar.component';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [NavbarComponent,RouterLink],
  templateUrl: './menu-principal.component.html',
  styleUrls: ['./menu-principal.component.css']
})
export class MenuComponent {


  constructor(private auth: AuthService, private router: Router) {}

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}