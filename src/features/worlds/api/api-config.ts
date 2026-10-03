export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://api.googoogaagaa.club';

export const API_TOKEN = process.env.EXPO_PUBLIC_API_TOKEN ?? '';

// The API returns 403 unless the request carries this exact Origin, and a browser cannot set Origin itself.
export const WORLD_REQUEST_ORIGIN =
  process.env.EXPO_PUBLIC_WORLD_REQUEST_ORIGIN ?? 'https://sosd.googoogaagaa.club';
