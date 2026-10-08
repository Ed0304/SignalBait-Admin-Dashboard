import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { NgxEchartsDirective } from 'ngx-echarts';
import { EChartsOption } from 'echarts';

import {
  AnalyticsService,
  AnalyticsResponse
} from '../../services/analytics.service';

@Component({
  selector: 'app-analytics',
  imports: [
    FormsModule,
    NgxEchartsDirective
  ],
  templateUrl: './analytics.html',
  styleUrl: './analytics.css'
})
export class Analytics implements OnInit {

  private analyticsService = inject(AnalyticsService);
  private cdr = inject(ChangeDetectorRef);

  chartType = 'bar';
  analyseBy = 'issue_type';
  sortOrder = 'ascending';

  chartOption: EChartsOption = {};

  ngOnInit(): void {
    this.loadChart();
  }

  loadChart(): void {
    this.analyticsService
      .getAnalytics(this.analyseBy, this.sortOrder)
      .subscribe({
        next: (data) => {
          this.buildChart(data);
        },
        error: (error) => {
          console.error('Failed to load analytics:', error);
        }
      });
  }

  onSettingsChange(): void {

    if (this.chartType === 'line') {
      this.analyseBy = 'created_at';
    } else if (this.analyseBy === 'created_at') {
      this.analyseBy = 'issue_type';
    }

    this.loadChart();
  }

  buildChart(data: AnalyticsResponse): void {

    // BAR
    if (this.chartType === 'bar') {

      const source =
        this.analyseBy === 'ticket_status'
          ? data.status
          : data.issues;

      this.chartOption = {
        tooltip: {
          trigger: 'axis'
        },

        xAxis: {
          type: 'category',
          data: source.map(item =>
            'issue_type' in item
              ? this.formatLabel(item.issue_type)
              : item.ticket_status
          )
        },

        yAxis: {
          type: 'value'
        },

        series: [
          {
            type: 'bar',
            data: source.map(item => item.count)
          }
        ]
      };
    }

    // PIE
    else if (this.chartType === 'pie') {

      const source =
        this.analyseBy === 'ticket_status'
          ? data.status
          : data.issues;

      const pieData = source.map(item => ({
        name:
          'issue_type' in item
            ? this.formatLabel(item.issue_type)
            : item.ticket_status,

        value: item.count
      }));

      this.chartOption = {
        tooltip: {
          trigger: 'item',

          formatter: (params: any) => {
            return `
              <strong>${params.name}</strong><br>
              Tickets: ${params.value}<br>
              Percentage: ${params.percent}%
            `;
          }
        },

        legend: {
          orient: 'vertical',
          left: 'left'
        },

        series: [
          {
            type: 'pie',

            radius: ['45%', '70%'],

            center: ['60%', '50%'],

            data: pieData,

            label: {
              show: true,
              formatter: '{b}: {d}%'
            },

            labelLine: {
              show: true
            },

            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0
              }
            }
          }
        ]
      };
    }

    // LINE
    else if (this.chartType === 'line') {

      this.chartOption = {
        tooltip: {
          trigger: 'axis'
        },

        xAxis: {
          type: 'category',
          data: data.daily.map(item => item.date)
        },

        yAxis: {
          type: 'value'
        },

        series: [
          {
            type: 'line',
            data: data.daily.map(item => item.count)
          }
        ]
      };
    }

    // Update the chart immediately
    this.cdr.detectChanges();
  }

  formatLabel(value: string): string {
    return value
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase());
  }
}