
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

// Calcular similitud entre dos strings (Levenshtein simplificado)
function similarity(str1, str2) {
    const s1 = normalizeText(str1);
    const s2 = normalizeText(str2);

    if (s1 === s2) return 1;
    if (s1.includes(s2) || s2.includes(s1)) return 0.9;

    // Jaccard similarity basada en palabras
    const words1 = new Set(s1.split(' ').filter(w => w.length > 2));
    const words2 = new Set(s2.split(' ').filter(w => w.length > 2));

    if (words1.size === 0 || words2.size === 0) return 0;

    const intersection = [...words1].filter(w => words2.has(w)).length;
    const union = new Set([...words1, ...words2]).size;

    return intersection / union;
}

async function searchAppleMusicAlbum(artistName, albumName) {
    try {
        // Estrategia 1: Búsqueda exacta con artista y álbum
        let result = await trySearch(`${artistName} ${albumName}`, artistName, albumName);
        if (result) return result;

        // Estrategia 2: Solo nombre del álbum (a veces el artista confunde)
        result = await trySearch(albumName, artistName, albumName);
        if (result) return result;

        // Estrategia 3: Solo artista + primera palabra del álbum
        const firstWordAlbum = albumName.split(' ')[0];
        if (firstWordAlbum.length > 3) {
            result = await trySearch(`${artistName} ${firstWordAlbum}`, artistName, albumName);
            if (result) return result;
        }

        // Estrategia 4: Nombre del álbum sin paréntesis ni extras
        const cleanAlbumName = albumName.replace(/\(.*?\)/g, '').trim();
        if (cleanAlbumName !== albumName) {
            result = await trySearch(`${artistName} ${cleanAlbumName}`, artistName, cleanAlbumName);
            if (result) return result;
        }

        return null;
    } catch (error) {
        console.warn(`⚠️ Error buscando en Apple Music: ${error.message}`);
        return null;
    }
}

async function trySearch(query, artistName, albumName) {
    const searchQuery = encodeURIComponent(query);
    const response = await fetch(
        `https://itunes.apple.com/search?term=${searchQuery}&entity=album&limit=10&country=US`
    );

    if (!response.ok) {
        return null;
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
        return null;
    }

    // Calcular puntuación para cada resultado
    const scored = data.results.map(result => {
        const titleSim = similarity(result.collectionName || '', albumName);
        const artistSim = similarity(result.artistName || '', artistName);

        // Puntuación ponderada (título más importante)
        const score = titleSim * 0.6 + artistSim * 0.4;

        return {
            ...result,
            score,
            titleSim,
            artistSim
        };
    });

    // Ordenar por puntuación
    scored.sort((a, b) => b.score - a.score);

    const best = scored[0];

    // Umbral mínimo de aceptación
    if (best.score >= 0.5 && best.collectionViewUrl) {
        return best.collectionViewUrl;
    }

    // Si la similitud del título es muy alta, aceptar aunque el artista no coincida tanto
    if (best.titleSim >= 0.8 && best.collectionViewUrl) {
        return best.collectionViewUrl;
    }

    return null;
}

async function updateAppleMusicLinks() {
    try {
        console.log("🔄 Obteniendo álbumes de Firestore...\n");
        const albumsSnapshot = await db.collection('albums').get();

        console.log(`📀 Encontrados ${albumsSnapshot.size} álbumes\n`);

        let updated = 0;
        let skipped = 0;
        let notFound = 0;
        const notFoundList = [];

        for (const doc of albumsSnapshot.docs) {
            const album = doc.data();

            // Si ya tiene enlace de Apple Music, saltar
            if (album.appleMusicUrl) {
                console.log(`⏩ Saltando: ${album.artist} - ${album.title}`);
                skipped++;
                continue;
            }

            console.log(`🔍 Buscando: ${album.artist} - ${album.title}`);

            // Buscar en Apple Music
            const appleMusicUrl = await searchAppleMusicAlbum(album.artist, album.title);

            if (appleMusicUrl) {
                // Actualizar el documento
                await db.collection('albums').doc(doc.id).update({
                    appleMusicUrl: appleMusicUrl,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                });
                console.log(`   ✅ Encontrado: ${appleMusicUrl}\n`);
                updated++;
            } else {
                console.log(`   ❌ No encontrado\n`);
                notFoundList.push(`${album.artist} - ${album.title}`);
                notFound++;
            }

            // Delay para evitar rate limiting
            await delay(600);
        }

        console.log("\n" + "=".repeat(60));
        console.log("📊 RESUMEN:");
        console.log("=".repeat(60));
        console.log(`   ✅ Actualizados: ${updated}`);
        console.log(`   ⏩ Saltados (ya tenían enlace): ${skipped}`);
        console.log(`   ❌ No encontrados: ${notFound}`);
        console.log(`   📀 Total procesados: ${albumsSnapshot.size}`);

        if (notFoundList.length > 0) {
            console.log("\n📋 Álbumes NO encontrados en Apple Music:");
            console.log("-".repeat(60));
            notFoundList.forEach((album, i) => {
                console.log(`   ${i + 1}. ${album}`);
            });
            console.log("-".repeat(60));
            console.log("💡 Tip: Estos álbumes pueden requerir búsqueda manual o");
            console.log("   pueden no estar disponibles en Apple Music.");
        }

    } catch (error) {
        console.error("Error global:", error);
    }
}

updateAppleMusicLinks();
