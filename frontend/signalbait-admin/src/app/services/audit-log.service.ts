import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface AuditLog {
  id: number;
  username: string;
  action: string;
  ticket_id: number | null;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuditLogService {

  private http = inject(HttpClient);

  private apiUrl = 'https://signal-bait-admin-dashboard-sand.vercel.app/api';

  getAuditLogs() {
    return this.http.get<AuditLog[]>(
      `${this.apiUrl}/audit-logs/`,
      {
        withCredentials: true
      }
    );
  }
}