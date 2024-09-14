//working don't touch
import { Component, OnDestroy, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, ViewportScroller, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AnimeService } from '../services/anime.service';
import { Subscription } from 'rxjs';
import slugify from 'slugify';

import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NgxSkeletonLoaderModule],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit, OnDestroy {
  searchQuery: string = '';
  selectedGenres: string[] = [];
  selectedGenresText: string = '';
  genreFilter: string = '';
  selectedYear: number | null = null;
  yearFilter: string = '';
  isGenreDropdownOpen: boolean = false;
  isYearDropdownOpen: boolean = false;
  isLoading: boolean = false;
  animeList: any[] = [];

  skeletonItems = new Array(50);

  genres: string[] = ['Action', 'Adventure', 'Comedy', 'Drama', 'Ecchi', 'Fantasy', 'Horror', 'Mahou Shoujo', 'Mecha', 'Music', 'Mystery', 'Psychological', 'Romance', 'Sci-fi', 'Slice of Life', 'Sports', 'Supernatural', 'Thriller'];
  filteredGenres: string[] = this.genres;
  years: number[] = [];
  filteredYears: number[] = [];

  private animeSubscription: Subscription | null = null;

  constructor(private animeService: AnimeService, private router: Router, private viewportScroller: ViewportScroller,@Inject(PLATFORM_ID) private platformId: Object) {
    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i >= 1940; i--) {
      this.years.push(i);
    }
    this.filteredYears = this.years;
  }

  ngOnInit() {
    this.getAnimeByPage();
    this.viewportScroller.scrollToPosition([0, 0]);

    // Add event listener for page reload
    // window.addEventListener('beforeunload', () => {
    //   this.isLoading = true;
    // });
    if (isPlatformBrowser(this.platformId)) {
      // Add event listener for page reload
      window.addEventListener('beforeunload', () => {
        this.isLoading = true;
      });

      document.addEventListener('click', this.onDocumentClick.bind(this));
    }
    

    // Check if we're running in a browser environment
    // if (typeof document !== 'undefined') {
    //   document.addEventListener('click', this.onDocumentClick.bind(this));
    // }
  }

  ngOnDestroy() {
    if (this.animeSubscription) {
      this.animeSubscription.unsubscribe();
    }

    // if (typeof document !== 'undefined') {
    //   document.removeEventListener('click', this.onDocumentClick.bind(this));
    // }
    if (isPlatformBrowser(this.platformId)) {
      document.removeEventListener('click', this.onDocumentClick.bind(this));
    }
  }

  onDocumentClick(event: MouseEvent) {
    const genreDropdown = document.querySelector('.dropdown-container') as HTMLElement;
    const yearDropdown = document.querySelector('.dropdown-container2') as HTMLElement;

    if (!genreDropdown.contains(event.target as Node)) {
      this.isGenreDropdownOpen = false;
    }

    if (!yearDropdown.contains(event.target as Node)) {
      this.isYearDropdownOpen = false;
    }
  }

  onSearch() {
    this.getAnimeByPage();
  }

  clearSearch() {
    this.searchQuery = '';
    this.getAnimeByPage();
  }

  toggleGenreDropdown(event: Event) {
    event.stopPropagation();
    this.isGenreDropdownOpen = !this.isGenreDropdownOpen;
    this.isYearDropdownOpen = false;
    if (this.isGenreDropdownOpen) {
      this.filterGenres();
    }
  }

  toggleGenre(genre: string, event: Event) {
    event.stopPropagation();
    const index = this.selectedGenres.indexOf(genre);
    if (index > -1) {
      this.selectedGenres.splice(index, 1);
    } else {
      this.selectedGenres.push(genre);
    }
    this.updateSelectedGenresText();
    this.getAnimeByPage();
  }

  updateSelectedGenresText() {
    this.selectedGenresText = this.selectedGenres.join(', ');
    this.genreFilter = this.selectedGenresText;
  }


  isGenreSelected(genre: string): boolean {
    return this.selectedGenres.includes(genre);
  }

  clearGenres(event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.selectedGenres = [];
    this.selectedGenresText = '';
    this.genreFilter = '';
    this.filteredGenres = this.genres;
    this.getAnimeByPage();
  }

  filterGenres() {
    this.filteredGenres = this.genres.filter(genre =>
      genre.toLowerCase().includes(this.genreFilter.toLowerCase())
    );
  }

  onGenreFilterInput() {
    this.filterGenres();
    this.isGenreDropdownOpen = true;
  }


  toggleYearDropdown(event: Event) {
    event.stopPropagation();
    this.isYearDropdownOpen = !this.isYearDropdownOpen;
    this.isGenreDropdownOpen = false;
    if (this.isYearDropdownOpen) {
      this.filterYears();
    }
  }

  selectYear(year: number) {
    this.selectedYear = year;
    this.isYearDropdownOpen = false;
    this.getAnimeByPage();
  }

  clearYear(event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.selectedYear = null;
    this.yearFilter = '';
    this.filteredYears = this.years;
    this.getAnimeByPage();
  }

  filterYears() {
    this.filteredYears = this.years.filter(year =>
      year.toString().includes(this.yearFilter)
    );
  }

  showAnime(anime: any) {
    const animeTitle = anime.title.english || anime.title.romaji || anime.title.native;
    const slugifiedTitle = slugify(animeTitle, '-');
    const finalUrl = `/anime/${anime.id}/${slugifiedTitle}`;
    this.router.navigateByUrl(finalUrl);
  }

  getAnimeByPage() {
    this.isLoading = true;

    this.animeList = []; // Clear the current list to show skeletons

    if (this.animeSubscription) {
      this.animeSubscription.unsubscribe();
    }

    this.animeSubscription = this.animeService.searchAnime(
      1,
      40,
      this.searchQuery,
      this.selectedGenres,
      this.selectedYear || undefined
    ).subscribe({
      next: (animeList) => {
        // this.isLoading = false;
        // this.animeList = animeList;
        setTimeout(() => { // Add a small delay to make the skeleton visible
          this.isLoading = false;
          this.animeList = animeList;
        }, 500);
      },
      error: (error) => {
        console.error('Error fetching anime:', error);
        this.isLoading = false;
      }
    });
  }
}

