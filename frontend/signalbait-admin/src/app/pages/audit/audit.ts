import { Component, inject, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';

import {
  AuditLogService,
  AuditLog
} from '../../services/audit-log.service';

@Component({
  selector: 'app-audit-logs',
  imports: [
    DatePipe,
    FormsModule
  ],
  templateUrl: './audit.html',
  styleUrl: './audit.css'
})
export class Audit implements OnInit {

  private auditLogService = inject(AuditLogService);
  private cdr = inject(ChangeDetectorRef);

  logs: AuditLog[] = [];
  filteredLogs: AuditLog[] = [];

  selectedUser = 'all';
  selectedDate = 'all';

  users: string[] = [];
  dates: string[] = [];

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(): void {
    this.auditLogService.getAuditLogs().subscribe({
      next: (data) => {

        this.logs = data;

        // Get unique admins
        this.users = [
          ...new Set(
            this.logs.map(log => log.username)
          )
        ];

        // Get unique dates
        this.dates = [
          ...new Set(
            this.logs.map(log =>
              log.created_at.substring(0, 10)
            )
          )
        ];

        this.filterLogs();

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error(
          'Failed to load audit logs:',
          error
        );
      }
    });
  }

  filterLogs(): void {

    this.filteredLogs = this.logs.filter(log => {

      const userMatches =
        this.selectedUser === 'all' ||
        log.username === this.selectedUser;

      const dateMatches =
        this.selectedDate === 'all' ||
        log.created_at.startsWith(this.selectedDate);

      return userMatches && dateMatches;
    });
  }

  formatAction(action: string): string {
    return action
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase());
  }
}