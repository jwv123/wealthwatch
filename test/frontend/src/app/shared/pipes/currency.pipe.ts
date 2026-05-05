import { Pipe, PipeTransform, inject } from '@angular/core';
import { CurrencyService } from '../../core/currency/currency.service';

@Pipe({
  name: 'wwCurrency',
  standalone: true,
  pure: false,
})
export class WwCurrencyPipe implements PipeTransform {
  private currencyService = inject(CurrencyService);

  transform(value: number | null | undefined, currency?: string): string {
    if (value == null) return '--';
    const code = currency ?? this.currencyService.currency();
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: code,
        minimumFractionDigits: 2,
      }).format(value);
    } catch {
      return `${code} ${value.toFixed(2)}`;
    }
  }
}