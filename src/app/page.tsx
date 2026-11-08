import {Suspense} from "react";
import {AppShell} from "@/components/app-shell";
import CommandCenter from "@/components/command-center";
export const dynamic="force-dynamic";
export default function Home(){return <Suspense fallback={<div className="wp-starting"><span>ॐ</span><strong>World Patro</strong><small>Opening your day…</small></div>}><AppShell><CommandCenter/></AppShell></Suspense>;}