// import { Component, OnDestroy, OnInit, HostListener } from '@angular/core';
// import { CommonModule, ViewportScroller } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { RouterModule, Router } from '@angular/router';
// import { AnimeService } from '../services/anime.service';
// import { Subscription } from 'rxjs';
// import slugify from 'slugify';

// @Component({
//   selector: 'app-search',
//   standalone: true,
//   imports: [CommonModule, FormsModule, RouterModule],
//   templateUrl: './search.component.html',
//   styleUrls: ['./search.component.css']
// })
// export class SearchComponent implements OnInit, OnDestroy {
//   searchQuery: string = '';
//   selectedGenres: string[] = [];
//   selectedGenresText: string = '';
//   genreFilter: string = '';
//   selectedYear: number | null = null;
//   yearFilter: string = '';
//   isGenreDropdownOpen: boolean = false;
//   isYearDropdownOpen: boolean = false;
//   isLoading: boolean = false;
//   animeList: any[] = [];

//   genres: string[] = ['Action', 'Adventure', 'Comedy', 'Drama', 'Ecchi', 'Fantasy', 'Horror', 'Mahou Shoujo', 'Mecha', 'Music', 'Mystery', 'Psychological', 'Romance', 'Sci-fi', 'Slice of Life', 'Sports', 'Supernatural', 'Thriller'];
//   filteredGenres: string[] = this.genres;
//   years: number[] = [];
//   filteredYears: number[] = [];

//   currentPage: number = 1;
//   itemsPerPage: number = 50;
//   totalItems: number = 0;
//   hasMoreItems: boolean = true;
//   isLoadingMore: boolean = false;

//   private animeSubscription: Subscription | null = null;

