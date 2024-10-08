import { Routes } from '@angular/router';
import { LandingComponent } from './landing/landing.component';
import { SearchComponent } from './search/search.component';
import { AnimeDetailsComponent } from './anime-details/anime-details.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';

export const routes: Routes = [
    { path: '', component: LandingComponent },
    { path: 'search', component: SearchComponent },
    { path: 'anime/:id/:name', component: AnimeDetailsComponent },
    { path: 'login', component: LoginComponent },
    { path: 'signup', component: SignupComponent }
];
