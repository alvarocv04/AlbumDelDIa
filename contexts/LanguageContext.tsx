import React, { createContext, useState, useContext, ReactNode } from 'react';

type Language = 'en' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    'nav.home': 'Home',
    'nav.recommendations': 'Recommendations',
    'nav.library': 'Library',
    'nav.profile': 'Profile',
    'nav.wrapped': 'Stats',
    'nav.friends': 'Friends',
    'search.placeholder': 'Search albums...',
    
    'home.album_of_day': 'Album of the Day',
    'home.start_listening': 'Start Listening',
    'home.save_later': 'Save for Later',
    'home.vibing': 'are vibing to this.',
    'home.your_vibe': 'Your Vibe',
    'home.view_history': 'View History',
    'home.streak': 'Current Streak',
    'home.total_minutes': 'Total Minutes',
    'home.badges_earned': 'Badges Earned',
    'home.listening_activity': 'Listening Activity',
    'home.recent_badges': 'Recent Badges',
    'home.recommended': 'Recommended for You',
    'home.explore_more': 'Explore More',
    'home.days': 'Days',
    
    'library.title': 'Your Library',
    'library.filter.all': 'All',
    'library.filter.listened': 'Listened',
    'library.filter.saved': 'Saved',
    'library.search_placeholder': 'Search by album or artist...',
    'library.no_albums': 'No albums found',
    'library.try_adjusting': 'Try adjusting your filters or search query.',

    'friends.title': 'Find Friends',
    'friends.search_placeholder': 'Search by name or handle...',
    'friends.suggested': 'Suggested for You',
    'friends.no_users': 'No users found',
    'friends.following_status': 'Following',
    
    'rec.mixing_console': 'Mixing Console',
    'rec.fine_tune': 'Fine-tune your algorithm.',
    'rec.global_sounds': 'Global Sounds',
    'rec.deep_cuts': 'Deep Cuts',
    'rec.refresh_feed': 'Refresh Feed',
    'rec.tune_discovery': 'Tune Your Discovery',
    'rec.exploring': 'Exploring',
    'rec.top_pick': 'Top Pick for You',
    'rec.play_now': 'Play Now',
    'rec.expanding_horizons': 'Expanding Your Horizons',
    'rec.discover_sounds': 'Discover sounds outside your usual circle.',
    'rec.match': 'Match',
    'rec.and': 'and',

    'profile.verified': 'Verified User',
    'profile.followers': 'Followers',
    'profile.following': 'Following',
    'profile.follow': 'Follow',
    'profile.edit': 'Edit Profile',
    'profile.badges_achievements': 'Badges & Achievements',
    'profile.activity_feed': 'Activity Feed',
    'profile.listened_to': 'listened to',
    'profile.earned': 'Earned',
    'profile.badge': 'Badge',
    'profile.ago': 'ago',
    'profile.see_all': 'See All',
    'profile.earned_badges': 'Collection',
    'profile.locked_badges': 'Available to Unlock',
    'profile.close': 'Close',
    
    'badge.early_adopter': 'Early Adopter',
    'badge.desc.early_adopter': 'Joined during the beta phase.',
    'badge.vinyl_head': 'Vinyl Head',
    'badge.desc.vinyl_head': 'Listened to 5 complete albums.',
    'badge.critic_lvl5': 'Critic Lvl 5',
    'badge.desc.critic_lvl5': 'Wrote 5 detailed reviews.',
    'badge.deep_diver': 'Deep Diver',
    'badge.desc.deep_diver': 'Listened to 1 hour of ambient music.',
    'badge.genre_hopper': 'Genre Hopper',
    'badge.desc.genre_hopper': 'Listen to 10 different genres.',
    'badge.socialite': 'Socialite',
    'badge.desc.socialite': 'Reach 100 followers.',
    'badge.streaker': 'Streaker',
    'badge.desc.streaker': 'Achieve a 30-day listening streak.',
    'badge.curator': 'Curator',
    'badge.desc.curator': 'Create 5 public playlists.',
    'badge.influencer': 'Influencer',
    'badge.desc.influencer': 'Get 50 likes on a review.',
    'badge.night_owl': 'Night Owl',
    'badge.desc.night_owl': 'Listen between 2AM and 5AM.',

    'summary.wrapped': '2023 Wrapped',
    'summary.journey': 'Your Journey in Sound',
    'summary.subtitle': '34,200 minutes of deep listening. You explored further than ever before.',
    'summary.at_glance': 'At a Glance',
    'summary.new_albums': 'New Albums',
    'summary.top_genre': 'Top Genre',
    'summary.consistent': 'Consistent',

    'chat.initial': "Hey! I'm Al, your music guide. Ask me about the daily album or any music questions!",
    'chat.placeholder': 'Ask about music...',
    'chat.bot_name': 'Al the Music Bot',
    'chat.online': 'Online',
    'chat.send': 'Send',

    'album.listen_spotify': 'Listen on Spotify',
    'album.share': 'Share',
    'album.save': 'Save',
    'album.rate_album': 'Rate this album',
    'album.personal_taste': 'Personal Taste',
    'album.vibe_check': 'How much do you vibe with it?',
    'album.artistic_quality': 'Artistic Quality',
    'album.objective_craft': 'Objective craft and impact.',
    'album.the_debate': 'The Debate',
    'album.comments': 'Comments',
    'album.write_review': 'Write a Review',
    'album.view_all_comments': 'View all comments',
    'album.reply': 'Reply'
  },
  es: {
    'nav.home': 'Inicio',
    'nav.recommendations': 'Recomendaciones',
    'nav.library': 'Biblioteca',
    'nav.profile': 'Perfil',
    'nav.wrapped': 'Estadísticas',
    'nav.friends': 'Amigos',
    'search.placeholder': 'Buscar álbumes...',
    
    'home.album_of_day': 'El Álbum del Día',
    'home.start_listening': 'Escuchar Ahora',
    'home.save_later': 'Guardar',
    'home.vibing': 'están escuchando esto.',
    'home.your_vibe': 'Tu Vibe',
    'home.view_history': 'Ver Historial',
    'home.streak': 'Racha Actual',
    'home.total_minutes': 'Minutos Totales',
    'home.badges_earned': 'Insignias',
    'home.listening_activity': 'Actividad de Escucha',
    'home.recent_badges': 'Insignias Recientes',
    'home.recommended': 'Recomendado para ti',
    'home.explore_more': 'Explorar Más',
    'home.days': 'Días',
    
    'library.title': 'Tu Biblioteca',
    'library.filter.all': 'Todos',
    'library.filter.listened': 'Escuchados',
    'library.filter.saved': 'Guardados',
    'library.search_placeholder': 'Buscar por álbum o artista...',
    'library.no_albums': 'No se encontraron álbumes',
    'library.try_adjusting': 'Intenta ajustar tus filtros o búsqueda.',

    'friends.title': 'Buscar Amigos',
    'friends.search_placeholder': 'Buscar por nombre o usuario...',
    'friends.suggested': 'Sugerencias',
    'friends.no_users': 'No se encontraron usuarios',
    'friends.following_status': 'Siguiendo',

    'rec.mixing_console': 'Consola de Mezcla',
    'rec.fine_tune': 'Ajusta tu algoritmo.',
    'rec.global_sounds': 'Sonidos Globales',
    'rec.deep_cuts': 'Joyas Ocultas',
    'rec.refresh_feed': 'Actualizar Feed',
    'rec.tune_discovery': 'Sintoniza tu Descubrimiento',
    'rec.exploring': 'Explorando',
    'rec.top_pick': 'Mejor Selección para Ti',
    'rec.play_now': 'Reproducir',
    'rec.expanding_horizons': 'Expandiendo Horizontes',
    'rec.discover_sounds': 'Descubre sonidos fuera de tu círculo habitual.',
    'rec.match': 'Coincidencia',
    'rec.and': 'y',

    'profile.verified': 'Usuario Verificado',
    'profile.followers': 'Seguidores',
    'profile.following': 'Siguiendo',
    'profile.follow': 'Seguir',
    'profile.edit': 'Editar Perfil',
    'profile.badges_achievements': 'Insignias y Logros',
    'profile.activity_feed': 'Actividad Reciente',
    'profile.listened_to': 'escuchó a',
    'profile.earned': 'Ganó',
    'profile.badge': 'Insignia',
    'profile.ago': 'hace',
    'profile.see_all': 'Ver Todo',
    'profile.earned_badges': 'Colección',
    'profile.locked_badges': 'Disponibles',
    'profile.close': 'Cerrar',

    'badge.early_adopter': 'Early Adopter',
    'badge.desc.early_adopter': 'Te uniste durante la fase beta.',
    'badge.vinyl_head': 'Cabeza de Vinilo',
    'badge.desc.vinyl_head': 'Escuchaste 5 álbumes completos.',
    'badge.critic_lvl5': 'Crítico Nvl 5',
    'badge.desc.critic_lvl5': 'Escribiste 5 reseñas detalladas.',
    'badge.deep_diver': 'Buzo Profundo',
    'badge.desc.deep_diver': 'Escuchaste 1 hora de música ambient.',
    'badge.genre_hopper': 'Saltador de Géneros',
    'badge.desc.genre_hopper': 'Escucha 10 géneros diferentes.',
    'badge.socialite': 'Socialite',
    'badge.desc.socialite': 'Alcanza 100 seguidores.',
    'badge.streaker': 'En Racha',
    'badge.desc.streaker': 'Consigue una racha de 30 días.',
    'badge.curator': 'Curador',
    'badge.desc.curator': 'Crea 5 playlists públicas.',
    'badge.influencer': 'Influencer',
    'badge.desc.influencer': 'Consigue 50 likes en una reseña.',
    'badge.night_owl': 'Búho Nocturno',
    'badge.desc.night_owl': 'Escucha música entre las 2AM y 5AM.',

    'summary.wrapped': 'Resumen 2023',
    'summary.journey': 'Tu Viaje Sonoro',
    'summary.subtitle': '34,200 minutos de escucha profunda. Exploraste más lejos que nunca.',
    'summary.at_glance': 'De un Vistazo',
    'summary.new_albums': 'Nuevos Álbumes',
    'summary.top_genre': 'Género Top',
    'summary.consistent': 'Consistente',

    'chat.initial': "¡Hola! Soy Al, tu guía musical. ¡Pregúntame sobre el álbum del día o cualquier duda musical!",
    'chat.placeholder': 'Pregunta sobre música...',
    'chat.bot_name': 'Al, el Bot Musical',
    'chat.online': 'En línea',
    'chat.send': 'Enviar',

    'album.listen_spotify': 'Escuchar en Spotify',
    'album.share': 'Compartir',
    'album.save': 'Guardar',
    'album.rate_album': 'Califica este álbum',
    'album.personal_taste': 'Gusto Personal',
    'album.vibe_check': '¿Cuánto vibras con él?',
    'album.artistic_quality': 'Calidad Artística',
    'album.objective_craft': 'Impacto y técnica objetiva.',
    'album.the_debate': 'El Debate',
    'album.comments': 'Comentarios',
    'album.write_review': 'Escribir Reseña',
    'album.view_all_comments': 'Ver todos los comentarios',
    'album.reply': 'Responder'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children?: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string) => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};