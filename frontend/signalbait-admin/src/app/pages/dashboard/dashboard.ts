import {
  ChangeDetectorRef,
  Component,
  inject,
  OnInit
} from '@angular/core';

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

  // Search
  searchTerm = '';

  // Selected tickets
  selectedTickets = new Set<number>();

  // Stores a new status before the admin confirms it
  pendingStatuses: Record<number, string> = {};

  ngOnInit(): void {
    console.log(
      'DASHBOARD INIT:',
      new Date().toLocaleTimeString()
    );

    this.getData();
  }

  // =========================
  // LOAD TICKETS
  // =========================

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

        console.log('TICKETS:', this.tickets);

        // Required for the current frontend
        // change-detection issue
        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error(
          'FETCH ERROR:',
          error
        );
      }
    });
  }


  // =========================
  // SEARCH
  // =========================

  get filteredTickets(): Ticket[] {

    const search = this.searchTerm
      .trim()
      .toLowerCase()
      .replace(/^sb-/, '');

    if (!search) {
      return this.tickets;
    }

    return this.tickets.filter(ticket =>
      ticket.ticket_id
        .toString()
        .includes(search)
    );
  }


  // =========================
  // SELECTION
  // =========================

  toggleTicket(ticketId: number): void {

    if (this.selectedTickets.has(ticketId)) {

      this.selectedTickets.delete(ticketId);

    } else {

      this.selectedTickets.add(ticketId);

    }
  }


  isSelected(ticketId: number): boolean {

    return this.selectedTickets.has(ticketId);

  }


  selectAllVisible(): void {

    this.filteredTickets.forEach(ticket => {

      this.selectedTickets.add(
        ticket.ticket_id
      );

    });
  }


  toggleSelectAll(): void {

    if (this.allVisibleSelected()) {

      this.filteredTickets.forEach(ticket => {

        this.selectedTickets.delete(
          ticket.ticket_id
        );

      });

    } else {

      this.selectAllVisible();

    }
  }


  allVisibleSelected(): boolean {

    return (
      this.filteredTickets.length > 0 &&
      this.filteredTickets.every(ticket =>
        this.selectedTickets.has(
          ticket.ticket_id
        )
      )
    );

  }


  // =========================
  // UPDATE SINGLE STATUS
  // =========================

  updateStatus(ticket: Ticket): void {

    const newStatus =
      this.pendingStatuses[ticket.ticket_id];

    if (
      !newStatus ||
      newStatus === ticket.ticket_status
    ) {
      return;
    }

    const confirmed = window.confirm(
      `Change SB-${ticket.ticket_id} status ` +
      `from ${ticket.ticket_status} to ${newStatus}?`
    );

    if (!confirmed) {
      return;
    }

    this.ticketService
      .updateTicketStatus(
        ticket.ticket_id,
        newStatus
      )
      .subscribe({

        next: () => {

          ticket.ticket_status = newStatus;

          delete this.pendingStatuses[
            ticket.ticket_id
          ];

          console.log(
            `SB-${ticket.ticket_id} updated to ${newStatus}`
          );

          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error(
            `Failed to update SB-${ticket.ticket_id}:`,
            error
          );

        }

      });

  }


  // =========================
  // DELETE SINGLE TICKET
  // =========================

  deleteTicket(ticketId: number): void {

    const confirmed = window.confirm(
      `Are you sure you want to delete SB-${ticketId}?`
    );

    if (!confirmed) {
      return;
    }

    this.ticketService
      .deleteTicket(ticketId)
      .subscribe({

        next: () => {

          this.tickets =
            this.tickets.filter(
              ticket =>
                ticket.ticket_id !== ticketId
            );

          this.selectedTickets.delete(ticketId);

          delete this.pendingStatuses[
            ticketId
          ];

          console.log(
            `SB-${ticketId} deleted`
          );

          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error(
            `Failed to delete SB-${ticketId}:`,
            error
          );

        }

      });

  }


  // =========================
  // MASS DELETE
  // =========================

  deleteSelected(): void {

    const ticketIds =
      Array.from(this.selectedTickets);

    if (ticketIds.length === 0) {
      return;
    }

    const confirmed = window.confirm(
      `Delete ${ticketIds.length} selected ticket(s)?`
    );

    if (!confirmed) {
      return;
    }

    ticketIds.forEach(ticketId => {

      this.ticketService
        .deleteTicket(ticketId)
        .subscribe({

          next: () => {

            this.tickets =
              this.tickets.filter(
                ticket =>
                  ticket.ticket_id !== ticketId
              );

            this.selectedTickets.delete(
              ticketId
            );

            delete this.pendingStatuses[
              ticketId
            ];

            this.cdr.detectChanges();
          },

          error: (error) => {

            console.error(
              `Failed to delete SB-${ticketId}:`,
              error
            );

          }

        });

    });

  }


  // =========================
  // MASS STATUS UPDATE
  // =========================

  massUpdateStatus(): void {

    const ticketIds =
      Array.from(this.selectedTickets);

    if (ticketIds.length === 0) {
      return;
    }

    const newStatus = window.prompt(
      'Enter status: NEW, IN_PROGRESS, RESOLVED, or CLOSED'
    );

    if (!newStatus) {
      return;
    }

    const status = newStatus
      .trim()
      .toUpperCase();

    const validStatuses = [
      'NEW',
      'IN_PROGRESS',
      'RESOLVED',
      'CLOSED'
    ];

    if (!validStatuses.includes(status)) {

      window.alert(
        'Invalid ticket status.'
      );

      return;
    }

    const confirmed = window.confirm(
      `Change ${ticketIds.length} selected ` +
      `ticket(s) to ${status}?`
    );

    if (!confirmed) {
      return;
    }

    ticketIds.forEach(ticketId => {

      this.ticketService
        .updateTicketStatus(
          ticketId,
          status
        )
        .subscribe({

          next: () => {

            const ticket =
              this.tickets.find(
                ticket =>
                  ticket.ticket_id === ticketId
              );

            if (ticket) {
              ticket.ticket_status = status;
            }

            this.selectedTickets.delete(
              ticketId
            );

            this.cdr.detectChanges();
          },

          error: (error) => {

            console.error(
              `Failed to update SB-${ticketId}:`,
              error
            );

          }

        });

    });

  }

  formatLabel(value: string): string {
    return value
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase());
  }

}