import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
// // import { Apollo, gql } from 'apollo-angular';

// Interface for Anime data
interface Anime {
  id: number;
  title: {
    english: string;
    romaji: string;
    native: string;
  };
  coverImage: {
    medium: string;
    large: string;
  };
  genres: string[];
  seasonYear: number;
  isAdult: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AnimeService {
  private apiUrl = 'https://graphql.anilist.co';

  constructor(private http: HttpClient) {}

  searchAnime(page: number = 1, perPage: number = 40, search?: string, genres?: string[], year?: number): Observable<Anime[]> {
    const query = `
      query ($page: Int, $perPage: Int, $search: String, $genres: [String], $year: Int) {
        Page (page: $page, perPage: $perPage) {
          media (type: ANIME, search: $search, genre_in: $genres, seasonYear: $year) {
            id
            title {
              english
              romaji
              native
            }
            coverImage {
              medium
              large
            }
            genres
            seasonYear
            isAdult
          }
        }
      }
    `;

    const variables = {
      page,
      perPage,
      search: search || null,
      genres: genres && genres.length > 0 ? genres : null,
      year: year || null
    };

    return this.makeGraphQLRequest(query, variables).pipe(
      map(response => response.data.Page.media.filter((anime: { isAdult: any; }) => !anime.isAdult))
    );

    //pagination stuff
    // return this.apollo.query<any>({
    //   query: SEARCH_ANIME,
    //   variables: {
    //     page: page,
    //     perPage: perPage,
    //     search: query,
    //     genre_in: genres,
    //     seasonYear: year
    //   }
    // }).pipe(
    //   map(result => ({
    //     anime: result.data.Page.media,
    //     totalItems: result.data.Page.pageInfo.total
    //   }))
    // );
  }

  getAnimeDetails(id: number): Observable<Anime> {
    const query = `
      query ($id: Int) {
        Media (id: $id, type: ANIME) {
          title {
            english
            romaji
            native
          }
          coverImage {
            medium
            large
          }
          bannerImage
          genres
          status
          startDate {
            year
            month
            day
          }
          endDate {
            year
            month
            day
          }
          studios {
            nodes {
              name
            }
          }
          episodes
          duration
          description
          nextAiringEpisode {
            episode
            airingAt
            timeUntilAiring
          }
          characters(role: MAIN) {
            edges {
              role
              node {
                name {
                  full
                }
                image {
                  large
                  medium
                }
              }
            }
          }
        }
      }
    `;

    const variables = { id };

    return this.makeGraphQLRequest(query, variables).pipe(
      map(response => response.data.Media)
    );
  }

  private makeGraphQLRequest(query: string, variables: any): Observable<any> {
    return this.http.post(this.apiUrl, {
      query,
      variables
    });
  }
}


//Pagination stuff
// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Observable } from 'rxjs';
// import { map } from 'rxjs/operators';
// import { Apollo, gql } from 'apollo-angular';

// // Interface for Anime data
// interface Anime {
//   id: number;
//   title: {
//     english: string;
//     romaji: string;
//     native: string;
//   };
//   coverImage: {
//     medium: string;
//     large: string;
//   };
//   genres: string[];
//   seasonYear: number;
//   isAdult: boolean;
// }

// @Injectable({
//   providedIn: 'root'
// })
// export class AnimeService {
//   private apiUrl = 'https://graphql.anilist.co';

//   constructor(private apollo: Apollo, private http: HttpClient) {}

//   private makeGraphQLRequest(query: string, variables: any): Observable<any> {
//     return this.http.post(this.apiUrl, {
//       query: query,
//       variables: variables
//     });
//   }

//   searchAnime(page: number = 1, perPage: number = 50, search?: string, genres?: string[], year?: number): Observable<{ anime: Anime[], totalItems: number }> {
//     const query = `
//       query ($page: Int, $perPage: Int, $search: String, $genres: [String], $year: Int) {
//         Page (page: $page, perPage: $perPage) {
//           media (type: ANIME, search: $search, genre_in: $genres, seasonYear: $year) {
//             id
//             title {
//               english
//               romaji
//               native
//             }
//             coverImage {
//               medium
//               large
//             }
//             genres
//             seasonYear
//             isAdult
//           }
//           pageInfo {
//             total
//           }
//         }
//       }
//     `;
//     const variables = {
//       page,
//       perPage,
//       search: search || null,
//       genres: genres && genres.length > 0 ? genres : null,
//       year: year || null
//     };
//     return this.makeGraphQLRequest(query, variables).pipe(
//       map((response: any) => ({
//         anime: response.data.Page.media.filter((anime: Anime) => !anime.isAdult),
//         totalItems: response.data.Page.pageInfo.total
//       }))
//     );
//   }

//   getAnimeDetails(id: number): Observable<Anime> {
//     const GET_ANIME_DETAILS = gql`
//       query ($id: Int) {
//         Media (id: $id, type: ANIME) {
//           title {
//             english
//             romaji
//             native
//           }
//           coverImage {
//             medium
//             large
//           }
//           bannerImage
//           genres
//           status
//           startDate {
//             year
//             month
//             day
//           }
//           endDate {
//             year
//             month
//             day
//           }
//           studios {
//             nodes {
//               name
//             }
//           }
//           episodes
//           duration
//           description
//           nextAiringEpisode {
//             episode
//             airingAt
//             timeUntilAiring
//           }
//           characters(role: MAIN) {
//             edges {
//               role
//               node {
//                 name {
//                   full
//                 }
//                 image {
//                   large
//                   medium
//                 }
//               }
//             }
//           }
//         }
//       }
//     `;
//     return this.apollo.query<any>({
//       query: GET_ANIME_DETAILS,
//       variables: { id }
//     }).pipe(
//       map(response => response.data.Media)
//     );
//   }
// }
