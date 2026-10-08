import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Ticket {
  ticket_id: number;
  created_at: string;
  issue_type: string;
  reporter_email: string;
  ticket_status: string;
}

@Injectable({
  providedIn: 'root'
})
export class TicketService {

  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:8000/api';

  getTickets() {
    return this.http.get<Ticket[]>(
      `${this.apiUrl}/tickets/`,
      {withCredentials:true}
    );
  }
}