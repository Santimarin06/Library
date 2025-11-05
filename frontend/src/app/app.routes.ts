import { Routes } from '@angular/router';
import { Main } from './structure/main';
import { Home } from './modules/home/home';
import { AutorComponent } from './modules/autor/autor';
import { LibroComponent } from './modules/libro/libro';
import { PrestamoComponent } from './modules/prestamo/prestamo';
import { UsuarioComponent } from './modules/usuario/usuario';
import { Login } from './modules/login/login';
import { authGuard } from './guard/auth-guard';

export const routes: Routes = [
    {
        path: '', component: Main, canActivate: [authGuard],
        children: 
        [
            {path: 'home', component: Home, canActivate: [authGuard]},
            {path: 'autor', component: AutorComponent, canActivate: [authGuard]},
            {path: 'libro', component: LibroComponent, canActivate: [authGuard]},
            {path: 'prestamo', component: PrestamoComponent, canActivate: [authGuard]},
            {path: 'usuario', component: UsuarioComponent, canActivate: [authGuard]},
            {path: '', redirectTo: 'home', pathMatch: 'full'}
        ]
    },
    {path: 'login', component: Login}
];
