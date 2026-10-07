import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { authGuard } from './guards/auth.guard';
export const routes: Routes = [
    //The first entry acts as a default path.
    {
        path:"",
        redirectTo:"/login",
        pathMatch:"full"
    },
    {
        path: "login",
        component: Login
    },
    {
        path: "dashboard",
        component: Dashboard,
        canActivate: [authGuard]
    },
    {
        path: "analytics",
        component: Analytics,
        canActivate: [authGuard]
    }
];