//   constructor(private animeService: AnimeService, private router: Router, private viewportScroller: ViewportScroller) {
//     const currentYear = new Date().getFullYear();
//     for (let i = currentYear; i >= 1940; i--) {
//       this.years.push(i);
//     }
//     this.filteredYears = this.years;
//   }

//   ngOnInit() {
//     this.getAnimeByPage();
//     this.viewportScroller.scrollToPosition([0, 0]);

//     if (typeof document !== 'undefined') {
//       document.addEventListener('click', this.onDocumentClick.bind(this));
//     }
//   }

//   ngOnDestroy() {
//     if (this.animeSubscription) {
//       this.animeSubscription.unsubscribe();
//     }

//     if (typeof document !== 'undefined') {
//       document.removeEventListener('click', this.onDocumentClick.bind(this));
//     }
//   }

//   onDocumentClick(event: MouseEvent) {
//     const genreDropdown = document.querySelector('.dropdown-container') as HTMLElement;
//     const yearDropdown = document.querySelector('.dropdown-container2') as HTMLElement;

//     if (!genreDropdown.contains(event.target as Node)) {
//       this.isGenreDropdownOpen = false;
//     }

//     if (!yearDropdown.contains(event.target as Node)) {
//       this.isYearDropdownOpen = false;
//     }
//   }

//   onSearch() {
//     this.resetSearch();
//     this.getAnimeByPage();
//   }

//   clearSearch() {
//     this.searchQuery = '';
//     this.resetSearch();
//     this.getAnimeByPage();
//   }

//   toggleGenreDropdown(event: Event) {
//     event.stopPropagation();
//     this.isGenreDropdownOpen = !this.isGenreDropdownOpen;
//     this.isYearDropdownOpen = false;
//     if (this.isGenreDropdownOpen) {
//       this.filterGenres();
//     }
//   }

//   toggleGenre(genre: string, event: Event) {
//     event.stopPropagation();
//     const index = this.selectedGenres.indexOf(genre);
//     if (index > -1) {
//       this.selectedGenres.splice(index, 1);
//     } else {
//       this.selectedGenres.push(genre);
//     }
//     this.updateSelectedGenresText();
//     this.resetSearch();
//     this.getAnimeByPage();
//   }

//   updateSelectedGenresText() {
//     this.selectedGenresText = this.selectedGenres.join(', ');
//     this.genreFilter = this.selectedGenresText;
//   }

//   isGenreSelected(genre: string): boolean {
//     return this.selectedGenres.includes(genre);
//   }

//   clearGenres(event?: Event) {
//     if (event) {
//       event.preventDefault();
//       event.stopPropagation();
//     }
//     this.selectedGenres = [];
//     this.selectedGenresText = '';
//     this.genreFilter = '';
//     this.filteredGenres = this.genres;
//     this.resetSearch();
//     this.getAnimeByPage();
//   }

//   filterGenres() {
//     this.filteredGenres = this.genres.filter(genre =>
//       genre.toLowerCase().includes(this.genreFilter.toLowerCase())
//     );
//   }

//   onGenreFilterInput() {
//     this.filterGenres();
//     this.isGenreDropdownOpen = true;
//   }

//   toggleYearDropdown(event: Event) {
//     event.stopPropagation();
//     this.isYearDropdownOpen = !this.isYearDropdownOpen;
//     this.isGenreDropdownOpen = false;
//     if (this.isYearDropdownOpen) {
//       this.filterYears();
//     }
//   }

//   selectYear(year: number) {
//     this.selectedYear = year;
//     this.isYearDropdownOpen = false;
//     this.resetSearch();
//     this.getAnimeByPage();
//   }

//   clearYear(event?: Event) {
//     if (event) {
//       event.preventDefault();
//       event.stopPropagation();
//     }
//     this.selectedYear = null;
//     this.yearFilter = '';
//     this.filteredYears = this.years;
//     this.resetSearch();
//     this.getAnimeByPage();
//   }

//   filterYears() {
//     this.filteredYears = this.years.filter(year =>
//       year.toString().includes(this.yearFilter)
//     );
//   }

