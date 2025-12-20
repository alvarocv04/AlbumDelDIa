
export const LIBRARY_ALBUMS = [
    { id: 1, title: "Solar Echoes", artist: "The Starlight Collective", cover: "https://lh3.googleusercontent.com/aida-public/AB6AXuDkePu4aWds-i7zf-xGoXrZtbjeCr7xtY2gmnofYrVS9laeU2ZzeRoupAkZk3cu11LyDhYdNmFS26oj1-UfljHjPelu3Bk6rAKk9gG362X7mFCxky6ZUoxrh1As9E4cV6vnBU7LLAJNI2Ya1zaFCsvCJuD2NdsS1mRvbIhqPxAQsYwsyOtFOaMwOlA1XqblNvqhMJiOW3wvMJRRC-BeejjsrDGEd6LBuazCFxyj8nKQ4jl1bk79H6n7wd29Te4bvyCBLN5OwOw86lg", status: 'saved', genre: "Ambient" },
    { id: 2, title: "To Pimp a Butterfly", artist: "Kendrick Lamar", cover: "https://lh3.googleusercontent.com/aida-public/AB6AXuCrTsXNkAYmFaYkhLE91Mm4JWGB842mCQWV_Jt6hckx5bq_s6HD7MvL0Dh9Ki7MeoVQPq0Dl8uiJmsJmTEUxJb5gTc8MbGYxhk0kzXpvKvNKEZvZamVk9EqIFrtZclviO67G3E9zPkze62LffiFwzAaGptiSA92SqlOFJ9V5vtatTcl3Cu3A5uxP2rH2PLPCRBpbQDgxuyP4qQxZDhRVX-bZ13Ifj9dF69brXwaZXWoG2zTtc2PSawRPqWQCaauglhNoIWQ32_Kvwc", status: 'listened', genre: "Hip Hop" },
    { id: 3, title: "Neon Horizons", artist: "Solar Fields", cover: "https://lh3.googleusercontent.com/aida-public/AB6AXuDYPm0tlOojMHaUj8qdyk1U6EPajPSlOEOmiz9816fb1nGSEEHSBdqVfdUp7904BKMQsWsHvIsc1cBzeZJXViOQpBhLQTPNKj3cXwTzOpRyf0aujR4p05fE4WyvZcKWROKK-Wc9dS0FdpOdHq94XgAmXyz0Mjaas6YZKRUzRysGE0vW6mHRDzAPmHswcASDaoq9EDZd_KoGVBDkaCnH_-DXIGxvEcRiY0bIXvbD5JtNJ8Du_e6pNPRXHsUlbrJsvxTzUldqshMMtQs", status: 'saved', genre: "Electronic" },
    { id: 4, title: "Kind of Blue", artist: "Miles Davis", cover: "https://lh3.googleusercontent.com/aida-public/AB6AXuC6QbkRXThCwo3fq6RHAUU8DYnry4N3nyIXZOuBThH7lHxhNG_qM1kPuW0JKgF5z9uPoxkPsAo3uG2KYl0aQIk70yfYqrfpljROPkj8GCTpNsknrtrEiVqqA2N782c5_6DjYruQOMbolIPc1srWe1qBrc1dNx5BTerm3rATi3ucNNQ4NovaNQyBKTQtHPSLLi7-NKJ-3rPQ39hFdP7nFCJaCIEbbkFfbPf5JXIlr8dxLEWYr5UGKNfrIvmr89Fp8gzl_DHpRxaEb7I", status: 'listened', genre: "Jazz" },
    { id: 5, title: "Currents", artist: "Tame Impala", cover: "https://lh3.googleusercontent.com/aida-public/AB6AXuAPpFKPb2vwHvDH-h3ziE_VsEabb5mnFN_Fia2E-EgWW8Gpkqscq_sSyrwBqgGmy7Kww5lmFaGBjnCJiIShYBwU6cwXU5Tmi4T3O9s1bKVT6Q9qSZVpTJNWRFW1NdotFD10usbDrvzNjyKmMowfHPR9Vmll7OjdwsmrsY37vPuQeIEQZfArk7kD-OvwkRAhAscol_nq2ZSXTUppOYk5rGGq4t7QQwjd946vHZEISACtXVxT7K1c-auuv4KwdsTqrldani5RjuhZRoA", status: 'listened', genre: "Psych Rock" },
    { id: 6, title: "Black Radio", artist: "Robert Glasper", cover: "https://lh3.googleusercontent.com/aida-public/AB6AXuCt0rU6Zgf7Uzao3mumZIxQJ199Ygn9-5RNKcoJ-m1HeX1SPMal5_ly6GW4Sam-oM8IfcFE7Amx4BySTxfggGowJWugT9arEYM9KfZuFKf_pjJR34KlHUq-utTkQwtpO2Rt8EGq-Cojg_gU4prJYw2NVw0jio5h4liEPlZ9A9utCIS0OnhvjFUPJiuvj-YY1_LusWPvk2b4ttq830WowyRRhGwp-GN0rCRBe77w76hPce4gQhaBHcYYH0o6mJcU_tAf1p-D4sAAG60", status: 'saved', genre: "Jazz/R&B" },
];

export interface Badge {
    id: string;
    icon: string;
    earned: boolean;
}

export interface User {
    id: string;
    name: string;
    handle: string;
    bio: string;
    avatar: string;
    isOnline: boolean;
    isVerified: boolean;
    stats: {
        followers: string;
        following: string;
    };
    badges: Badge[];
}

