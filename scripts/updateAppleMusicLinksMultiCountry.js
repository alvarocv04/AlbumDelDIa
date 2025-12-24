
import admin from 'firebase-admin';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Inicializar variables de entorno
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Normalizar texto para mejor comparación
function normalizeText(text) {
    if (!text) return '';
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
        .replace(/[^a-z0-9\s]/g, '') // Solo alfanuméricos
        .replace(/\s+/g, ' ')
        .trim();
}

// Calcular similitud entre dos strings
function similarity(str1, str2) {
    const s1 = normalizeText(str1);
    const s2 = normalizeText(str2);

    if (s1 === s2) return 1;
    if (s1.includes(s2) || s2.includes(s1)) return 0.9;

    const words1 = new Set(s1.split(' ').filter(w => w.length > 2));
    const words2 = new Set(s2.split(' ').filter(w => w.length > 2));

    if (words1.size === 0 || words2.size === 0) return 0;

    const intersection = [...words1].filter(w => words2.has(w)).length;
    const union = new Set([...words1, ...words2]).size;

    return intersection / union;
}

// Países a buscar en orden de prioridad para música española/latina
const COUNTRIES = ['ES', 'MX', 'AR', 'US', 'CO', 'CL'];

async function searchInCountry(query, country) {
    const searchQuery = encodeURIComponent(query);
    const response = await fetch(
        `https://itunes.apple.com/search?term=${searchQuery}&entity=album&limit=10&country=${country}`
    );

    if (!response.ok) return [];

    const data = await response.json();
    return data.results || [];
}

async function searchAppleMusicAlbumMultiCountry(artistName, albumName) {
    // Limpiar el nombre del álbum
    const cleanAlbumName = albumName
        .replace(/\(.*?\)/g, '') // Quitar paréntesis
        .replace(/\[.*?\]/g, '') // Quitar corchetes
        .replace(/remaster(ed|izada)?/gi, '')
        .replace(/\d{4}/g, '') // Quitar años
        .replace(/edici[oó]n.*$/i, '')
        .replace(/edition.*$/i, '')
        .replace(/anniversary.*$/i, '')
        .replace(/aniversario.*$/i, '')
        .replace(/deluxe/gi, '')
        .trim();

    // Limpiar nombre del artista (quitar "feat." y colaboradores)
    const cleanArtistName = artistName
        .split(',')[0] // Solo primer artista
        .replace(/feat\.?.*$/i, '')
        .replace(/&.*$/i, '')
        .trim();

    const searchQueries = [
        `${artistName} ${albumName}`,
        `${cleanArtistName} ${cleanAlbumName}`,
        `${cleanArtistName} ${albumName.split(' ').slice(0, 3).join(' ')}`, // Solo primeras 3 palabras
        cleanAlbumName, // Solo álbum
        artistName // Solo artista (para encontrar cualquier álbum suyo)
    ];

    for (const country of COUNTRIES) {
        for (const query of searchQueries) {
            try {
                const results = await searchInCountry(query, country);

                if (results.length > 0) {
                    // Calcular puntuación para cada resultado
                    const scored = results.map(result => {
                        const titleSim = similarity(result.collectionName || '', albumName);
                        const artistSim = similarity(result.artistName || '', artistName);
                        const score = titleSim * 0.6 + artistSim * 0.4;

                        return { ...result, score, titleSim, artistSim };
                    });

                    scored.sort((a, b) => b.score - a.score);
                    const best = scored[0];

                    // Umbrales más bajos para esta segunda pasada
                    if (best.score >= 0.4 && best.collectionViewUrl) {
                        console.log(`      → Encontrado en ${country} con query: "${query.substring(0, 40)}..."`);
                        return best.collectionViewUrl;
                    }

                    if (best.titleSim >= 0.6 && best.collectionViewUrl) {
                        console.log(`      → Encontrado en ${country} (match título) con query: "${query.substring(0, 40)}..."`);
                        return best.collectionViewUrl;
                    }
                }
            } catch (e) {
                // Ignorar errores individuales
            }

            await delay(200); // Rate limiting entre queries
        }
    }

    return null;
}

async function updateMissingAppleMusicLinks() {
    try {
        console.log("🔄 Buscando álbumes SIN enlace de Apple Music...\n");

        const albumsSnapshot = await db.collection('albums').get();

        // Filtrar solo los que no tienen enlace
        const albumsToUpdate = albumsSnapshot.docs.filter(doc => {
            const album = doc.data();
            return !album.appleMusicUrl;
        });

        console.log(`📀 Encontrados ${albumsToUpdate.length} álbumes sin enlace de Apple Music\n`);
        console.log("🌍 Buscando en múltiples catálogos: ES, MX, AR, US, CO, CL\n");

        let updated = 0;
        let notFound = 0;
        const notFoundList = [];

        for (const doc of albumsToUpdate) {
            const album = doc.data();

            console.log(`🔍 [${updated + notFound + 1}/${albumsToUpdate.length}] ${album.artist} - ${album.title}`);

            const appleMusicUrl = await searchAppleMusicAlbumMultiCountry(album.artist, album.title);

            if (appleMusicUrl) {
                await db.collection('albums').doc(doc.id).update({
                    appleMusicUrl: appleMusicUrl,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                });
                console.log(`   ✅ Actualizado\n`);
                updated++;
            } else {
                console.log(`   ❌ No encontrado en ningún catálogo\n`);
                notFoundList.push(`${album.artist} - ${album.title}`);
                notFound++;
            }

            await delay(500);
        }

        console.log("\n" + "=".repeat(60));
        console.log("📊 RESUMEN BÚSQUEDA MULTI-PAÍS:");
        console.log("=".repeat(60));
        console.log(`   ✅ Nuevos enlaces encontrados: ${updated}`);
        console.log(`   ❌ Definitivamente no encontrados: ${notFound}`);

        if (notFoundList.length > 0) {
            console.log("\n📋 Álbumes que requieren búsqueda MANUAL:");
            console.log("-".repeat(60));
            notFoundList.forEach((album, i) => {
                console.log(`   ${i + 1}. ${album}`);
            });
            console.log("-".repeat(60));
            console.log("\n💡 Estos álbumes probablemente:");
            console.log("   - No están en Apple Music (licencia exclusiva Spotify)");
            console.log("   - Tienen un nombre muy diferente en Apple Music");
            console.log("   - Son ediciones regionales muy específicas");
        }

    } catch (error) {
        console.error("Error global:", error);
    }
}

updateMissingAppleMusicLinks();
