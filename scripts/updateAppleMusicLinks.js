
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

async function updateAppleMusicLinks() {
    try {
        console.log("🔄 Obteniendo álbumes de Firestore...");
        const albumsSnapshot = await db.collection('albums').get();

        console.log(`📀 Encontrados ${albumsSnapshot.size} álbumes`);

        let updated = 0;
        let skipped = 0;
        let notFound = 0;

        for (const doc of albumsSnapshot.docs) {
            const album = doc.data();

            // Si ya tiene enlace de Apple Music, saltar
            if (album.appleMusicUrl) {
                console.log(`⏩ Saltando ${album.title} - ya tiene enlace de Apple Music`);
                skipped++;
                continue;
            }

            console.log(`🔍 Buscando en Apple Music: ${album.artist} - ${album.title}`);

            // Buscar en Apple Music
            const appleMusicUrl = await searchAppleMusicAlbum(album.artist, album.title);

            if (appleMusicUrl) {
                // Actualizar el documento
                await db.collection('albums').doc(doc.id).update({
                    appleMusicUrl: appleMusicUrl,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                });
                console.log(`✅ Actualizado: ${album.title} - ${appleMusicUrl}`);
                updated++;
            } else {
                console.log(`❌ No encontrado en Apple Music: ${album.title}`);
                notFound++;
            }

            // Pequeño delay para evitar rate limiting
            await delay(500);
        }

        console.log("\n📊 Resumen:");
        console.log(`   ✅ Actualizados: ${updated}`);
        console.log(`   ⏩ Saltados (ya tenían enlace): ${skipped}`);
        console.log(`   ❌ No encontrados: ${notFound}`);
        console.log(`   📀 Total: ${albumsSnapshot.size}`);

    } catch (error) {
        console.error("Error global:", error);
    }
}

updateAppleMusicLinks();
