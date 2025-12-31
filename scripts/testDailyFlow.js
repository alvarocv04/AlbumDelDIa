
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { execSync } from 'child_process';

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Inicializar (copiado de resetAlbums para consistencia)
const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || path.join(__dirname, '../serviceAccountKey.json');
const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}
const db = admin.firestore();

async function runTest() {
    const today = new Date().toISOString().split('T')[0];
    const dailyRef = db.collection('daily_history').doc(today);

    console.log("🧪 --- INICIANDO TEST DE FLUJO DIARIO ---");

    // 1. Borrar entrada actual para simular "00:00"
    console.log(`\n1. 🗑️  Simulando inicio del día (Borrando entrada de ${today})...`);
    await dailyRef.delete();
    console.log("   ✅ Entrada borrada.");

    // 2. Ejecutar el script principal
    console.log("\n2. 🚀 Ejecutando script de selección (como haría GitHub Actions)...");
    try {
        const output = execSync('node scripts/selectDailyAlbum.js', { encoding: 'utf-8' });
        console.log("   --- Output del script ---");
        console.log(output.trim());
        console.log("   -------------------------");
    } catch (e) {
        console.error("   ❌ Error ejecutando el script:", e.message);
        process.exit(1);
    }

    // 3. Verificar resultado
    console.log("\n3. 🔍 Verificando resultado en base de datos...");
    const snap = await dailyRef.get();
    if (snap.exists) {
        const data = snap.data();
        console.log(`   ✅ ¡Éxito! Se ha generado el álbum: "${data.title}"`);
    } else {
        console.error("   ❌ Fallo: No se encontró el documento después de ejecutar el script.");
    }

    // 4. Test de Idempotencia (Ejecutar otra vez)
    console.log("\n4. 🔁 Test de Idempotencia (Ejecutar segunda vez)...");
    try {
        const output2 = execSync('node scripts/selectDailyAlbum.js', { encoding: 'utf-8' });
        if (output2.includes("Ya existe un álbum seleccionado")) {
            console.log("   ✅ ¡Correcto! El script detectó que ya existía y no lo cambió.");
        } else {
            console.log("   ⚠️ Advertencia: El script no reportó que ya existía (revisar logs).");
        }
    } catch (e) {
        // Ignoramos error si es exit 0
    }

    console.log("\n🧪 --- TEST COMPLETADO ---");
    process.exit(0);
}

runTest();
