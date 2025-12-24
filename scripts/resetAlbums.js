/**
 * Script para resetear los álbumes:
 * 1. Quitar el flag wasShown de todos los álbumes
 * 2. Eliminar el lastShownDate de todos los álbumes
 * 3. Eliminar todo el historial de daily_history (pruebas)
 * 
 * Ejecutar con: node scripts/resetAlbums.js
 */

import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

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

async function resetAlbumFlags() {
    console.log("\n📀 Reseteando flags de álbumes...\n");

    const albumsRef = db.collection('albums');
    const snapshot = await albumsRef.get();

    let count = 0;
    const batch = db.batch();

    snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.wasShown || data.lastShownDate) {
            batch.update(doc.ref, {
                wasShown: admin.firestore.FieldValue.delete(),
                lastShownDate: admin.firestore.FieldValue.delete()
            });
            count++;
            console.log(`🔄 Preparando reset: ${data.title} - ${data.artist}`);
        }
    });

    if (count > 0) {
        await batch.commit();
        console.log(`\n✅ ${count} álbumes reseteados correctamente.`);
    } else {
        console.log("\n📝 No hay álbumes con flags para resetear.");
    }

    return count;
}

async function clearDailyHistory() {
    console.log("\n📅 Eliminando historial diario (daily_history)...\n");

    const historyRef = db.collection('daily_history');
    const snapshot = await historyRef.get();

    if (snapshot.empty) {
        console.log("📝 No hay historial para eliminar.");
        return 0;
    }

    let count = 0;
    const batch = db.batch();

    snapshot.forEach((doc) => {
        batch.delete(doc.ref);
        count++;
        console.log(`🗑️ Eliminando entrada: ${doc.id}`);
    });

    await batch.commit();
    console.log(`\n✅ ${count} entradas del historial eliminadas.`);

    return count;
}

async function main() {
    console.log("╔════════════════════════════════════════════════════════╗");
    console.log("║     RESET DE ÁLBUMES - AlbumDelDía                     ║");
    console.log("║     Limpieza de flags wasShown y daily_history         ║");
    console.log("╚════════════════════════════════════════════════════════╝\n");

    try {
        const albumsReset = await resetAlbumFlags();
        const historyDeleted = await clearDailyHistory();

        console.log("\n╔════════════════════════════════════════════════════════╗");
        console.log("║                    RESUMEN                              ║");
        console.log("╠════════════════════════════════════════════════════════╣");
        console.log(`║  Álbumes reseteados:        ${String(albumsReset).padStart(5)}                      ║`);
        console.log(`║  Historial eliminado:       ${String(historyDeleted).padStart(5)}                      ║`);
        console.log("╚════════════════════════════════════════════════════════╝");
        console.log("\n🎉 ¡Reset completado! Los álbumes pueden volver a salir.");

    } catch (error) {
        console.error("❌ Error durante el reset:", error);
        process.exit(1);
    }

    process.exit(0);
}

main();
