const BASE_URL = 'https://pokeapi.co/api/v2';
const apiCache = new Map();

export function getArtworkUrl(id) {
  if (!id) return '';
  return `https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/other/official-artwork/${id}.png`;
}

export function getSpriteUrl(id) {
  if (!id) return '';
  return `https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/${id}.png`;
}

export function getIdFromUrl(url) {
  if (!url) return 0;
  const parts = url.split('/').filter(Boolean);
  const parsed = parseInt(parts[parts.length - 1], 10);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function fallbackPokemon(id, name = `pokemon-${id}`) {
  return {
    id,
    name,
    artwork: getArtworkUrl(id),
    sprite: getSpriteUrl(id),
    types: ['normal'],
    height: 1,
    weight: 10,
    stats: [
      { name: 'hp', value: 60 },
      { name: 'attack', value: 60 },
      { name: 'defense', value: 60 },
      { name: 'special-attack', value: 60 },
      { name: 'special-defense', value: 60 },
      { name: 'speed', value: 60 },
    ],
  };
}

function generateSequentialFallback(offset = 171, limit = 30) {
  const results = [];
  for (let id = offset + 1; id <= Math.min(offset + limit, 1025); id++) {
    results.push({
      id,
      name: `pokemon-${id}`,
      artwork: getArtworkUrl(id),
      sprite: getSpriteUrl(id),
    });
  }
  return results;
}

async function fetchJson(url) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`PokeAPI request failed (${response.status})`);
    return await response.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function fetchPokemonList(offset = 171, limit = 30) {
  const safeOffset = Number.isFinite(Number(offset)) ? Number(offset) : 171;
  const safeLimit = Number.isFinite(Number(limit)) ? Number(limit) : 30;
  const cacheKey = `list_${safeOffset}_${safeLimit}`;
  if (apiCache.has(cacheKey)) return apiCache.get(cacheKey);

  try {
    const data = await fetchJson(`${BASE_URL}/pokemon?offset=${safeOffset}&limit=${safeLimit}`);
    const results = data.results.map(item => {
      const id = getIdFromUrl(item.url);
      return { id, name: item.name, artwork: getArtworkUrl(id), sprite: getSpriteUrl(id) };
    });
    apiCache.set(cacheKey, results);
    return results;
  } catch (error) {
    console.warn('fetchPokemonList:', error.message);
    return generateSequentialFallback(safeOffset, safeLimit);
  }
}

export async function fetchAllPokemonNames() {
  const cacheKey = 'all_names';
  if (apiCache.has(cacheKey)) return apiCache.get(cacheKey);

  try {
    const data = await fetchJson(`${BASE_URL}/pokemon?limit=1025`);
    const results = data.results.map(item => {
      const id = getIdFromUrl(item.url);
      return { id, name: item.name, artwork: getArtworkUrl(id), sprite: getSpriteUrl(id) };
    });
    apiCache.set(cacheKey, results);
    return results;
  } catch (error) {
    console.warn('fetchAllPokemonNames:', error.message);
    return generateSequentialFallback(171, 854);
  }
}

export async function fetchPokemonDetail(idOrName) {
  if (idOrName == null || String(idOrName).trim() === '') {
    throw new Error('A Pokémon ID or name is required.');
  }

  const safeParam = String(idOrName).trim().toLowerCase();
  const cacheKey = `detail_${safeParam}`;
  if (apiCache.has(cacheKey)) return apiCache.get(cacheKey);

  try {
    const data = await fetchJson(`${BASE_URL}/pokemon/${encodeURIComponent(safeParam)}`);
    const detail = {
      id: data.id,
      name: data.name,
      types: data.types.map(t => t.type.name),
      height: data.height / 10,
      weight: data.weight / 10,
      artwork: getArtworkUrl(data.id),
      sprite: getSpriteUrl(data.id),
      stats: data.stats.map(s => ({ name: s.stat.name, value: s.base_stat })),
    };
    apiCache.set(cacheKey, detail);
    return detail;
  } catch (error) {
    console.warn(`fetchPokemonDetail(${safeParam}):`, error.message);
    // Do not silently return Pichu or another unrelated Pokémon.
    throw error;
  }
}

export async function fetchPokemonByType(typeName = 'normal') {
  const safeType = String(typeName || 'normal').toLowerCase();
  const cacheKey = `type_${safeType}`;
  if (apiCache.has(cacheKey)) return apiCache.get(cacheKey);

  try {
    const data = await fetchJson(`${BASE_URL}/type/${encodeURIComponent(safeType)}`);
    const results = data.pokemon.map(item => {
      const id = getIdFromUrl(item.pokemon.url);
      return { id, name: item.pokemon.name, artwork: getArtworkUrl(id), sprite: getSpriteUrl(id) };
    }).sort((a, b) => a.id - b.id);
    apiCache.set(cacheKey, results);
    return results;
  } catch (error) {
    console.warn('fetchPokemonByType:', error.message);
    return [];
  }
}
