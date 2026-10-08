import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { Analytics } from './pages/analytics/analytics';
import { Audit } from './pages/audit/audit';
import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';

export const routes: Routes = [

  {
    path: "",
    redirectTo: "/login",
    pathMatch: "full"
  },

  {
    path: "login",
    component: Login,
    canActivate: [guestGuard]
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
  },
  {
    path: "audit",
    component: Audit,
    canActivate: [authGuard]
  }
];