import { Component, inject, computed } from '@angular/core';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-student-dashboard',
  templateUrl: './student-dashboard.component.html',
})
export class StudentDashboardComponent {
  private dataService = inject(DataService);

  upcomingClasses = this.dataService.getUpcomingClasses();
  events = this.dataService.getStudentDashboardEvents();
  private gradeData = this.dataService.getGradeData();

  private chartDimensions = { width: 500, height: 180, padding: 10 };

  gridLines = computed(() => {
    return [0, 25, 50, 75, 100].map(i => ({
        y: (1 - i / 100) * (this.chartDimensions.height - 2 * this.chartDimensions.padding) + this.chartDimensions.padding
    }));
  });

  gradePoints = computed(() => {
    const data = this.gradeData();
    const maxVal = 100;
    const minVal = 0;
    
    return data.map((value, index) => {
      const x = (index / (data.length - 1)) * (this.chartDimensions.width - this.chartDimensions.padding * 2) + this.chartDimensions.padding;
      const y = (1 - (value - minVal) / (maxVal - minVal)) * (this.chartDimensions.height - 2 * this.chartDimensions.padding) + this.chartDimensions.padding;
      return { x, y, value };
    });
  });

  gradeLinePath = computed(() => {
    const points = this.gradePoints();
    if (points.length === 0) return '';
    return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  });

  gradeAreaPath = computed(() => {
    const points = this.gradePoints();
    if (points.length < 2) return '';
    const linePath = this.gradeLinePath();
    const height = this.chartDimensions.height - this.chartDimensions.padding;
    return `${linePath} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;
  });

  getIcon(icon: string): string {
    const icons: Record<string, string> = {
      calculator: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m-6 4h6m-6 4h6m2 4H7a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2v12a2 2 0 01-2 2z" />',
      beaker: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4H7zm0 0l-1-1m1 1l-1-1m1-15l-1 1m1-1l1 1" />',
      'paint-brush': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" />',
      briefcase: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />',
      'academic-cap': '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-5.998 12.078 12.078 0 01.665-6.479L12 14z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z" />',
      chip: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M12 6.344A6.344 6.344 0 005.656 12 6.344 6.344 0 0012 17.656 6.344 6.344 0 0018.344 12 6.344 6.344 0 0012 6.344z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.344V3m0 14.656V21" />'
    };
    return icons[icon] || '';
  }
}