import {
  trigger,
  transition,
  style,
  animate,
  keyframes,
} from '@angular/animations';

export const overlayFade = trigger('overlayFade', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('300ms ease-out', style({ opacity: 1 })),
  ]),
  transition(':leave', [
    animate('200ms ease-in', style({ opacity: 0 })),
  ]),
]);

export const tooltipSlide = trigger('tooltipSlide', [
  transition('* => *', [
    animate(
      '200ms ease-in-out',
      keyframes([
        style({ opacity: 0, transform: 'translateY(8px)', offset: 0 }),
        style({ opacity: 1, transform: 'translateY(0)', offset: 1 }),
      ])
    ),
  ]),
]);

export const spotlightPulse = trigger('spotlightPulse', [
  transition('* => *', [
    animate(
      '1500ms ease-in-out',
      keyframes([
        style({ boxShadow: '0 0 0 9999px rgba(0,0,0,0.5), 0 0 0 3px rgba(42,92,130,0.6)', offset: 0 }),
        style({ boxShadow: '0 0 0 9999px rgba(0,0,0,0.5), 0 0 8px 4px rgba(42,92,130,0.3)', offset: 0.5 }),
        style({ boxShadow: '0 0 0 9999px rgba(0,0,0,0.5), 0 0 0 3px rgba(42,92,130,0.6)', offset: 1 }),
      ])
    ),
  ]),
]);