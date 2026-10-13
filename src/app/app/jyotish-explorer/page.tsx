import type {Metadata} from "next";
import JyotishExplorer from "@/components/jyotish-explorer";
export const metadata:Metadata={title:"Jyotish Observatory",description:"World Patro Vedic astrology tools, public calculators, real sidereal transits, and Nepal-first astronomical design."};
export default function Page(){return <JyotishExplorer/>;}
