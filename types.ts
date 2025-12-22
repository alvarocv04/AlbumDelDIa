export interface Message {
  role: 'user' | 'model';
  text: string;
}

export interface ChatState {
  isOpen: boolean;
  messages: Message[];
  isLoading: boolean;
}

export interface Track {
  name: string;
  duration_ms: number;
  track_number: number;
  preview_url: string | null;
  id: string;
  explicit: boolean;
}

export interface Album {
  spotifyId: string;
  title: string;
  artist: string;
  coverUrl: string;
  releaseDate: string;
  spotifyUrl: string;
  appleMusicUrl?: string;
  totalTracks: number;
  popularity: number;
  genres: string[];
  tracks: Track[];
  duration_total_ms: number;
  label: string;
  wasShown?: boolean;
  lastShownDate?: string;
}

export interface Badge {
  id: string;
  name: string;
  name_en?: string;
  name_es?: string;
  description: string;
  description_en?: string;
  description_es?: string;
  icon: string;
  category: 'streak' | 'listening' | 'social' | 'milestone';
  threshold: number;
}

export interface UserBadge {
  badgeId: string;
  obtainedAt: string;
}

export interface UserStats {
  followers: number;
  following: number;
  streak: number;
  minutesListened: number;
  lastListenedDate?: string;
  albumsListenedToday?: number;
}

export interface DBUser {
  uid: string;
  email: string | null;
  photoURL: string | null;
  savedAlbums: string[];
  ratings: Record<string, { personal: number; artistic: number }>;
  history: string[];
  createdAt: any;
  stats: UserStats;
  badges: UserBadge[];
  username: string | null;
  acceptedTermsAt?: string;
}

export interface Comment {
  id: string;
  albumId: string;
  userId: string;
  username: string;
  userPhotoURL: string | null;
  content: string;
  createdAt: string; // ISO string
}

export interface UserActivity {
  id: string;
  type: 'rate' | 'save' | 'listen' | 'badge';
  targetId: string; // albumId or badgeId
  targetName: string; // title of album or badge
  targetImage?: string; // Optional image (coverUrl or badge icon)
  timestamp: string; // ISO
  metadata?: {
    rating?: number;
    artist?: string;
  };
}
