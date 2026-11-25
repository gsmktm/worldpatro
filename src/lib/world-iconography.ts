/**
 * Original WorldPatro icon research inventory · 2026-11-25.
 * Nakshatra motifs are editorial illustrations inspired by varying associations,
 * NOT canonical religious depictions, asterism star maps or calculated positions.
 * Rahu/Ketu depict lunar nodes, not physical planets.
 * No icon library/image/font dependency and no proprietary artwork copied.
 */
export type VectorIcon = {
  id:string; name:string; ne:string; motif:string; path:string;
};
export type IconGroup = {
  id:"graha"|"nakshatra"|"calendar"|"panchang"|"tools";
  title:string; ne:string; entries:readonly VectorIcon[];
};
export const WORLD_ICON_GROUPS:readonly IconGroup[] = [
  {
    "id": "graha",
    "title": "GRAHA · NAVAGRAHA",
    "ne": "नवग्रह",
    "entries": [
      {
        "id": "surya",
        "name": "Surya",
        "ne": "सूर्य",
        "motif": "Solar radiance",
        "path": "M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2m0-14-2 2M7 17l-2 2M12 7a5 5 0 1 0 0 10a5 5 0 1 0 0-10"
      },
      {
        "id": "chandra",
        "name": "Chandra",
        "ne": "चन्द्र",
        "motif": "Lunar crescent",
        "path": "M20 15a8 8 0 0 1-11-11A9 9 0 1 0 20 15ZM4 4l.3 1 .9.4-.9.3-.3.9-.4-.9-.9-.3.9-.4Z"
      },
      {
        "id": "mangala",
        "name": "Mangala",
        "ne": "मङ्गल",
        "motif": "Shield and spear",
        "path": "M12 3l7 4v6c0 4-3 7-7 9-4-2-7-5-7-9V7ZM8 16l8-8M12 8h4v4"
      },
      {
        "id": "budha",
        "name": "Budha",
        "ne": "बुध",
        "motif": "Mercury scroll",
        "path": "M5 5h14M7 5v12c0 3 3 4 5 4s5-1 5-4V5M9 11h6m-6 4h6"
      },
      {
        "id": "guru",
        "name": "Brihaspati",
        "ne": "बृहस्पति",
        "motif": "Circle of learning",
        "path": "M4 7c2-3 5-4 8-4s6 1 8 4M4 17c2 3 5 4 8 4s6-1 8-4M4 7l3 3m-3-3-1 4M20 17l-3-3m3 3 1-4M9 10l3-2 3 2v7l-3-2-3 2Z"
      },
      {
        "id": "shukra",
        "name": "Shukra",
        "ne": "शुक्र",
        "motif": "Flower and radiance",
        "path": "M12 4c3 0 4 3 2 5 3-2 6-1 6 2s-3 4-5 3c1 3-1 6-4 6s-4-3-3-5c-3 1-6-1-6-4s3-4 6-2c-2-2-1-5 2-5ZM12 10a2 2 0 1 0 0 4 2 2 0 1 0 0-4"
      },
      {
        "id": "shani",
        "name": "Shani",
        "ne": "शनि",
        "motif": "Ringed body",
        "path": "M12 7a5 5 0 1 0 0 10 5 5 0 1 0 0-10M3 10C1 5 9 4 18 8s10 9 3 10c-6 1-16-2-19-7"
      },
      {
        "id": "rahu",
        "name": "Rahu",
        "ne": "राहु",
        "motif": "Ascending lunar node",
        "path": "M3 12a9 9 0 0 1 18 0M7 15l5-5 5 5M12 10v10M4 20h16"
      },
      {
        "id": "ketu",
        "name": "Ketu",
        "ne": "केतु",
        "motif": "Descending lunar node",
        "path": "M3 12a9 9 0 0 0 18 0M7 9l5 5 5-5M12 4v10M4 4h16"
      }
    ]
  },
  {
    "id": "nakshatra",
    "title": "NAKSHATRA · 27",
    "ne": "२७ नक्षत्र",
    "entries": [
      {
        "id": "ashwini",
        "name": "Ashwini",
        "ne": "अश्विनी",
        "motif": "Horse head",
        "path": "M5 19l2-10 5-5 4 2 3 5-4 2 1 5-4 3-7-2ZM13 10h1"
      },
      {
        "id": "bharani",
        "name": "Bharani",
        "ne": "भरणी",
        "motif": "Sacred vessel",
        "path": "M7 4h10M8 4l-2 5v8q0 4 6 4t6-4V9l-2-5M8 11h8"
      },
      {
        "id": "krittika",
        "name": "Krittika",
        "ne": "कृत्तिका",
        "motif": "Flame",
        "path": "M12 2c1 5 5 6 5 12 0 4-2 7-5 8-4-1-6-4-5-8 .3-3 3-5 5-8z"
      },
      {
        "id": "rohini",
        "name": "Rohini",
        "ne": "रोहिणी",
        "motif": "Wheeled cart",
        "path": "M3 7h18l-2 9H5ZM8 18a2 2 0 1 0 0 4 2 2 0 1 0 0-4M17 18a2 2 0 1 0 0 4 2 2 0 1 0 0-4"
      },
      {
        "id": "mrigashira",
        "name": "Mrigashira",
        "ne": "मृगशिरा",
        "motif": "Deer horns",
        "path": "M7 4l3 5 2-2 2 2 3-5M7 4L4 3M17 4l3-1M10 9l-2 5 4 6 4-6-2-5"
      },
      {
        "id": "ardra",
        "name": "Ardra",
        "ne": "आर्द्रा",
        "motif": "Rain drop",
        "path": "M12 2C9 7 5 11 5 15a7 7 0 0 0 14 0c0-4-4-8-7-13ZM8 16c0 2 1 3 3 3"
      },
      {
        "id": "punarvasu",
        "name": "Punarvasu",
        "ne": "पुनर्वसु",
        "motif": "Returning arrow",
        "path": "M4 5c14 0 14 14 0 14M4 5l4 7-4 7M8 12h12"
      },
      {
        "id": "pushya",
        "name": "Pushya",
        "ne": "पुष्य",
        "motif": "Lotus bud",
        "path": "M12 20c-6-2-8-7-4-10l4 4 4-4c4 3 2 8-4 10ZM12 14V4M8 11l-4-4M16 11l4-4"
      },
      {
        "id": "ashlesha",
        "name": "Ashlesha",
        "ne": "आश्लेषा",
        "motif": "Serpent coil",
        "path": "M5 20c-3-5 0-8 4-8 6 0 6 7 0 7-5 0-5-7 0-10 5-3 9 0 8 4M18 5h.1"
      },
      {
        "id": "magha",
        "name": "Magha",
        "ne": "मघा",
        "motif": "Ancestral seat",
        "path": "M5 10h14v8H5ZM7 10V6h10v4M3 18h18M8 18v3m8-3v3"
      },
      {
        "id": "purva-phalguni",
        "name": "Purva Phalguni",
        "ne": "पूर्व फाल्गुनी",
        "motif": "Resting cot",
        "path": "M3 9h18v7H3ZM6 6v3m12-3v3M6 16v5m12-5v5"
      },
      {
        "id": "uttara-phalguni",
        "name": "Uttara Phalguni",
        "ne": "उत्तर फाल्गुनी",
        "motif": "Rising cot",
        "path": "M4 8h16v7H4ZM4 8l5-4m11 4-5-4M7 15l-2 6m12-6 2 6"
      },
      {
        "id": "hasta",
        "name": "Hasta",
        "ne": "हस्त",
        "motif": "Open hand",
        "path": "M5 19V10c0-2 3-2 3 0V5c0-2 3-2 3 0v4-5c0-2 3-2 3 0v5-3c0-2 3-2 3 0v9c0 4-3 6-7 6H9Z"
      },
      {
        "id": "chitra",
        "name": "Chitra",
        "ne": "चित्रा",
        "motif": "Faceted jewel",
        "path": "M12 2 21 10l-9 12-9-12ZM3 10h18M8 3l4 7 4-7M12 10v12"
      },
      {
        "id": "swati",
        "name": "Swati",
        "ne": "स्वाति",
        "motif": "Wind-blown sprout",
        "path": "M7 21v-8c0-4 3-6 7-7M7 16c-4 0-5-3-5-6 4 0 6 2 5 6ZM7 13c4 0 7 1 10-4-6-1-9 1-10 4ZM14 4c2-1 5-1 7 0"
      },
      {
        "id": "vishakha",
        "name": "Vishakha",
        "ne": "विशाखा",
        "motif": "Two-branch arch",
        "path": "M3 21V9l9-6 9 6v12M7 21V11l5-4 5 4v10M7 15h10"
      },
      {
        "id": "anuradha",
        "name": "Anuradha",
        "ne": "अनुराधा",
        "motif": "Blossoming lotus",
        "path": "M12 21c-5-3-9-7-6-12l6 5 6-5c3 5-1 9-6 12ZM12 14V3M6 10 3 7M18 10l3-3"
      },
      {
        "id": "jyeshtha",
        "name": "Jyeshtha",
        "ne": "ज्येष्ठा",
        "motif": "Royal umbrella",
        "path": "M12 3c-6 0-9 5-9 9h18c0-4-3-9-9-9ZM12 12v6a3 3 0 0 0 6 0M12 3V1"
      },
      {
        "id": "mula",
        "name": "Mula",
        "ne": "मूल",
        "motif": "Tangled roots",
        "path": "M12 3v10M12 13l-7 7M12 13l7 7M12 16l-3 5M12 16l3 5M8 8l4-5 4 5"
      },
      {
        "id": "purva-ashadha",
        "name": "Purva Ashadha",
        "ne": "पूर्वाषाढा",
        "motif": "Victory fan",
        "path": "M5 21V9C8 4 14 3 19 6v10c-6-3-10-3-14-7M5 14c5-2 10-1 14 2"
      },
      {
        "id": "uttara-ashadha",
        "name": "Uttara Ashadha",
        "ne": "उत्तराषाढा",
        "motif": "Horn of strength",
        "path": "M4 4c2 8 6 11 12 10s4-5 3-9M9 17l3 4 3-4M4 4l4 1M19 5l-4 1"
      },
      {
        "id": "shravana",
        "name": "Shravana",
        "ne": "श्रवण",
        "motif": "Listening ear",
        "path": "M7 16c-3-4-2-12 5-12s9 7 5 12c-2 2-4 1-4 4a3 3 0 0 1-6 0M11 9c3-2 5 0 4 3"
      },
      {
        "id": "dhanishtha",
        "name": "Dhanishtha",
        "ne": "धनिष्ठा",
        "motif": "Double-headed drum",
        "path": "M3 7c6 2 12 2 18 0v10c-6-2-12-2-18 0ZM7 7v10m10-10v10M3 12h18"
      },
      {
        "id": "shatabhisha",
        "name": "Shatabhisha",
        "ne": "शतभिषा",
        "motif": "Circle of stars",
        "path": "M12 2a10 10 0 1 0 0 20 10 10 0 1 0 0-20ZM12 6v12M6 12h12M8 8l8 8M16 8l-8 8"
      },
      {
        "id": "purva-bhadrapada",
        "name": "Purva Bhadrapada",
        "ne": "पूर्व भाद्रपद",
        "motif": "Twin rays",
        "path": "M5 21V7l6-5 6 5v14M5 9h12M8 15h6M17 14l4 4m-4 0 4-4"
      },
      {
        "id": "uttara-bhadrapada",
        "name": "Uttara Bhadrapada",
        "ne": "उत्तर भाद्रपद",
        "motif": "Deep-water serpents",
        "path": "M3 7c3-5 6-5 9 0s6 5 9 0M3 15c3-5 6-5 9 0s6 5 9 0M6 19h12"
      },
      {
        "id": "revati",
        "name": "Revati",
        "ne": "रेवती",
        "motif": "Swimming fish",
        "path": "M3 12c6-8 12-8 18 0-6 8-12 8-18 0ZM3 12l5 4m-5-4 5-4M16 11h.1"
      }
    ]
  },
  {
    "id": "calendar",
    "title": "CALENDAR · NINE",
    "ne": "नौ पात्रो",
    "entries": [
      {
        "id": "vedic",
        "name": "Vedic",
        "ne": "वैदिक",
        "motif": "Sun–Moon cycle",
        "path": "M3 12a9 9 0 1 0 18 0 9 9 0 1 0-18 0ZM12 3v3M5 12h3M16 12h3M12 18v3M10 9a4 4 0 1 0 4 6"
      },
      {
        "id": "gregorian",
        "name": "Gregorian",
        "ne": "ग्रेगोरियन",
        "motif": "Month grid",
        "path": "M3 6h18v15H3ZM7 3v6m10-6v6M3 11h18M7 15h3m4 0h3M7 18h3"
      },
      {
        "id": "bs",
        "name": "Nepal Bikram Sambat",
        "ne": "विक्रम संवत्",
        "motif": "Nepal Sun–Moon",
        "path": "M3 4h18v17H3ZM7 2v5m10-5v5M3 10h18M8 17a3 3 0 1 0 0-6M18 13a4 4 0 0 1-5 5"
      },
      {
        "id": "nepal-sambat",
        "name": "Nepal Sambat",
        "ne": "नेपाल संवत्",
        "motif": "Mandala calendar",
        "path": "M12 2l3 5 5 2-3 5 1 6-6-2-6 2 1-6-3-5 5-2ZM12 8a4 4 0 1 0 0 8 4 4 0 1 0 0-8"
      },
      {
        "id": "hijri",
        "name": "Islamic Civil Hijri",
        "ne": "हिजरी",
        "motif": "Crescent calendar",
        "path": "M3 6h18v15H3ZM7 3v6m10-6v6M3 11h18M16 14a4 4 0 0 1-4-2 4 4 0 1 0 5 5"
      },
      {
        "id": "chinese",
        "name": "Chinese Lunisolar",
        "ne": "चिनियाँ",
        "motif": "Lantern calendar",
        "path": "M12 3v3M6 6h12v3c2 3 1 7-6 9-7-2-8-6-6-9ZM8 10h8M12 18v3"
      },
      {
        "id": "hebrew",
        "name": "Hebrew",
        "ne": "हिब्रु",
        "motif": "Seven-day cadence",
        "path": "M3 6h18v15H3ZM7 3v6m10-6v6M3 11h18M7 15h2m3 0h2m3 0h1M7 18h2m3 0h2"
      },
      {
        "id": "persian",
        "name": "Persian Solar Hijri",
        "ne": "फारसी",
        "motif": "Equinox sun",
        "path": "M3 6h18v15H3ZM7 3v5m10-5v5M3 12h18M12 15a3 3 0 1 0 0 6M12 14v2m-5 3h2m6 0h2"
      },
      {
        "id": "buddhist",
        "name": "Buddhist Era Thai",
        "ne": "बौद्ध युग",
        "motif": "Dharma wheel",
        "path": "M12 2a10 10 0 1 0 0 20 10 10 0 1 0 0-20ZM12 7a5 5 0 1 0 0 10 5 5 0 1 0 0-10M12 2v20M2 12h20M5 5l14 14m0-14L5 19"
      }
    ]
  },
  {
    "id": "panchang",
    "title": "PANCHANG · FIVE",
    "ne": "पञ्चाङ्ग",
    "entries": [
      {
        "id": "vara",
        "name": "Vara / Weekday",
        "ne": "वार",
        "motif": "Day and sunrise",
        "path": "M3 18h18M12 3v4M5 8l2 2m10-2-2 2M3 13h3m12 0h3M6 18a6 6 0 0 1 12 0"
      },
      {
        "id": "tithi",
        "name": "Tithi",
        "ne": "तिथि",
        "motif": "Lunar angle",
        "path": "M12 3a9 9 0 1 0 0 18 9 9 0 1 0 0-18ZM12 3c6 5 6 13 0 18"
      },
      {
        "id": "nakshatra",
        "name": "Nakshatra",
        "ne": "नक्षत्र",
        "motif": "Star grouping",
        "path": "M12 2l2.6 6.6L21 11l-6.4 2.3L12 20l-2.6-6.7L3 11l6.4-2.4ZM19 3l.5 1.5L21 5l-1.5.5L19 7l-.5-1.5L17 5l1.5-.5Z"
      },
      {
        "id": "yoga",
        "name": "Yoga",
        "ne": "योग",
        "motif": "Joined orbits",
        "path": "M3 16a8 8 0 0 1 16-8M21 8a8 8 0 0 1-16 8M8 12l4-4 4 4"
      },
      {
        "id": "karana",
        "name": "Karana",
        "ne": "करण",
        "motif": "Half-tithi step",
        "path": "M3 3h18v18H3ZM12 3v18M3 12h9M15 10l3 3 3-3"
      }
    ]
  },
  {
    "id": "tools",
    "title": "VEDIC TOOLS · EIGHT",
    "ne": "वैदिक साधन",
    "entries": [
      {
        "id": "kundli",
        "name": "Kundli",
        "ne": "कुण्डली",
        "motif": "Birth chart grid",
        "path": "M3 3h18v18H3ZM12 3 21 12 12 21 3 12ZM3 3l18 18m0-18L3 21"
      },
      {
        "id": "muhurat",
        "name": "Muhurat",
        "ne": "मुहूर्त",
        "motif": "Chosen time",
        "path": "M5 3h14M5 21h14M7 3v5l5 4 5-4V3M7 21v-5l5-4 5 4v5M12 12h.1"
      },
      {
        "id": "festival",
        "name": "Festival",
        "ne": "चाडपर्व",
        "motif": "Oil lamp",
        "path": "M4 15c2 4 14 4 16 0H4ZM12 13c-3-3-2-5 0-8 2 3 3 5 0 8ZM8 19h8"
      },
      {
        "id": "graha-chart",
        "name": "Graha positions",
        "ne": "ग्रहस्थिति",
        "motif": "Orbits",
        "path": "M3 12a9 9 0 1 0 18 0 9 9 0 1 0-18 0ZM12 12a3 3 0 1 0 0 .01M5 12h5m4 0h5"
      },
      {
        "id": "moon-phases",
        "name": "Moon phases",
        "ne": "चन्द्रकला",
        "motif": "Phase sequence",
        "path": "M6 7a5 5 0 1 0 0 10 5 5 0 1 0 0-10ZM18 7a5 5 0 1 0 0 10 5 5 0 1 0 0-10ZM18 7v10"
      },
      {
        "id": "day-night",
        "name": "Day and night",
        "ne": "दिनरात",
        "motif": "Sun and Moon",
        "path": "M7 3v2M2 10h2M4 5l2 2M7 6a4 4 0 1 0 0 8M21 15a6 6 0 0 1-7-7 6 6 0 1 0 7 7Z"
      },
      {
        "id": "source",
        "name": "Verified source",
        "ne": "स्रोत",
        "motif": "Document",
        "path": "M6 2h9l4 4v16H6ZM15 2v5h4M9 13h6m-6 4h6"
      },
      {
        "id": "world",
        "name": "WorldPatro",
        "ne": "विश्व पात्रो",
        "motif": "World meridian",
        "path": "M12 2a10 10 0 1 0 0 20 10 10 0 1 0 0-20ZM2 12h20M12 2c-5 5-5 15 0 20m0-20c5 5 5 15 0 20"
      }
    ]
  }
] as const;
