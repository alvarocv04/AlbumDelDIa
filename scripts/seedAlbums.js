
import fs from 'fs';
import readline from 'readline';
import SpotifyWebApi from 'spotify-web-api-node';
import admin from 'firebase-admin';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Inicializar variables de entorno
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de Spotify
const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET
});

// Configuración de Firebase
let serviceAccount;
try {
    const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || path.join(__dirname, '../serviceAccountKey.json');
    if (fs.existsSync(keyPath)) {
        const keyContent = fs.readFileSync(keyPath, 'utf8');
        serviceAccount = JSON.parse(keyContent);

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log("✅ Firebase inicializado correctamente.");
    } else {
        console.error("❌ No se encontró el archivo serviceAccountKey.json.");
        process.exit(1);
    }
} catch (error) {
    console.error("Error inicializando Firebase:", error.message);
    process.exit(1);
}

const db = admin.firestore();

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function searchAppleMusicAlbum(artistName, albumName) {
    try {
        // Buscar en Apple Music usando su API de búsqueda
        const searchQuery = encodeURIComponent(`${artistName} ${albumName}`);
        const response = await fetch(
            `https://itunes.apple.com/search?term=${searchQuery}&entity=album&limit=5`
        );

        if (!response.ok) {
            return null;
        }

        const data = await response.json();

        if (data.results && data.results.length > 0) {
            // Buscar la mejor coincidencia
            const match = data.results.find(result => {
                const titleMatch = result.collectionName?.toLowerCase().includes(albumName.toLowerCase()) ||
                    albumName.toLowerCase().includes(result.collectionName?.toLowerCase());
                const artistMatch = result.artistName?.toLowerCase().includes(artistName.toLowerCase()) ||
                    artistName.toLowerCase().includes(result.artistName?.toLowerCase());
                return titleMatch && artistMatch;
            });

            if (match && match.collectionViewUrl) {
                return match.collectionViewUrl;
            }

            // Si no hay coincidencia exacta, devolver el primer resultado
            return data.results[0].collectionViewUrl || null;
        }

        return null;
    } catch (error) {
        console.warn(`⚠️ Error buscando en Apple Music: ${error.message}`);
        return null;
    }
}

async function searchAndSaveAlbum(artistName, albumName) {
    try {
        // Buscar el álbum en Spotify
        const searchData = await spotifyApi.searchAlbums(`album:${albumName} artist:${artistName}`);

        if (searchData.body.albums.items.length > 0) {
            const basicAlbum = searchData.body.albums.items[0];
            const albumId = basicAlbum.id;

            // Obtener detalles completos del álbum (para tracks)
            const albumData = await spotifyApi.getAlbum(albumId);
            const fullAlbum = albumData.body;

            // Obtener detalles del artista (para géneros)
            let genres = fullAlbum.genres || [];
            if (genres.length === 0 && fullAlbum.artists.length > 0) {
                const artistId = fullAlbum.artists[0].id;
                const artistData = await spotifyApi.getArtist(artistId);
                genres = artistData.body.genres;
            }

            // Buscar en Apple Music
            const appleMusicUrl = await searchAppleMusicAlbum(artistName, albumName);
            if (appleMusicUrl) {
                console.log(`🍎 Encontrado en Apple Music`);
            }

            // Mapear tracks
            const tracks = fullAlbum.tracks.items.map(track => ({
                name: track.name,
                duration_ms: track.duration_ms,
                track_number: track.track_number,
                preview_url: track.preview_url,
                id: track.id,
                explicit: track.explicit
            }));

            // Calcular duración total
            const duration_total_ms = tracks.reduce((acc, curr) => acc + curr.duration_ms, 0);

            const albumPayload = {
                spotifyId: albumId,
                title: fullAlbum.name,
                artist: fullAlbum.artists.map(a => a.name).join(', '),
                artistId: fullAlbum.artists[0]?.id,
                coverUrl: fullAlbum.images[0]?.url || '',
                releaseDate: fullAlbum.release_date,
                spotifyUrl: fullAlbum.external_urls.spotify,
                appleMusicUrl: appleMusicUrl || null,
                totalTracks: fullAlbum.total_tracks,
                popularity: fullAlbum.popularity,
                genres: genres,
                tracks: tracks,
                duration_total_ms: duration_total_ms,
                label: fullAlbum.label || '',
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            };

            // Convertir a JSON plano para evitar problemas con clases custom
            const plainPayload = JSON.parse(JSON.stringify(albumPayload));

            // Guardar en Firestore
            await db.collection('albums').doc(albumId).set(plainPayload);
            console.log(`✅ Guardado completo: ${fullAlbum.name} - ${tracks.length} tracks - ${genres.slice(0, 2).join(', ')}`);
            return true;
        } else {
            console.warn(`⚠️ No encontrado en Spotify: ${artistName} - ${albumName}`);
            return false;
        }
    } catch (error) {
        console.error(`❌ Error procesando ${artistName} - ${albumName}:`, error.message);
        if (error.statusCode === 429) {
            console.warn("⏳ Rate limit alcanzado, esperando 5 segundos...");
            await delay(5000);
            return searchAndSaveAlbum(artistName, albumName);
        }
        return false;
    }
}

async function processFile() {
    try {
        const data = await spotifyApi.clientCredentialsGrant();
        spotifyApi.setAccessToken(data.body['access_token']);
        console.log("🎵 Autenticado en Spotify correctamente.");

        const filePath = path.join(__dirname, '../albums.txt');
        const fileContent = fs.readFileSync(filePath, 'utf8');

        // Convertir a array y filtrar líneas vacías
        let lines = fileContent.split('\n')
            .map(line => line.trim())
            .filter(line => line && !line.startsWith('#'));

        // Algoritmo de Fisher-Yates para mezclar el array
        for (let i = lines.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [lines[i], lines[j]] = [lines[j], lines[i]];
        }

        console.log(`🔀 Lista aleatorizada. Procesando ${lines.length} álbumes...`);

        for (const line of lines) {
            // Intentar detectar separador
            let separator = null;
            if (line.includes(' - ')) separator = ' - ';
            else if (line.includes(' – ')) separator = ' – ';
            else if (line.includes(' — ')) separator = ' — ';
            else if (line.includes('-')) separator = '-';

            if (separator) {
                const parts = line.split(separator);
                const artist = parts[0].trim();
                const album = parts.slice(1).join(separator).trim();

                if (artist && album) {
                    await delay(300);
                    await searchAndSaveAlbum(artist, album);
                } else {
                    console.log(`⏩ Formato incorrecto: ${line}`);
                }
            } else {
                console.log(`⏩ Saltando línea sin separador: ${line}`);
            }
        }

        console.log("🏁 Proceso finalizado.");

    } catch (error) {
        console.error("Error global:", error);
    }
}

processFile();
