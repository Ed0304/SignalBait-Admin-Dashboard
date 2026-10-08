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

  private apiUrl = 'https://signal-bait-admin-dashboard-sand.vercel.app/api';

  getTickets() {
    return this.http.get<Ticket[]>(
      `${this.apiUrl}/tickets/`,
      {withCredentials:true}
    );
  }

  updateTicketStatus(ticketId: number, status: string) {
    return this.http.patch(
      `${this.apiUrl}/tickets/${ticketId}/`,
      {
        ticket_status: status
      },
      {
        withCredentials: true
      }
    );
  }

deleteTicket(ticketId: number) {
  return this.http.delete(
    `${this.apiUrl}/tickets/${ticketId}/`,
    {
      withCredentials: true
    }
  );
}


}