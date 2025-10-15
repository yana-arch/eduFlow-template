import { Component, inject, computed } from '@angular/core';
import { DataService } from '../../services/data.service';

// Define a simple Point interface for clarity
interface Point {
  x: number;
  y: number;
  value: number;
}

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
})
export class AdminDashboardComponent {
  private dataService = inject(DataService);
  
  stats = this.dataService.getAdminDashboardStats();
  private revenueData = this.dataService.getRevenueData();
  attendanceData = this.dataService.getAttendanceData();
  recentActivity = this.dataService.getRecentActivity();
  
  chartMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  private chartDimensions = { width: 500, height: 180, padding: 10 };

  gridLines = computed(() => {
    return [0, 0.25, 0.5, 0.75, 1].map(frac => ({
      y: frac * (this.chartDimensions.height - 2 * this.chartDimensions.padding) + this.chartDimensions.padding
    }));
  });
  
  revenuePoints = computed<Point[]>(() => {
    const data = this.revenueData();
    const maxVal = Math.max(...data, 1);
    const minVal = 0;
    
    return data.map((value, index) => {
      const x = (index / (data.length - 1)) * (this.chartDimensions.width - this.chartDimensions.padding * 2) + this.chartDimensions.padding;
      const y = (1 - (value - minVal) / (maxVal - minVal)) * (this.chartDimensions.height - 2 * this.chartDimensions.padding) + this.chartDimensions.padding;
      return { x, y, value };
    });
  });

  revenueLinePath = computed(() => {
    const points = this.revenuePoints();
    if (points.length < 2) return '';

    const smoothing = 0.2;

    const line = (pointA: Point, pointB: Point) => {
      const lengthX = pointB.x - pointA.x;
      const lengthY = pointB.y - pointA.y;
      return {
        length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
        angle: Math.atan2(lengthY, lengthX)
      };
    };

    const controlPoint = (current: Point, previous: Point | undefined, next: Point | undefined, reverse: boolean): [number, number] => {
      const p = previous || current;
      const n = next || current;
      const o = line(p, n);
      const angle = o.angle + (reverse ? Math.PI : 0);
      const length = o.length * smoothing;
      const x = current.x + Math.cos(angle) * length;
      const y = current.y + Math.sin(angle) * length;
      return [x, y];
    };
    
    return points.reduce((acc, point, i, a) => {
      if (i === 0) {
        return `M ${point.x.toFixed(2)},${point.y.toFixed(2)}`;
      }
      const [cpsX, cpsY] = controlPoint(a[i - 1], a[i - 2], point, false);
      const [cpeX, cpeY] = controlPoint(point, a[i - 1], a[i + 1], true);
      return `${acc} C ${cpsX.toFixed(2)},${cpsY.toFixed(2)} ${cpeX.toFixed(2)},${cpeY.toFixed(2)} ${point.x.toFixed(2)},${point.y.toFixed(2)}`;
    }, '');
  });

  revenueAreaPath = computed(() => {
    const points = this.revenuePoints();
    if (points.length < 2) return '';
    const linePath = this.revenueLinePath();
    const height = this.chartDimensions.height - this.chartDimensions.padding;
    return `${linePath} L ${points[points.length - 1].x.toFixed(2)} ${height} L ${points[0].x.toFixed(2)} ${height} Z`;
  });

  getIconPath(icon: string): string {
    const icons: Record<string, string> = {
      add_course: "M12 6.253v11.494m-9-5.747h18",
      enroll_student: "M17 20v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2m8-10a4 4 0 100-8 4 4 0 000 8zm8 11a3 3 0 100-6 3 3 0 000 6z",
      update_inventory: "M4 4v5h5M4 12h16M4 20h16",
      approve_budget: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
      system_task: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.096 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z"
    };
    return icons[icon] || "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z";
  }

  getStatIcon(icon: string): string {
    const icons: Record<string, string> = {
      users: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21v-1a6 6 0 00-5.197-5.93M9 21v-1a6 6 0 016-6v-1a6 6 0 00-9 5.197M12 15a4 4 0 110-8 4 4 0 010 8z" />',
      revenue: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />',
      events: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />',
      inventory: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />'
    };
    return icons[icon] || '';
  }
}