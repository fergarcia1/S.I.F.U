import { Component, inject } from '@angular/core';
import { AuthService } from '../auth/auth-service';
import { Router, RouterLink } from '@angular/router';
import { Users } from '../models/users';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './menu-principal.component.html',
  styleUrls: ['./menu-principal.component.css']
})
export class MenuComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  user: Users | null = null;

  constructor() {
    // Obtenemos el usuario desde el servicio al cargar el componente
    this.user = this.auth.getUser();
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}