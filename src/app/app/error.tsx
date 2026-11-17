"use client";
import Link from "next/link";
export default function Error({reset}:{error:Error;reset:()=>void}){return <div className="wp-panel wp-empty-state"><h1>Something interrupted this view.</h1><p>Your other World Patro tools are still within reach.</p><button className="wp-button wp-button-gold" onClick={reset}>Try again</button> <Link className="wp-button" href="/app">Back to your day</Link></div>;}
