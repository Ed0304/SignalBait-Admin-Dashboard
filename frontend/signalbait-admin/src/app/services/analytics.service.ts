import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface AnalyticsResponse {
  status: {
    ticket_status: string;
    count: number;
  }[];

  issues: {
    issue_type: string;
    count: number;
  }[];

  daily: {
    date: string;
    count: number;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {

  private http = inject(HttpClient);

  private apiUrl = 'https://signal-bait-admin-dashboard-sand.vercel.app/api';

  getAnalytics(
    analyseBy: string,
    sortOrder: string
  ) {
    return this.http.get<AnalyticsResponse>(
      `${this.apiUrl}/analytics/`,
      {
        params: {
          analyse_by: analyseBy,
          sort_order: sortOrder
        },
        withCredentials: true
      }
    );
  }
}