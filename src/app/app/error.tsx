"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
export default function Error({error,reset}:{error:Error;reset:()=>void}){
 const [debug,setDebug]=useState(false);
 useEffect(()=>{setDebug(new URLSearchParams(window.location.search).get("debugCalendar")==="1");},[]);
 const kind=/^[A-Za-z]+Error$/.test(error.name)?error.name:"Error";
 const message=String(error.message||"")
  .replace(/https?:\/\/[^\s]+/g,"[url]")
  .replace(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g,"[email]")
  .replace(/[A-Za-z0-9_-]{40,}/g,"[redacted]")
  .slice(0,240);
 return <div className="wp-panel wp-empty-state">
  <h1>Something interrupted this view.</h1>
  <p>Your other World Patro tools are still within reach.</p>
  {debug&&<p role="status" data-calendar-error="safe">
    Diagnostic: {kind} — {message||"No message available"}
  </p>}
  <button className="wp-button wp-button-gold" onClick={reset}>Try again</button>{" "}
  <Link className="wp-button" href="/app">Back to your day</Link>
 </div>;
}
