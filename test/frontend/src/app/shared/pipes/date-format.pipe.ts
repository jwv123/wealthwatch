import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'wwDateFormat',
  standalone: true,
})
export class WwDateFormatPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '';
    const date = new Date(value + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}