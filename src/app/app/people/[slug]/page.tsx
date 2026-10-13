import Link from "next/link";
import {notFound} from "next/navigation";
import type {Metadata} from "next";
import {getPublicPerson,PUBLIC_PEOPLE} from "@/lib/jyotish/public-people";
export function generateStaticParams(){return PUBLIC_PEOPLE.map(p=>({slug:p.slug}));}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
 const {slug}=await params;const person=getPublicPerson(slug);
 return {title:person?person.name+" · Public Lives Atlas":"Profile not found"};
}
export default async function Page({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params,person=getPublicPerson(slug);
 if(!person)notFound();
 return <div className="jm jmProfile">
  <nav aria-label="Breadcrumb" className="jmBreadcrumb"><Link href="/app/people">← Public Lives Atlas</Link><span>/</span><span>{person.name}</span></nav>
  <section className="jmProfileHead"><div className="jmHeroEyebrow"><span className="jmOm">ॐ</span> PUBLIC RECORD / {person.category.toUpperCase()}</div>
   <h1>{person.name}</h1>{person.nameNe&&<h2>{person.nameNe}</h2>}
   <p>{person.occupation}</p>
  </section>
  <div className="jmProfileGrid"><section className="jmProfileFacts">
   <p className="jmKicker">01 / BIOGRAPHICAL EVIDENCE</p><h2>Birth record</h2>
   <dl><div><dt>Gregorian date</dt><dd>{person.born}</dd></div>
   <div><dt>Birthplace</dt><dd>{person.birthplace}</dd></div>
   <div><dt>Birth clock time</dt><dd>{person.birthTime?person.birthTime+" · "+person.birthTimezone:"Not verified"}</dd></div>
   <div><dt>Time evidence</dt><dd>{person.timeStatus==="documented"?"Documented by source":"Unknown — do not infer a Lagna"}</dd></div></dl>
   <p>{person.context}</p>
   <a href={person.sourceUrl} target="_blank" rel="noopener noreferrer" className="jmSource">Read source: {person.sourceTitle} ↗</a>
  </section><aside className="jmProfileBoundary">
   <p className="jmKicker">02 / CHART INTEGRITY</p><h2>No invented ascendant</h2>
   <div className="jmBigOm" aria-hidden="true">ॐ</div>
   <p>{person.timeStatus==="documented"
    ?"A birth time is documented. Coordinates and historical timezone must still be resolved before publishing a chart."
    :"The public record does not establish the exact birth time. World Patro will not present a guessed Lagna, houses or Navamsa as fact."}</p>
   <p>Traditionally interpreted astrological readings are not scientifically validated predictions.</p>
   <Link className="jmGoldButton" href="/app/kundli">Calculate with verified inputs ↗</Link>
  </aside></div>
  <div className="jmClosing"><span>✧</span><div><h2>Source before story.</h2><p>Every claimed astronomical result needs reproducible inputs and a disclosed method.</p></div><Link className="jmOutlineButton" href="/app/jyotish-explorer">Explore Jyotish ↗</Link></div>
 </div>;
}