const ALL_BADGES_TEMPLATE: Badge[] = [
    { id: 'early_adopter', icon: 'rocket_launch', earned: false },
    { id: 'vinyl_head', icon: 'album', earned: false },
    { id: 'critic_lvl5', icon: 'rate_review', earned: false },
    { id: 'deep_diver', icon: 'headphones', earned: false },
    { id: 'genre_hopper', icon: 'queue_music', earned: false },
    { id: 'socialite', icon: 'group', earned: false },
    { id: 'streaker', icon: 'local_fire_department', earned: false },
    { id: 'curator', icon: 'library_music', earned: false },
    { id: 'influencer', icon: 'campaign', earned: false },
    { id: 'night_owl', icon: 'dark_mode', earned: false },
];

const getBadges = (earnedIds: string[]) => {
    return ALL_BADGES_TEMPLATE.map(b => ({
        ...b,
        earned: earnedIds.includes(b.id)
    }));
};

export const MOCK_USERS: User[] = [
    {
        id: 'me',
        name: 'Alex The Audiophile',
        handle: '@alexlistens',
        bio: 'Exploring the depths of jazz and ambient soundscapes. Vinyl collector and conscious listener.',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHArSSTfJSIcGf7QdNbMJihyEyltpS_FUOTMc8e2qFiY7ZLGiR4P4-QtZ8H1o7R0EJ7gWw1l4ID9IYd2ngubAzKxrXMq59p9Odk5XVaMwbUpMVlGJK3wrK0yLTLAoLTM4dh_JxsilE3bOSmSQjCexJEtKkzQFAjIfRpLpoFGy2Y1-EGF0KDyjteyDFaV3ZE-EOeHBxdeXnb9hFLRr7MoK996Rd6ro-rY-uInOtk_66Gpr-Xp6kpx_CIG47Y_yjby7A4qGG9FdY0m8',
        isOnline: true,
        isVerified: true,
        stats: { followers: '1.2k', following: '850' },
        badges: getBadges(['early_adopter', 'vinyl_head', 'critic_lvl5', 'deep_diver'])
    },
    {
        id: 'sarah',
        name: 'Sarah Chen',
        handle: '@sarah_sounds',
        bio: 'Electronic beats and synthwave dreams. Producer at night.',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC96WYoBEd3VInZ_1CiLMn3-bKdrs009tQhDzpQESanljMQKJSkmZ-COLRii0gdI0LDVliBFZTfIaX35oAENLvWyiOwGFZ3nSdrgokGDvhsMmKO8Ogd29K33hxmQBkaVznRUbfNUUA7CTq_sB9zCvquQ7gx54uOhIz-DTXM8kb7yJNOmebmWG08KfOKSUXYSKdAPAi3DPp9G7tiVaGncLCt4owauaYV8EsNDcWKOYOjMGY_LIisLaU6Xlbmff6W1yC_xmQCtpv19zM',
        isOnline: false,
        isVerified: false,
        stats: { followers: '342', following: '1.5k' },
        badges: getBadges(['genre_hopper', 'night_owl'])
    },
    {
        id: 'davide',
        name: 'Davide B.',
        handle: '@davide_bass',
        bio: 'Funk, Soul, and everything with a groove.',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDcY0kOIPQOl2xQHdqkE5hlE5TY1oRmZROno_XsRkfizympOERm62nAurY1SzCGgmY0vsrQgp6WOEHXoou8dwylM965Zjng8wHqprRpEwRLW_bHTwwIDUcts-bQsvi_qzp5Hw6DDyGIQn8xvLy4xn4n6GZ2EZovYB0RlQKiwDQeoNNA1ca6X6mT-uN5AFFFvT-1pfuNLeNT6KuSFrmAxZoUNy2CCRLqjZjZuYz71iNq5KSQmA1qelzWsqS9TRI8okt3uYg43gRkg1I',
        isOnline: true,
        isVerified: true,
        stats: { followers: '8.9k', following: '120' },
        badges: getBadges(['influencer', 'curator', 'streaker', 'vinyl_head'])
    },
    {
        id: 'marcus',
        name: 'Marcus J.',
        handle: '@marcus_jams',
        bio: 'Just here for the vibes. Hip Hop head.',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDhOFrmM9nFsX9L7uEJPkOX-zmyB2cfkGWm0e3rG70NpgY4NpznC9JyZPzV-G9dAZeKE_k9VApaaHcu9kndqHhKWuh50zm4PB_bQGZhVtbIKN_ZlRJd4GcZtIQr5nnD-Hek_fE9At3AeZM3S7omTX2E93-37yUVDpV52eRAw1xzA7KUnv2aB1FpPa23bFzhhP1nfb8UZOjRlhLn6TwWC8kdUi4n_Vj6N_0VoCFqJNdB5SLhcpcZXsMAMEWqFyF3eNG-_qg8nLgXQ80',
        isOnline: false,
        isVerified: false,
        stats: { followers: '156', following: '400' },
        badges: getBadges(['early_adopter'])
    },
    {
        id: 'elena',
        name: 'Elena R.',
        handle: '@elena_rock',
        bio: 'Indie rock and alternative. Live music photography.',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD7Exwx_9u02YZubiZt4ohBx8FJFUeNOcVibGUvOMbE0h071cMTh0EOvEN1CEnPagb8T4bmThTsrZtCcYCeQ-pG2TAq7w2IPZym9tfAdwKRP-PG2l1iYYcrPCmCzqP-jghzG9akkMlbl6u56NSXz4GqMEJ_2aNxQNZkOw-ENuV-kRyLokkYxlNLrRMNH-IULIr7s1soVFDt-oqalAnywihNJkS0NffuZ88ycuka29zk75hLPIMVRkTogNP6ugn5L8yIgw0NODqvRAc',
        isOnline: true,
        isVerified: false,
        stats: { followers: '2.1k', following: '900' },
        badges: getBadges(['socialite', 'curator'])
    }
];
