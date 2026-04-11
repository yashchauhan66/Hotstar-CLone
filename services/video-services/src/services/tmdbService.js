

import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

/**
 * Search for a movie by title and return poster URL
 * @param {string} title - Movie title to search
 * @returns {Promise<string|null>} - Full poster URL or null if not found
 */
export const fetchMoviePoster = async (title) => {
  try {
    if (!TMDB_API_KEY) {
      console.warn(' TMDB_API_KEY not set in environment variables');
      return null;
    }

    if (!title || title.trim() === '') {
      console.warn(' No title provided for poster search');
      return null;
    }

    console.log(` Searching TMDb for: "${title}"`);


    const searchResponse = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
      params: {
        api_key: TMDB_API_KEY,
        query: title.trim(),
        language: 'en-US',
        page: 1,
        include_adult: false
      },
      timeout: 5000 
    });

    const results = searchResponse.data.results;

    if (!results || results.length === 0) {
      console.log(` No TMDb results found for: "${title}"`);
      return null;
    }

    
    const movie = results[0];
    const posterPath = movie.poster_path;

    if (!posterPath) {
      console.log(` No poster available for: "${title}"`);
      return null;
    }

    
    const posterUrl = `${TMDB_IMAGE_BASE_URL}/w500${posterPath}`;
    
    console.log(` Found poster for "${title}": ${posterUrl}`);
    console.log(`   TMDb Movie: ${movie.title} (${movie.release_date?.split('-')[0] || 'N/A'})`);
    
    return posterUrl;

  } catch (error) {
    console.error(' TMDb API error:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
    return null;
  }
};

/**
 * Get movie details including backdrop and additional info
 * @param {string} title - Movie title
 * @returns {Promise<Object|null>} - Movie details or null
 */
export const fetchMovieDetails = async (title) => {
  try {
    if (!TMDB_API_KEY || !title) return null;

    const searchResponse = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
      params: {
        api_key: TMDB_API_KEY,
        query: title.trim(),
        language: 'en-US',
        page: 1
      },
      timeout: 5000
    });

    const results = searchResponse.data.results;
    if (!results || results.length === 0) return null;

    const movie = results[0];
    
    return {
      title: movie.title,
      overview: movie.overview,
      posterUrl: movie.poster_path ? `${TMDB_IMAGE_BASE_URL}/w500${movie.poster_path}` : null,
      backdropUrl: movie.backdrop_path ? `${TMDB_IMAGE_BASE_URL}/original${movie.backdrop_path}` : null,
      releaseDate: movie.release_date,
      rating: movie.vote_average,
      genreIds: movie.genre_ids
    };

  } catch (error) {
    console.error(' TMDb details fetch error:', error.message);
    return null;
  }
};

export default { fetchMoviePoster, fetchMovieDetails };
