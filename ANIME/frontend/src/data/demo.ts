import type { AnimeDetail, EpisodeDetail, EpisodeSummary } from '../types/anime'

function buildEpisodes(count: number): { number: number; slug: string; url: string }[] {
  return Array.from({ length: count }, (_, index) => {
    const number = index + 1

    return {
      number,
      slug: '',
      url: '',
    }
  })
}

const coverBase = 'https://placehold.co/600x900'

export const demoAnimeCatalog: AnimeDetail[] = [
  {
    title: 'Sousou no Frieren',
    slug: 'sousou-no-frieren',
    type: 'tv',
    rating: '8.9',
    cover: `${coverBase}/18212f/e2e8f0?text=Frieren`,
    synopsis:
      'Una maga elfa recorre el mundo despues de la gran aventura, enfrentando la distancia entre una vida larga y los recuerdos humanos.',
    alternativeTitles: ['Frieren: Beyond Journey`s End'],
    status: 'Finalizado',
    genres: ['aventura', 'drama', 'fantasia'],
    nextAiringEpisode: null,
    episodes: buildEpisodes(6).map((episode) => ({
      ...episode,
      slug: `sousou-no-frieren-${episode.number}`,
      url: `#/anime/sousou-no-frieren/episode/${episode.number}`,
    })),
    related: [
      {
        title: 'Kaijuu 8-gou',
        relation: 'Recomendado',
        slug: 'kaijuu-8-gou',
        url: '#/anime/kaijuu-8-gou',
      },
    ],
    url: '#/anime/sousou-no-frieren',
  },
  {
    title: 'Kaijuu 8-gou',
    slug: 'kaijuu-8-gou',
    type: 'tv',
    rating: '8.4',
    cover: `${coverBase}/082f49/f8fafc?text=Kaiju+8`,
    synopsis:
      'Kafka Hibino recibe la oportunidad de pelear contra monstruos gigantes mientras intenta cumplir una vieja promesa.',
    alternativeTitles: ['Kaiju No. 8'],
    status: 'En emision',
    genres: ['accion', 'ciencia-ficcion', 'shounen'],
    nextAiringEpisode: 'Sabado 20:30',
    episodes: buildEpisodes(5).map((episode) => ({
      ...episode,
      slug: `kaijuu-8-gou-${episode.number}`,
      url: `#/anime/kaijuu-8-gou/episode/${episode.number}`,
    })),
    related: [
      {
        title: 'Solo Leveling',
        relation: 'Relacion similar',
        slug: 'solo-leveling',
        url: '#/anime/solo-leveling',
      },
    ],
    url: '#/anime/kaijuu-8-gou',
  },
  {
    title: 'Solo Leveling',
    slug: 'solo-leveling',
    type: 'tv',
    rating: '8.7',
    cover: `${coverBase}/33156d/f8fafc?text=Solo+Leveling`,
    synopsis:
      'Sung Jinwoo despierta un sistema que lo deja subir de nivel como si estuviera dentro de un videojuego.',
    alternativeTitles: ['Ore dake Level Up na Ken'],
    status: 'En emision',
    genres: ['accion', 'aventura', 'fantasia'],
    nextAiringEpisode: 'Domingo 18:00',
    episodes: buildEpisodes(4).map((episode) => ({
      ...episode,
      slug: `solo-leveling-${episode.number}`,
      url: `#/anime/solo-leveling/episode/${episode.number}`,
    })),
    related: [
      {
        title: 'Kaijuu 8-gou',
        relation: 'Fans tambien vieron',
        slug: 'kaijuu-8-gou',
        url: '#/anime/kaijuu-8-gou',
      },
    ],
    url: '#/anime/solo-leveling',
  },
]

export const demoLatestEpisodes: EpisodeSummary[] = [
  {
    title: 'Kaijuu 8-gou',
    animeSlug: 'kaijuu-8-gou',
    episodeSlug: 'kaijuu-8-gou-5',
    number: 5,
    cover: `${coverBase}/082f49/f8fafc?text=Kaiju+8`,
    url: '#/anime/kaijuu-8-gou/episode/5',
  },
  {
    title: 'Solo Leveling',
    animeSlug: 'solo-leveling',
    episodeSlug: 'solo-leveling-4',
    number: 4,
    cover: `${coverBase}/33156d/f8fafc?text=Solo+Leveling`,
    url: '#/anime/solo-leveling/episode/4',
  },
  {
    title: 'Sousou no Frieren',
    animeSlug: 'sousou-no-frieren',
    episodeSlug: 'sousou-no-frieren-6',
    number: 6,
    cover: `${coverBase}/18212f/e2e8f0?text=Frieren`,
    url: '#/anime/sousou-no-frieren/episode/6',
  },
]

export const demoEpisodesByNumber = new Map<string, EpisodeDetail>(
  demoAnimeCatalog.flatMap((anime) =>
    anime.episodes.map((episode) => [
      `${anime.slug}-${episode.number}`,
      {
        animeSlug: anime.slug,
        title: anime.title,
        number: episode.number,
        servers: [
          {
            name: 'Demo Server',
            download:
              'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            embed: null,
          },
        ],
      },
    ]),
  ),
)
