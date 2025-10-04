import { bootstrapApplication, provideProtractorTestingSupport } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    provideIonicAngular(),
    provideRouter(routes),
    provideHttpClient()   ,
    provideHttpClient(withFetch())
  ]
});

