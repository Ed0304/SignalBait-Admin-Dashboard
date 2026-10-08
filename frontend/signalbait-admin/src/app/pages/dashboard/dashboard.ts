import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TicketService, Ticket } from '../../services/ticket';

@Component({
  selector: 'app-dashboard',
  imports: [DatePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {

  private ticketService = inject(TicketService);
  private cdr = inject(ChangeDetectorRef);

  tickets: Ticket[] = [];

  ngOnInit(): void {
    console.log(
      'DASHBOARD INIT:',
      new Date().toLocaleTimeString()
    );

    this.getData();
  }

  getData(): void {
    console.log(
      'FETCH START:',
      new Date().toLocaleTimeString()
    );

    this.ticketService.getTickets().subscribe({
      next: (data) => {
        console.log(
          'FETCH COMPLETE:',
          new Date().toLocaleTimeString()
        );

        this.tickets = data;

        this.cdr.detectChanges();

        console.log('TICKETS:', this.tickets);
      },

      error: (error) => {
        console.error('FETCH ERROR:', error);
      }
    });
  }
}