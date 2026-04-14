import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterBy'
})
export class FilterPipe implements PipeTransform {
  transform<T extends Record<string, unknown>>(items: T[] | null, field: string, term: string): T[] {
    if (!items || !field || !term) {
      return items || [];
    }

    const normalized = term.toLowerCase();
    return items.filter((item) => String(item[field] || '').toLowerCase().includes(normalized));
  }
}
