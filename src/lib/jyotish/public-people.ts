/** Curated public biographical facts, NOT copied third-party horoscope content.
 * Birth times are unknown unless a named primary source documents them.
 * No lunar sign, ascendant, yoga or chart is attributed without computation.
 */
export type PublicPerson = {
  slug:string; name:string; nameNe?:string; category:"Nepal"|"Leadership"|"Spirituality"|"Science"|"Royal history";
  occupation:string; born:string; birthplace:string; birthTime:string|null;
  timeStatus:"documented"|"unverified"; birthTimezone?:string;
  context:string; sourceTitle:string; sourceUrl:string;
};
export const PUBLIC_PEOPLE:readonly PublicPerson[] = [
  {slug:"gyanendra-shah",name:"Gyanendra Bir Bikram Shah Dev",nameNe:"श्री ५ ज्ञानेन्द्र वीर विक्रम शाह देव",category:"Nepal",occupation:"King of Nepal (1950–1951; 2001–2008)",born:"1947-07-07",birthplace:"Narayanhiti Palace, Kathmandu, Nepal",birthTime:null,timeStatus:"unverified",context:"A chapter of Nepal's constitutional and royal history.",sourceTitle:"Biograph Nepal · King Gyanendra Shah",sourceUrl:"https://www.biographnepal.com/royal-family/biography-of-king-gyanendra-shah/"},
  {slug:"mahendra-shah",name:"Mahendra Bir Bikram Shah Dev",nameNe:"श्री ५ महेन्द्र वीर विक्रम शाह देव",category:"Nepal",occupation:"King of Nepal (1955–1972)",born:"1920-06-11",birthplace:"Kathmandu, Nepal",birthTime:null,timeStatus:"unverified",context:"A historical profile for studying Nepal's twentieth-century institutions.",sourceTitle:"World Biographical Encyclopedia · Mahendra Dev",sourceUrl:"https://prabook.com/web/mahendra.dev/3732354"},
  {slug:"dalai-lama",name:"14th Dalai Lama",category:"Spirituality",occupation:"Tibetan Buddhist spiritual leader",born:"1935-07-06",birthplace:"Taktser, Amdo",birthTime:null,timeStatus:"unverified",context:"A documented life and a reminder to distinguish biography from unverified birth-hour claims.",sourceTitle:"Office of His Holiness the Dalai Lama · Birth to Exile",sourceUrl:"https://www.dalailama.com/the-dalai-lama/biography-and-daily-life/birth-to-exile"},
  {slug:"nelson-mandela",name:"Nelson Mandela",category:"Leadership",occupation:"South African president and anti-apartheid leader",born:"1918-07-18",birthplace:"Mvezo, South Africa",birthTime:null,timeStatus:"unverified",context:"Public biography anchored to a primary biographical source.",sourceTitle:"Nelson Mandela Foundation · Biography",sourceUrl:"https://www.nelsonmandela.org/biography"},
  {slug:"elizabeth-ii",name:"Elizabeth II",category:"Royal history",occupation:"Queen of the United Kingdom (1952–2022)",born:"1926-04-21",birthplace:"17 Bruton Street, Mayfair, London",birthTime:"02:40",timeStatus:"documented",birthTimezone:"Europe/London",context:"The Royal Family records both the birth date and clock time; chart coordinates and historical timezone still require verification.",sourceTitle:"The Royal Family · Early life and education",sourceUrl:"https://www.royal.uk/the-queens-early-life-and-education?page=7"},
  {slug:"stephen-hawking",name:"Stephen Hawking",category:"Science",occupation:"Theoretical physicist and cosmologist",born:"1942-01-08",birthplace:"Oxford, England",birthTime:null,timeStatus:"unverified",context:"Astronomical science and traditional astrology are separate knowledge domains.",sourceTitle:"Stephen Hawking Estate · Biography",sourceUrl:"https://www.hawking.org.uk/biography"},
  {slug:"richard-feynman",name:"Richard Feynman",category:"Science",occupation:"Theoretical physicist",born:"1918-05-11",birthplace:"New York City, USA",birthTime:null,timeStatus:"unverified",context:"A public life profile; a birth date alone does not determine an ascendant.",sourceTitle:"Richard Feynman · Biographical reference",sourceUrl:"https://en.wikipedia.org/wiki/Richard_Feynman"}
];
export function getPublicPerson(slug:string){return PUBLIC_PEOPLE.find(person=>person.slug===slug);}
