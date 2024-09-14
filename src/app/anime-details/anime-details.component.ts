
import { Component, OnInit } from '@angular/core';
import { CommonModule, ViewportScroller } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AnimeService } from '../services/anime.service';

@Component({
  selector: 'app-anime-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './anime-details.component.html',
  styleUrls: ['./anime-details.component.css']
})
export class AnimeDetailsComponent implements OnInit {
  anime: any;
  isLoading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private animeService: AnimeService,
    private viewportScroller: ViewportScroller
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const animeId = +params['id']; // Convert to number
      this.getAnimeDetails(animeId);
      this.viewportScroller.scrollToPosition([0, 0]);
    });
  }

  getAnimeDetails(id: number) {
    this.animeService.getAnimeDetails(id).subscribe(
      (animeDetails) => {
        this.anime = animeDetails;
        this.isLoading = false;
      },
      (error) => {
        console.error('Error fetching anime details:', error);
        this.isLoading = false;
      }
    );
  }

  convertSeconds(seconds: number): string {
    const days = Math.floor(seconds / (3600 * 24));
    seconds %= 3600 * 24;
    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    const minutes = Math.floor(seconds / 60);

    return `${days}d ${hours}h ${minutes}m`;
  }

  getStudioNames(): string {
    return this.anime.studios.nodes.map((studio: any) => studio.name).join(', ');
  }

  getEndDate(): string {
    const { year, month, day } = this.anime.endDate;
    return year && month && day ? `${year}/${month}/${day}` : 'N/A';
  }
}