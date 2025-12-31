import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Cargar variables de entorno locales si existen
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Inicializar Firebase
function initializeFirebase() {
    try {
        let serviceAccount;

        // 1. Intentar cargar desde variable de entorno (CI/CD - GitHub Actions)
        if (process.env.FIREBASE_SERVICE_ACCOUNT) {
            console.log("🔑 Cargando credenciales desde variable de entorno FIREBASE_SERVICE_ACCOUNT...");
            serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        }
        // 2. Intentar cargar desde archivo local (Desarrollo)
        else {
            const keyPath = path.join(__dirname, '../serviceAccountKey.json');
            if (fs.existsSync(keyPath)) {
                console.log(`🔑 Cargando credenciales desde archivo local: ${keyPath}`);
                const keyContent = fs.readFileSync(keyPath, 'utf8');
                serviceAccount = JSON.parse(keyContent);
            } else {
                throw new Error('No se encontraron credenciales (FIREBASE_SERVICE_ACCOUNT o serviceAccountKey.json)');
            }
        }

        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
        }
        console.log("✅ Firebase inicializado correctamente.");
        return admin.firestore();
    } catch (error) {
        console.error("❌ Error inicializando Firebase:", error.message);
        process.exit(1);
    }
}

const db = initializeFirebase();

async function selectDailyAlbum() {
    const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' }); // YYYY-MM-DD in Spain
    const dailyRef = db.collection('daily_history').doc(today);

    try {
        console.log(`\n📅 Iniciando selección para el día: ${today}`);

        // 1. Verificar si ya existe álbum para hoy
        const dailySnap = await dailyRef.get();
        if (dailySnap.exists) {
            console.log(`⚠️ Ya existe un álbum seleccionado para hoy (${today}): ${dailySnap.data().title}`);
            return;
        }

        console.log("🎲 Seleccionando un nuevo álbum...");

        // 2. Obtener candidatos (no mostrados previamente)
        const albumsRef = db.collection('albums');
        // Para conjuntos de datos grandes, esto debería ser más eficiente (ej. con cursor),
        // pero para < 1000 álbumes, leerlos y filtrar en memoria o consulta simple está bien.
        // Usamos 'wasShown' == false o no existe.

        // NOTA: Firestore no soporta bien queries con '!=' o 'false' si el campo no existe.
        // Es mejor traer todos y filtrar en código para este volumen, o asegurarse que todos tienen wasShown: false al inicio.
        // Asumiremos que el volumen es manejable (< pochi miles).
        const snapshot = await albumsRef.get();

        if (snapshot.empty) {
            console.error("❌ No hay álbumes en la base de datos.");
            return;
        }

        const allAlbums = [];
        const candidates = [];

        snapshot.forEach(doc => {
            const data = doc.data();
            const albumWithId = { ...data, spotifyId: doc.id }; // Asegurar ID
            allAlbums.push(albumWithId);

            if (!data.wasShown) {
                candidates.push(albumWithId);
            }
        });

        console.log(`📊 Total álbumes: ${allAlbums.length}`);
        console.log(`🎯 Candidatos disponibles (no mostrados): ${candidates.length}`);

        // Fallback: Si todos se han mostrado, usar todo el pool (reset implícito o repetición)
        const pool = candidates.length > 0 ? candidates : allAlbums;

        if (pool.length === 0) {
            console.error("❌ No hay álbumes disponibles para seleccionar.");
            return;
        }

        // 3. Seleccionar aleatorio
        const randomIndex = Math.floor(Math.random() * pool.length);
        const selectedAlbum = pool[randomIndex];

        console.log(`✨ Elegido: "${selectedAlbum.title}" de ${selectedAlbum.artist}`);

        // 4. Guardar en daily_history
        // Guardamos una copia completa para evitar lecturas extra y tener histórico inmutable
        await dailyRef.set({
            ...selectedAlbum,
            selectedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`💾 Guardado en daily_history/${today}`);

        // 5. Marcar como mostrado en la colección principal
        if (selectedAlbum.spotifyId) {
            const albumDocRef = db.collection('albums').doc(selectedAlbum.spotifyId);
            await albumDocRef.update({
                wasShown: true,
                lastShownDate: today
            });
            console.log(`✅ Actualizado flag wasShown en albums/${selectedAlbum.spotifyId}`);
        } else {
            console.warn("⚠️ El álbum seleccionado no tenía spotifyId, no se pudo actualizar el flag original.");
        }

        console.log("\n🎉 ¡Selección diaria completada con éxito!");

    } catch (error) {
        console.error("❌ Error crítico seleccionando álbum diario:", error);
        process.exit(1);
    }
}

// Ejecutar
selectDailyAlbum()
    .then(() => process.exit(0))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