//   showAnime(anime: any) {
//     const animeTitle = anime.title.english || anime.title.romaji || anime.title.native;
//     const slugifiedTitle = slugify(animeTitle, '-');
//     const finalUrl = `/anime/${anime.id}/${slugifiedTitle}`;
//     this.router.navigateByUrl(finalUrl);
//   }

// getAnimeByPage() {
//   this.isLoading = true;

//   if (this.animeSubscription) {
//     this.animeSubscription.unsubscribe();
//   }

//   this.animeSubscription = this.animeService.searchAnime(
//     this.currentPage,
//     this.itemsPerPage,
//     this.searchQuery,
//     this.selectedGenres,
//     this.selectedYear || undefined
//   ).subscribe({
//     next: (response) => {
//       this.isLoading = false;
//       this.isLoadingMore = false;
//       if (this.currentPage === 1) {
//         this.animeList = response.anime;
//       } else {
//         this.animeList = [...this.animeList, ...response.anime];
//       }
//       this.totalItems = response.totalItems;
//       this.hasMoreItems = this.animeList.length < this.totalItems;
//     },
//     error: (error) => {
//       console.error('Error fetching anime:', error);
//       this.isLoading = false;
//       this.isLoadingMore = false;
//     }
//   });
// }

//   loadMore() {
//     if (this.hasMoreItems && !this.isLoadingMore) {
//       this.isLoadingMore = true;
//       this.currentPage++;
//       this.getAnimeByPage();
//     }
//   }

//   @HostListener('window:scroll', ['$event'])
//   onScroll() {
//     if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 500 && !this.isLoading && this.hasMoreItems) {
//       this.loadMore();
//     }
//   }

//   private resetSearch() {
//     this.currentPage = 1;
//     this.animeList = [];
//     this.hasMoreItems = true;
//   }
// }



//true
// import { Component, OnDestroy, OnInit } from '@angular/core';
// import { CommonModule, ViewportScroller } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { RouterModule, Router } from '@angular/router';
// import { AnimeService } from '../services/anime.service';
// import { Subscription } from 'rxjs';
// import slugify from 'slugify';

// @Component({
//   selector: 'app-search',
//   standalone: true,
//   imports: [CommonModule, FormsModule, RouterModule],
//   templateUrl: './search.component.html',
//   styleUrls: ['./search.component.css']
// })
// export class SearchComponent implements OnInit, OnDestroy {
//   searchQuery: string = '';
//   selectedGenres: string[] = [];
//   selectedGenresText: string = '';
//   genreFilter: string = '';
//   selectedYear: number | null = null;
//   yearFilter: string = '';
//   isGenreDropdownOpen: boolean = false;
//   isYearDropdownOpen: boolean = false;
//   isLoading: boolean = false;
//   animeList: any[] = [];

//   genres: string[] = ['Action', 'Adventure', 'Comedy', 'Drama', 'Ecchi', 'Fantasy', 'Horror', 'Mahou Shoujo', 'Mecha', 'Music', 'Mystery', 'Psychological', 'Romance', 'Sci-fi', 'Slice of Life', 'Sports', 'Supernatural', 'Thriller'];
//   filteredGenres: string[] = this.genres;
//   years: number[] = [];
//   filteredYears: number[] = [];

//   private animeSubscription: Subscription | null = null;

//   constructor(private animeService: AnimeService, private router: Router, private viewportScroller: ViewportScroller) {
//     const currentYear = new Date().getFullYear();
//     for (let i = currentYear; i >= 1940; i--) {
//       this.years.push(i);
//     }
//     this.filteredYears = this.years;
//   }

//   ngOnInit() {
//     this.getAnimeByPage();
//     this.viewportScroller.scrollToPosition([0, 0]);

//     // Check if we're running in a browser environment
//     if (typeof document !== 'undefined') {
//       document.addEventListener('click', this.onDocumentClick.bind(this));
//     }
//   }

