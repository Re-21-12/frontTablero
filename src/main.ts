import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { AuthInterceptor } from './app/core/interceptors/auth.interceptor';
import { ErrorInterceptor } from './app/core/interceptors/error.interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withFetch(),
      withInterceptors([
        AuthInterceptor,
        ErrorInterceptor
      ])
    ),
    provideNoopAnimations()
  ]
}).catch(err => console.error(err));
