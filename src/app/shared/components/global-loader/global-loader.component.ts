import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { LoadingService } from '../../../core/services/loading.service';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-global-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './global-loader.component.html',
  styleUrls: ['./global-loader.component.css'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-in', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-out', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class GlobalLoaderComponent implements OnInit, OnDestroy {
  loading$!: Observable<boolean>;
  private subscription?: Subscription;

  constructor(private loadingService: LoadingService) {}

  ngOnInit(): void {
    this.loading$ = this.loadingService.loading$;
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