//   ngOnDestroy() {
//     if (this.animeSubscription) {
//       this.animeSubscription.unsubscribe();
//     }

//     if (typeof document !== 'undefined') {
//       document.removeEventListener('click', this.onDocumentClick.bind(this));
//     }
//   }

//   onDocumentClick(event: MouseEvent) {
//     const genreDropdown = document.querySelector('.dropdown-container') as HTMLElement;
//     const yearDropdown = document.querySelector('.dropdown-container2') as HTMLElement;

//     if (!genreDropdown.contains(event.target as Node)) {
//       this.isGenreDropdownOpen = false;
//     }

//     if (!yearDropdown.contains(event.target as Node)) {
//       this.isYearDropdownOpen = false;
//     }
//   }

//   onSearch() {
//     this.getAnimeByPage();
//   }

//   clearSearch() {
//     this.searchQuery = '';
//     this.getAnimeByPage();
//   }

//   toggleGenreDropdown(event: Event) {
//     event.stopPropagation();
//     this.isGenreDropdownOpen = !this.isGenreDropdownOpen;
//     this.isYearDropdownOpen = false;
//     if (this.isGenreDropdownOpen) {
//       this.filterGenres();
//     }
//   }

//   toggleGenre(genre: string, event: Event) {
//     event.stopPropagation();
//     const index = this.selectedGenres.indexOf(genre);
//     if (index > -1) {
//       this.selectedGenres.splice(index, 1);
//     } else {
//       this.selectedGenres.push(genre);
//     }
//     // this.selectedGenresText = this.selectedGenres.join(', ');
//     this.updateSelectedGenresText();
//     this.getAnimeByPage();
//   }

//   updateSelectedGenresText() {
//     this.selectedGenresText = this.selectedGenres.join(', ');
//     this.genreFilter = this.selectedGenresText;
//   }


//   isGenreSelected(genre: string): boolean {
//     return this.selectedGenres.includes(genre);
//   }

//   clearGenres(event?: Event) {
//     if (event) {
//       event.preventDefault();
//       event.stopPropagation();
//     }
//     this.selectedGenres = [];
//     this.selectedGenresText = '';
//     this.genreFilter = '';
//     this.filteredGenres = this.genres;
//     this.getAnimeByPage();
//   }

//   filterGenres() {
//     this.filteredGenres = this.genres.filter(genre =>
//       genre.toLowerCase().includes(this.genreFilter.toLowerCase())
//     );
//   }

//   onGenreFilterInput() {
//     this.filterGenres();
//     this.isGenreDropdownOpen = true;
//   }


//   toggleYearDropdown(event: Event) {
//     event.stopPropagation();
//     this.isYearDropdownOpen = !this.isYearDropdownOpen;
//     this.isGenreDropdownOpen = false;
//     if (this.isYearDropdownOpen) {
//       this.filterYears();
//     }
//   }

//   selectYear(year: number) {
//     this.selectedYear = year;
//     this.isYearDropdownOpen = false;
//     this.getAnimeByPage();
//   }

//   clearYear(event?: Event) {
//     if (event) {
//       event.preventDefault();
//       event.stopPropagation();
//     }
//     this.selectedYear = null;
//     this.yearFilter = '';
//     this.filteredYears = this.years;
//     this.getAnimeByPage();
//   }

//   filterYears() {
//     this.filteredYears = this.years.filter(year =>
//       year.toString().includes(this.yearFilter)
//     );
//   }

//   showAnime(anime: any) {
//     const animeTitle = anime.title.english || anime.title.romaji || anime.title.native;
//     const slugifiedTitle = slugify(animeTitle, '-');
//     const finalUrl = `/anime/${anime.id}/${slugifiedTitle}`;
//     this.router.navigateByUrl(finalUrl);
//   }

//   getAnimeByPage() {
//     this.isLoading = true;

//     if (this.animeSubscription) {
//       this.animeSubscription.unsubscribe();
//     }

