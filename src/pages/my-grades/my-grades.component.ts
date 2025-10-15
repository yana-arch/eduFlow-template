import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService, Grade } from '../../services/data.service';

interface GpaPoint {
  x: number;
  y: number;
  value: number;
  label: string;
}

@Component({
  selector: 'app-my-grades',
  templateUrl: './my-grades.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class MyGradesComponent {
  private dataService = inject(DataService);

  allGrades = this.dataService.getAllGrades();
  gradePoints = this.dataService.getGradePoints();

  semesters = computed(() => ['All', ...new Set(this.allGrades().map(g => g.semester))]);
  selectedSemester = signal('All');

  private chartDimensions = { width: 500, height: 200, padding: { top: 10, right: 10, bottom: 40, left: 30 } };
  
  filteredGrades = computed(() => {
    if (this.selectedSemester() === 'All') {
      return this.allGrades();
    }
    return this.allGrades().filter(g => g.semester === this.selectedSemester());
  });


  overallGPA = computed(() => {
    const grades = this.allGrades();
    if (grades.length === 0) return 0;
    const totalPoints = grades.reduce((acc, g) => acc + (this.gradePoints[g.grade] || 0) * g.credits, 0);
    const totalCredits = this.totalCredits();
    return totalCredits > 0 ? (totalPoints / totalCredits) : 0;
  });

  totalCredits = computed(() => this.allGrades().reduce((acc, g) => acc + g.credits, 0));
  
  gradeDistribution = computed(() => {
    const distribution = this.allGrades().reduce((acc, g) => {
        const mainGrade = g.grade.charAt(0);
        return {
          ...acc,
          [mainGrade]: (acc[mainGrade] || 0) + 1
        };
    }, {} as Record<string, number>);

    const total = this.allGrades().length;
    
    const segments = Object.entries(distribution).map(([grade, count]) => ({
      grade,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0,
    }));

    type SegmentWithOffset = { grade: string, count: number, percentage: number, offset: number };

    return segments.reduce((acc: SegmentWithOffset[], segment) => {
      const last = acc[acc.length - 1];
      const offset = last ? last.offset + last.percentage : 0;
      return [...acc, { ...segment, offset }];
    }, [] as SegmentWithOffset[]);
  });

  // --- GPA Trend Chart Logic ---

  private sortSemesters(semesters: string[]): string[] {
    return semesters.sort((a, b) => {
      const [seasonA, yearA] = a.split(' ');
      const [seasonB, yearB] = b.split(' ');
      if (yearA !== yearB) return Number(yearA) - Number(yearB);
      return seasonA === 'Spring' ? -1 : 1; // Assuming Spring comes before Fall
    });
  }

  semesterGPATrend = computed(() => {
    const gradesBySemester = this.allGrades().reduce((acc, grade) => {
      acc[grade.semester] = [...(acc[grade.semester] || []), grade];
      return acc;
    }, {} as Record<string, Grade[]>);

    const sortedSemesters = this.sortSemesters(Object.keys(gradesBySemester));

    return sortedSemesters.map(semester => {
        const semesterGrades = gradesBySemester[semester];
        const totalPoints = semesterGrades.reduce((acc, g) => acc + (this.gradePoints[g.grade] || 0) * g.credits, 0);
        const totalCredits = semesterGrades.reduce((acc, g) => acc + g.credits, 0);
        const gpa = totalCredits > 0 ? (totalPoints / totalCredits) : 0;
        return { semester, gpa };
    });
  });
  
  gpaGridLines = computed(() => {
    const { height, padding } = this.chartDimensions;
    return [1.0, 2.0, 3.0, 4.0].map(gpa => ({
      y: (1 - gpa / 4.0) * (height - padding.top - padding.bottom) + padding.top,
      gpa
    }));
  });

  gpaChartPoints = computed<GpaPoint[]>(() => {
    const data = this.semesterGPATrend();
    if (data.length === 0) return [];

    const { width, height, padding } = this.chartDimensions;
    const maxVal = 4.0;
    const minVal = 0;
    
    return data.map((value, index) => {
      const x = (index / (data.length - 1)) * (width - padding.left - padding.right) + padding.left;
      const y = (1 - (value.gpa - minVal) / (maxVal - minVal)) * (height - padding.top - padding.bottom) + padding.top;
      return { x, y, value: value.gpa, label: value.semester };
    });
  });
  
  gpaLinePath = computed(() => {
    const points = this.gpaChartPoints();
    if (points.length < 2) return '';
    return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ');
  });

  gpaAreaPath = computed(() => {
    const points = this.gpaChartPoints();
    if (points.length < 2) return '';
    const linePath = this.gpaLinePath();
    const { height, padding } = this.chartDimensions;
    const chartHeight = height - padding.bottom;
    return `${linePath} L ${points[points.length - 1].x.toFixed(2)} ${chartHeight} L ${points[0].x.toFixed(2)} ${chartHeight} Z`;
  });


  filterBySemester(semester: string) {
    this.selectedSemester.set(semester);
  }
}
