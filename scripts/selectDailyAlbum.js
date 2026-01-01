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
    // Helper para obtener fecha en Madrid dado un objeto Date
    const getMadridDateStr = (dateObj) => {
        return dateObj.toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' });
    };

    const now = new Date();
    const today = getMadridDateStr(now); // Hoy en Madrid

    // Calcular mañana (sumamos 24h aproximadamente, seguro para cambio de día)
    const tomorrowDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const tomorrow = getMadridDateStr(tomorrowDate);

    console.log(`\n📅 Iniciando proceso de selección.`);
    console.log(`   Hoy (Madrid): ${today}`);
    console.log(`   Mañana (Madrid): ${tomorrow}`);

    let targetDate = today;
    let dailyRef = db.collection('daily_history').doc(targetDate);
    let dailySnap = await dailyRef.get();

    // 1. Estrategia "Look Ahead": 
    // Si ya existe el álbum de hoy, intentamos generar el de mañana con antelación.
    // Esto permite ejecutar el script a las 22:00 o 23:00 para evitar retrasos de GitHub Actions a media noche.
    if (dailySnap.exists) {
        console.log(`✅ El álbum de hoy (${today}) ya está listo: ${dailySnap.data().title}`);
        console.log(`🔮 Verificando si necesitamos generar el de mañana (${tomorrow})...`);

        targetDate = tomorrow;
        dailyRef = db.collection('daily_history').doc(targetDate);
        dailySnap = await dailyRef.get();

        if (dailySnap.exists) {
            console.log(`✅ El álbum de mañana (${tomorrow}) TAMBIÉN está listo: ${dailySnap.data().title}`);
            console.log("😴 Nada que hacer por ahora.");
            return;
        } else {
            console.log(`🚀 Generando álbum para MAÑANA (${tomorrow}) con antelación.`);
        }
    } else {
        console.log(`⚠️ No existe álbum para HOY (${today}). Generándolo con prioridad.`);
    }

    // A partir de aquí, 'targetDate' es la fecha para la que vamos a generar (hoy o mañana)
    console.log(`🎲 Seleccionando álbum para: ${targetDate}`);

    try {
        console.log("🎲 Seleccionando un nuevo álbum...");

        // 2. Obtener candidatos (no mostrados previamente)
        const albumsRef = db.collection('albums');
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
        console.log(`💾 Guardado en daily_history/${targetDate}`);

        // 5. Marcar como mostrado en la colección principal
        if (selectedAlbum.spotifyId) {
            const albumDocRef = db.collection('albums').doc(selectedAlbum.spotifyId);
            await albumDocRef.update({
                wasShown: true,
                lastShownDate: targetDate
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
