"use client";

import { useState } from "react";
import styles from "./calendar-reference-panel.module.css";

type ProviderId = "ashesh" | "hamro";
const PROVIDERS = {
  ashesh: {
    name: "Ashesh Nepali Calendar",
    ne: "अशेष नेपाली पात्रो",
    subtitle: "मिति · तिथि · पर्व",
    page: "https://www.ashesh.com.np/nepali-calendar/",
    widgetDocs: "https://www.ashesh.com.np/nepali-calendar/widget/",
    // Publisher-provided iframe example: external content stays on the publisher's site.
    widget: "https://www.ashesh.com.np/calendar-widget/calendar.php?tithi=1&header_color=0C2540&api=0911x2q151",
    height: 380
  },
  hamro: {
    name: "Hamro Patro",
    ne: "हाम्रो पात्रो",
    subtitle: "नेपाली क्यालेन्डर · सार्वजनिक स्रोत",
    page: "https://www.hamropatro.com/",
    widgetDocs: "https://www.hamropatro.com/en/widgets",
    widget: "https://www.hamropatro.com/widgets/calender-responsive.php",
    height: 540
  }
} as const;

export default function CalendarReferencePanel() {
  const [selected, setSelected] = useState<ProviderId | null>(null);
  const provider = selected ? PROVIDERS[selected] : null;

  return (
    <section className={styles.panel} id="calendar-references" aria-labelledby="external-calendar-title">
      <div className={styles.head}>
        <div>
          <div className={styles.kicker}>ॐ · WORLD PATRO · SOURCE LIBRARY</div>
          <h2 id="external-calendar-title">सन्दर्भ पात्रो · Calendar references</h2>
          <p>नेपाली पात्रोका दुई स्वतन्त्र प्रकाशकको आधिकारिक widget एकै ठाउँमा हेर्नुहोस्। मूल World Patro मिति र पञ्चाङ्ग गणना अलग रहन्छ।</p>
        </div>
        <div className={styles.seal} aria-hidden="true">चन्द्र · सूर्य <span>🇳🇵</span></div>
      </div>

      <div className={styles.providerList} aria-label="Choose external calendar provider">
        {(Object.keys(PROVIDERS) as ProviderId[]).map(id => {
          const item = PROVIDERS[id];
          return (
            <button
              type="button"
              key={id}
              className={styles.provider + (selected === id ? " " + styles.selected : "")}
              aria-pressed={selected === id}
              onClick={() => setSelected(current => current === id ? null : id)}
            >
              <span className={styles.providerMark}>{id === "ashesh" ? "अ" : "ह"}</span>
              <span className={styles.providerText}>
                <strong>{item.ne}</strong>
                <small>{item.subtitle}</small>
              </span>
              <span className={styles.providerAction}>{selected === id ? "बन्द गर्नुहोस् −" : "हेर्नुहोस् +"}</span>
            </button>
          );
        })}
      </div>

      {provider ? (
        <div className={styles.viewer}>
          <div className={styles.viewerHead}>
            <span>EXTERNAL PUBLISHER VIEW · {provider.name}</span>
            <a href={provider.page} target="_blank" rel="noopener noreferrer">मूल वेबसाइट ↗</a>
          </div>
          <iframe
            key={selected}
            className={styles.embed}
            src={provider.widget}
            title={provider.ne + " — publisher-hosted calendar"}
            loading="lazy"
            height={provider.height}
            referrerPolicy="strict-origin-when-cross-origin"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
          <p className={styles.attribution}>
            © <a href={provider.page} target="_blank" rel="noopener noreferrer">{provider.name}</a>
            {" "}· <a href={provider.widgetDocs} target="_blank" rel="noopener noreferrer">आधिकारिक widget विवरण</a>
          </p>
        </div>
      ) : (
        <div className={styles.empty}>
          <span className={styles.emptySymbol} aria-hidden="true">☼</span>
          <p>माथि एउटा स्रोत छान्नुहोस्। तपाईंले नछानेसम्म बाह्य widget लोड हुँदैन।</p>
        </div>
      )}

      <div className={styles.notice}>
        <strong>स्रोत र अनुमति स्पष्टता</strong>
        <p>Widget खोलेपछि तपाईंको browser सम्बन्धित प्रकाशकको वेबसाइटमा जोडिन्छ। यी सामग्री प्रत्यक्ष बाह्य स्रोत हुन्—World Patro को स्वामित्व वा प्रमाणित सरकारी पात्रो होइनन्। प्रकाशकको लिखित अनुमति बिना उनीहरूको सम्पूर्ण तिथि/पर्व सामग्री scrape, पुनःप्रकाशन वा native API मा import गरिँदैन।</p>
      </div>
    </section>
  );
}
