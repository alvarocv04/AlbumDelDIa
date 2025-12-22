# Actualización de Álbumes con Apple Music

## Resumen de Cambios

Se ha agregado soporte para enlaces de Apple Music en los álbumes. Los cambios incluyen:

1. **Tipo de Datos (`types.ts`)**: Se agregó el campo opcional `appleMusicUrl?: string` a la interfaz `Album`.

2. **Script de Seed (`scripts/seedAlbums.js`)**: 
   - Se agregó la función `searchAppleMusicAlbum()` que busca álbumes en Apple Music usando la API de iTunes.
   - El script ahora busca automáticamente el enlace de Apple Music para cada álbum y lo guarda en Firestore.

3. **Página de Álbum (`pages/AlbumPage.tsx`)**: 
   - Se agregó un botón de Apple Music junto al botón de Spotify.
   - El botón solo se muestra si el álbum tiene un enlace de Apple Music disponible.
   - El botón usa los colores oficiales de Apple Music (gradiente rojo).

## Cómo Actualizar los Álbumes Existentes

Para agregar enlaces de Apple Music a los álbumes que ya están en la base de datos:

### Opción 1: Actualizar Solo los Enlaces de Apple Music (Recomendado)

```bash
node scripts/updateAppleMusicLinks.js
```

Este script:
- Lee todos los álbumes existentes en Firestore
- Busca el enlace de Apple Music para cada álbum que no lo tenga
- Actualiza solo el campo `appleMusicUrl` sin modificar otros datos
- Muestra un resumen al final con estadísticas de actualización

**Ventajas:**
- Más rápido que re-procesar todo
- No modifica otros campos del álbum
- Salta álbumes que ya tienen enlace de Apple Music

### Opción 2: Re-ejecutar el Script de Seed

```bash
node scripts/seedAlbums.js
```

Este comando volverá a procesar todos los álbumes en `albums.txt` y actualizará los registros en Firestore con los enlaces de Apple Music y todos los demás datos.

**Nota:** Esta opción es útil si quieres actualizar todos los datos del álbum, no solo los enlaces de Apple Music.

### Opción 3: Actualizar Manualmente en Firestore

Si solo quieres actualizar algunos álbumes específicos:

1. Ve a la consola de Firebase: https://console.firebase.google.com
2. Navega a Firestore Database
3. Encuentra el álbum que quieres actualizar en la colección `albums`
4. Agrega el campo `appleMusicUrl` con el enlace de Apple Music

## Cómo Funciona la Búsqueda de Apple Music

El script usa la API pública de iTunes Search:
- Endpoint: `https://itunes.apple.com/search`
- Parámetros: `term`, `entity=album`, `limit=5`
- La búsqueda intenta encontrar la mejor coincidencia comparando el nombre del artista y del álbum
- Si no encuentra una coincidencia exacta, devuelve el primer resultado
- Si no encuentra ningún resultado, el campo `appleMusicUrl` se guarda como `null`

## Visualización en la Interfaz

En la página de álbum (`/album/:id`):
- Si el álbum tiene un enlace de Spotify, se muestra el botón verde de Spotify
- Si el álbum tiene un enlace de Apple Music, se muestra el botón rojo/rosa de Apple Music
- Los botones están lado a lado en la misma fila
- Ambos botones abren el álbum en una nueva pestaña

## Notas Técnicas

- La API de iTunes Search no requiere autenticación
- El script incluye un pequeño delay entre búsquedas para evitar rate limiting
- Los enlaces de Apple Music son opcionales - si no se encuentra, la aplicación funciona normalmente solo con Spotify
