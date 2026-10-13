import type {Metadata} from "next";
import PeopleAtlas from "@/components/people-atlas";
export const metadata:Metadata={title:"Public Lives Atlas",description:"Evidence-first public biographies and documented birth-time uncertainty in World Patro."};
export default function Page(){return <PeopleAtlas/>;}