//     this.animeSubscription = this.animeService.searchAnime(
//       1,
//       50,
//       this.searchQuery,
//       this.selectedGenres,
//       this.selectedYear || undefined
//     ).subscribe({
//       next: (animeList) => {
//         this.isLoading = false;
//         // this.animeList = animeList;
//       },
//       error: (error) => {
//         console.error('Error fetching anime:', error);
//         this.isLoading = false;
//       }
//     });
//   }
// }






// import { Component, OnDestroy, OnInit } from '@angular/core';
// import { CommonModule, ViewportScroller } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { RouterModule, Router } from '@angular/router';
// import { AnimeService } from '../services/anime.service';
// import { Subscription } from 'rxjs';
// import slugify from 'slugify';

// interface AnimeListResponse {
//   anime: any[];
//   totalItems: number;
// }

// @Component({
//   selector: 'app-search',
//   standalone: true,
//   imports: [CommonModule, FormsModule, RouterModule],
//   templateUrl: './search.component.html',
//   styleUrls: ['./search.component.css']
// })
// export class SearchComponent implements OnInit, OnDestroy {
//   searchQuery: string = '';
//   selectedGenres: string[] = [];
//   selectedGenresText: string = '';
//   genreFilter: string = '';
//   selectedYear: number | null = null;
//   yearFilter: string = '';
//   isGenreDropdownOpen: boolean = false;
//   isYearDropdownOpen: boolean = false;
//   isLoading: boolean = false;
//   isLoadingMore: boolean = false;
//   animeList: any[] = [];
//   totalItems: number = 0;
//   currentPage: number = 1;
//   itemsPerPage: number = 50;
//   hasMoreItems: boolean = false;

//   genres: string[] = ['Action', 'Adventure', 'Comedy', 'Drama', 'Ecchi', 'Fantasy', 'Horror', 'Mahou Shoujo', 'Mecha', 'Music', 'Mystery', 'Psychological', 'Romance', 'Sci-fi', 'Slice of Life', 'Sports', 'Supernatural', 'Thriller'];
//   filteredGenres: string[] = this.genres;
//   years: number[] = [];
//   filteredYears: number[] = [];

//   private animeSubscription: Subscription | null = null;

//   constructor(
//     private animeService: AnimeService,
//     private router: Router,
//     private viewportScroller: ViewportScroller
//   ) {
//     const currentYear = new Date().getFullYear();
//     for (let i = currentYear; i >= 1940; i--) {
//       this.years.push(i);
//     }
//     this.filteredYears = this.years;
//   }

//   ngOnInit() {
//     this.getAnimeByPage();
//     this.viewportScroller.scrollToPosition([0, 0]);

//     if (typeof document !== 'undefined') {
//       document.addEventListener('click', this.onDocumentClick.bind(this));
//     }
//   }

//   ngOnDestroy() {
//     if (this.animeSubscription) {
//       this.animeSubscription.unsubscribe();
//     }

//     if (typeof document !== 'undefined') {
//       document.removeEventListener('click', this.onDocumentClick.bind(this));
//     }
//   }

//   onDocumentClick(event: MouseEvent) {
//     const genreDropdown = document.querySelector('.dropdown-container') as HTMLElement;
//     const yearDropdown = document.querySelector('.dropdown-container2') as HTMLElement;

//     if (!genreDropdown.contains(event.target as Node)) {
//       this.isGenreDropdownOpen = false;
//     }

//     if (!yearDropdown.contains(event.target as Node)) {
//       this.isYearDropdownOpen = false;
//     }
//   }

//   onSearch() {
//     this.currentPage = 1;
//     this.animeList = [];
//     this.getAnimeByPage();
//   }

//   clearSearch() {
//     this.searchQuery = '';
//     this.onSearch();
//   }

//   toggleGenreDropdown(event: Event) {
//     event.stopPropagation();
//     this.isGenreDropdownOpen = !this.isGenreDropdownOpen;
//     this.isYearDropdownOpen = false;
//     if (this.isGenreDropdownOpen) {
//       this.filterGenres();
//     }
//   }

