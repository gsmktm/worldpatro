/** Reviewed civil dates. Never extrapolate an annual recurrence from this release.
 * Source: Kathmandu Metropolitan City Kartik 2083 grid, inspected 2026-11-08.
 * Scope: municipality-published observance dates, not national holiday certification.
 */
export const FESTIVAL_SOURCE={publisher:"Kathmandu Metropolitan City",url:"https://kathmandu.gov.np/en/calendar",checkedOn:"2026-11-08",coverageStart:"2026-10-18",coverageEnd:"2026-11-16"};
export type Festival={id:string;date:string;title:string;ne:string;category:"festival"|"observance";description:string};
export const FESTIVALS:readonly Festival[]=[
{id:"maha-ashtami-2083",date:"2026-10-18",title:"Maha Ashtami",ne:"महाअष्टमी",category:"festival",description:"Kartik 1 · Dashain observance."},
{id:"maha-navami-2083",date:"2026-10-20",title:"Maha Navami",ne:"महानवमी",category:"festival",description:"Kartik 3 · Dashain observance."},
{id:"vijaya-dashami-2083",date:"2026-10-21",title:"Vijaya Dashami",ne:"विजया दशमी",category:"festival",description:"Kartik 4 · Dashain."},
{id:"kojagrat-2083",date:"2026-10-25",title:"Kojagrat Purnima",ne:"कोजाग्रत पूर्णिमा",category:"festival",description:"Kartik 8 · Full-moon observance."},
{id:"rama-ekadashi-2083",date:"2026-11-05",title:"Rama Ekadashi",ne:"रमा एकादशी",category:"observance",description:"Kartik 19 · Published observance date."},
{id:"dhanteras-2083",date:"2026-11-06",title:"Dhanteras",ne:"धनतेरस",category:"festival",description:"Kartik 20 · Published Tihar calendar."},
{id:"kaag-tihar-2083",date:"2026-11-07",title:"Kaag Tihar",ne:"काग तिहार",category:"festival",description:"Kartik 21 · Published Tihar calendar."},
{id:"kukur-laxmi-2083",date:"2026-11-08",title:"Kukur Tihar & Laxmi Puja",ne:"कुकुर तिहार तथा लक्ष्मीपूजा",category:"festival",description:"Kartik 22 · Two observances share this published civil date."},
{id:"gai-tihar-2083",date:"2026-11-09",title:"Gai Tihar",ne:"गाई तिहार",category:"festival",description:"Kartik 23 · Published Tihar calendar."},
{id:"mha-puja-2083",date:"2026-11-10",title:"Mha Puja & Nepal Sambat New Year",ne:"म्हः पूजा तथा नेपाल संवत् नववर्ष",category:"festival",description:"Kartik 24 · Also Govardhan and Goru Puja in this release."},
{id:"bhai-tika-2083",date:"2026-11-11",title:"Bhai Tika",ne:"भाइटीका",category:"festival",description:"Kartik 25 · Published date; ritual saait requires an authority notice."},
{id:"chhath-2083",date:"2026-11-15",title:"Chhath",ne:"छठ",category:"festival",description:"Kartik 29 · Published observance date."}
];