//   toggleGenre(genre: string, event: Event) {
//     event.stopPropagation();
//     const index = this.selectedGenres.indexOf(genre);
//     if (index > -1) {
//       this.selectedGenres.splice(index, 1);
//     } else {
//       this.selectedGenres.push(genre);
//     }
//     this.updateSelectedGenresText();
//     this.onSearch();
//   }

//   updateSelectedGenresText() {
//     this.selectedGenresText = this.selectedGenres.join(', ');
//     this.genreFilter = this.selectedGenresText;
//   }

//   isGenreSelected(genre: string): boolean {
//     return this.selectedGenres.includes(genre);
//   }

//   clearGenres(event?: Event) {
//     if (event) {
//       event.preventDefault();
//       event.stopPropagation();
//     }
//     this.selectedGenres = [];
//     this.selectedGenresText = '';
//     this.genreFilter = '';
//     this.filteredGenres = this.genres;
//     this.onSearch();
//   }

//   filterGenres() {
//     this.filteredGenres = this.genres.filter(genre =>
//       genre.toLowerCase().includes(this.genreFilter.toLowerCase())
//     );
//   }

//   onGenreFilterInput() {
//     this.filterGenres();
//     this.isGenreDropdownOpen = true;
//   }

//   toggleYearDropdown(event: Event) {
//     event.stopPropagation();
//     this.isYearDropdownOpen = !this.isYearDropdownOpen;
//     this.isGenreDropdownOpen = false;
//     if (this.isYearDropdownOpen) {
//       this.filterYears();
//     }
//   }

//   selectYear(year: number) {
//     this.selectedYear = year;
//     this.isYearDropdownOpen = false;
//     this.onSearch();
//   }

//   clearYear(event?: Event) {
//     if (event) {
//       event.preventDefault();
//       event.stopPropagation();
//     }
//     this.selectedYear = null;
//     this.yearFilter = '';
//     this.filteredYears = this.years;
//     this.onSearch();
//   }

//   filterYears() {
//     this.filteredYears = this.years.filter(year =>
//       year.toString().includes(this.yearFilter)
//     );
//   }

//   showAnime(anime: any) {
//     const animeTitle = anime.title.english || anime.title.romaji || anime.title.native;
//     const slugifiedTitle = slugify(animeTitle, { lower: true, strict: true });
//     const finalUrl = `/anime/${anime.id}/${slugifiedTitle}`;
//     this.router.navigateByUrl(finalUrl);
//   }

//   getAnimeByPage() {
//     this.isLoading = true;

//     if (this.animeSubscription) {
//       this.animeSubscription.unsubscribe();
//     }

//     this.animeSubscription = this.animeService.searchAnime(
//       this.currentPage,
//       this.itemsPerPage,
//       this.searchQuery,
//       this.selectedGenres,
//       this.selectedYear || undefined
//     ).subscribe({
//       next: (response: AnimeListResponse) => {
//         this.isLoading = false;
//         this.animeList = this.currentPage === 1 ? response.anime : [...this.animeList, ...response.anime];
//         this.totalItems = response.totalItems;
//         this.hasMoreItems = this.animeList.length < this.totalItems;
//       },
//       error: (error) => {
//         console.error('Error fetching anime:', error);
//         this.isLoading = false;
//       }
//     });
//   }

//   loadMore() {
//     if (!this.isLoadingMore && this.hasMoreItems) {
//       this.isLoadingMore = true;
//       this.currentPage++;
//       this.animeService.searchAnime(
//         this.currentPage,
//         this.itemsPerPage,
//         this.searchQuery,
//         this.selectedGenres,
//         this.selectedYear || undefined
//       ).subscribe({
//         next: (response: AnimeListResponse) => {
//           this.animeList = [...this.animeList, ...response.anime];
//           this.hasMoreItems = this.animeList.length < this.totalItems;
//           this.isLoadingMore = false;
//         },
//         error: (error) => {
//           console.error('Error loading more anime:', error);
//           this.isLoadingMore = false;
//         }
//       });
//     }
//   }
// }