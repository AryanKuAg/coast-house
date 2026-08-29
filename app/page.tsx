"use client";

import { useEffect, useRef, useState } from "react";

const HERO_VIDEO = "hero-scroll.mp4";

type ScrollyVideoInstance = {
  destroy?: () => void;
};

type ScrollyVideoConstructor = new (options: {
  src: string;
  scrollyVideoContainer: HTMLElement;
  cover?: boolean;
  sticky?: boolean;
  full?: boolean;
  trackScroll?: boolean;
  lockScroll?: boolean;
  transitionSpeed?: number;
  frameThreshold?: number;
  useWebCodecs?: boolean;
  onReady?: () => void;
  onChange?: (percentage: number) => void;
}) => ScrollyVideoInstance;

declare global {
  interface Window {
    ScrollyVideo?: ScrollyVideoConstructor;
  }
}

const properties = [
  {
    className: "property--asteria",
    number: "01",
    location: "Paros, Greece",
    name: "Asteria House",
    image:
      "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1800&q=88",
    alt: "Whitewashed Greek villa above the Aegean Sea",
    rate: "From €2,850 / night",
    capacity: "8 guests · 4 suites",
    amenities: "Infinity pool · Private chef · Sea access",
  },
  {
    className: "property--serra",
    number: "02",
    location: "Deià, Mallorca",
    name: "Casa Serra",
    image:
      "https://images.unsplash.com/photo-1530789253388-582c481c54b0?auto=format&fit=crop&w=1600&q=88",
    alt: "Rocky Mediterranean coastline in warm afternoon light",
    rate: "From €3,400 / night",
    capacity: "10 guests · 5 suites",
    amenities: "Cliffside pool · Hammam · Sunset dining",
  },
  {
    className: "property--brava",
    number: "03",
    location: "Cala Llonga, Ibiza",
    name: "Casa Brava",
    image:
      "https://images.unsplash.com/photo-1540202404-a2f29016b523?auto=format&fit=crop&w=1800&q=88",
    alt: "Turquoise cove and a secluded beach in the Balearics",
    rate: "From €4,100 / night",
    capacity: "12 guests · 6 suites",
    amenities: "Hidden cove · DJ booth · Yacht berth",
  },
  {
    className: "property--vela",
    number: "04",
    location: "Ravello, Amalfi Coast",
    name: "Vela Alta",
    image:
      "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1800&q=88",
    alt: "Amalfi Coast village cascading toward the sea",
    rate: "From €5,600 / night",
    capacity: "14 guests · 7 suites",
    amenities: "Lemon terraces · Boat days · 24/7 concierge",
  },
];

const experienceItems = [
  {
    number: "01",
    title: "Water, to yourself",
    description: "A private pool, a quiet cove, and the sea exactly when you want it.",
  },
  {
    number: "02",
    title: "The table comes to you",
    description: "Private chefs build the menu around the market, the mood, and the moment.",
  },
  {
    number: "03",
    title: "A local point of view",
    description: "Our concierge unlocks the places that never make the guidebook.",
  },
  {
    number: "04",
    title: "Out on the blue",
    description: "Yacht access, hidden beaches, and a day charted entirely around your pace.",
  },
  {
    number: "05",
    title: "The house, made yours",
    description: "Every room, ritual, and arrival is prepared around the way you travel.",
  },
  {
    number: "06",
    title: "Effortless by design",
    description: "Thoughtful hospitality, quietly anticipated, from the first transfer to the last light.",
  },
];

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

export default function Home() {
  const videoMountRef = useRef<HTMLDivElement>(null);
  const fallbackVideoRef = useRef<HTMLVideoElement>(null);
  const heroSequenceRef = useRef<HTMLElement>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const heroSequence = heroSequenceRef.current;
    if (!heroSequence) return;

    const revealElements = Array.from(
      document.querySelectorAll<HTMLElement>(".reveal"),
    );
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16 },
    );
    revealElements.forEach((element) => revealObserver.observe(element));

    let scrollyVideo: ScrollyVideoInstance | undefined;
    let scriptElement: HTMLScriptElement | null = null;
    let isCancelled = false;

    const attachScrollyVideo = () => {
      const mount = videoMountRef.current;
      const ScrollyVideo = window.ScrollyVideo;
      if (!mount || !ScrollyVideo || isCancelled) return;

      scrollyVideo = new ScrollyVideo({
        src: HERO_VIDEO,
        scrollyVideoContainer: mount,
        cover: true,
        sticky: false,
        full: false,
        trackScroll: true,
        lockScroll: false,
        transitionSpeed: 14,
        frameThreshold: 0.08,
        useWebCodecs: false,
        onReady: () => {
          if (fallbackVideoRef.current) {
            fallbackVideoRef.current.style.opacity = "0";
          }
          mount.classList.add("is-ready");
          setIsVideoReady(true);
        },
        onChange: (percentage) => {
          const safePercentage = Number.isFinite(percentage)
            ? Math.min(1, Math.max(0, percentage))
            : 0;
          heroSequence.style.setProperty(
            "--video-progress",
            String(safePercentage),
          );
        },
      });

      // The HTML5 path does not call ScrollyVideo's onReady callback. Wait for
      // its first decoded frame before replacing the visual fallback.
      const mountedVideo = mount.querySelector("video");
      const revealMountedVideo = () => {
        mount.classList.add("is-ready");
        if (fallbackVideoRef.current) {
          fallbackVideoRef.current.style.opacity = "0";
        }
        setIsVideoReady(true);
      };

      if (mountedVideo?.readyState && mountedVideo.readyState >= 2) {
        revealMountedVideo();
      } else {
        mountedVideo?.addEventListener("loadeddata", revealMountedVideo, {
          once: true,
        });
      }
    };

    if (window.ScrollyVideo) {
      attachScrollyVideo();
    } else {
      scriptElement = document.createElement("script");
      scriptElement.src = "/scrolly-video.js";
      scriptElement.async = true;
      scriptElement.onload = attachScrollyVideo;
      document.body.appendChild(scriptElement);
    }

    return () => {
      isCancelled = true;
      revealObserver.disconnect();
      scrollyVideo?.destroy?.();
      scriptElement?.remove();
    };
  }, []);

  useEffect(() => {
    if (!isVideoReady) return;

    let isCancelled = false;
    let revealTimeout: number | undefined;

    const waitForImages = () =>
      Promise.all(
        Array.from(document.images)
          .filter((image) => image.loading !== "lazy")
          .map((image) => {
          if (image.complete) {
            return Promise.resolve();
          }

          return new Promise<void>((resolve) => {
            let settled = false;
            let timeout: number;
            const finish = () => {
              if (settled) return;
              settled = true;
              window.clearTimeout(timeout);
              image.removeEventListener("load", finish);
              image.removeEventListener("error", finish);
              resolve();
            };

            timeout = window.setTimeout(finish, 2500);
            image.addEventListener("load", finish, { once: true });
            image.addEventListener("error", finish, { once: true });
            });
          }),
      );

    const revealSite = () => {
      Promise.all([waitForImages(), document.fonts?.ready ?? Promise.resolve()]).then(
        () => {
          if (isCancelled) return;
          revealTimeout = window.setTimeout(() => setIsLoading(false), 80);
        },
      );
    };

    if (document.readyState === "complete") {
      revealSite();
    } else {
      window.addEventListener("load", revealSite, { once: true });
    }

    return () => {
      isCancelled = true;
      window.removeEventListener("load", revealSite);
      if (revealTimeout) window.clearTimeout(revealTimeout);
    };
  }, [isVideoReady]);

  useEffect(() => {
    document.documentElement.classList.toggle("is-loading", isLoading);
    return () => document.documentElement.classList.remove("is-loading");
  }, [isLoading]);

  return (
    <main className="site-shell">
      <div
        className={`loading-screen${isLoading ? "" : " is-complete"}`}
        aria-hidden={!isLoading}
        role="status"
      >
        <div className="loading-screen__top">
          <span className="loading-wordmark">Arcadia</span>
          <span className="loading-edition">Private coastal stays</span>
        </div>
        <div className="loading-screen__center">
          <div className="loading-mark" aria-hidden="true">
            <span>A</span>
          </div>
          <p>Preparing your stay</p>
          <div className="loading-rule" aria-hidden="true" />
        </div>
        <div className="loading-screen__bottom">
          <span>01 / The coast</span>
          <span>Paros · Mallorca · Ibiza</span>
        </div>
      </div>
      <section className="hero-sequence" id="arrival" ref={heroSequenceRef}>
        <div className="scrolly-track" aria-hidden="true">
          <div className="scrolly-video-mount" ref={videoMountRef} />
        </div>
        <div className="hero-sticky">
          <div className="hero-media" aria-hidden="true">
            <video
              ref={fallbackVideoRef}
              className="hero-fallback"
              src={HERO_VIDEO}
              muted
              playsInline
              preload="metadata"
            />
          </div>
          <div className="hero-grain" />

          <header className="site-nav">
            <a className="brand-lockup" href="#arrival" aria-label="Arcadia home">
              <span className="brand-mark">A</span>
              <span className="brand-name">
                Arcadia
                <small>Private coastal stays</small>
              </span>
            </a>
            <nav className="nav-links" aria-label="Primary navigation">
              <a href="#properties">The collection</a>
              <a href="#stay">The experience</a>
            </nav>
            <a className="nav-enquire" href="#contact">
              Enquire <Arrow />
            </a>
          </header>

          <div className="hero-content">
            <h1>
              Stay somewhere
              <br />
              unforgettable<span>.</span>
            </h1>
            <p className="hero-description">
              Villas with a point of view, held in the quietest corners of the coast.
            </p>
            <a className="button button--light" href="#properties">
              Explore Villas <Arrow />
            </a>
          </div>
        </div>
      </section>

      <section className="properties-section" id="properties">
        <div className="section-heading reveal">
          <div>
            <p className="eyebrow">01 / The collection</p>
            <h2>
              Residences with
              <br />
              <em>something to say.</em>
            </h2>
          </div>
          <p className="section-intro">
            We look for the rare addresses: houses that belong to their landscape,
            open onto the right light, and make staying somewhere feel like a story
            worth keeping.
          </p>
        </div>

        <div className="property-grid">
          {properties.map((property, index) => (
            <article
              className={`property ${property.className} reveal`}
              key={property.name}
              style={{ transitionDelay: `${index * 80}ms` }}
            >
              <div className="property-media">
                <img
                  src={property.image}
                  alt={property.alt}
                  loading="lazy"
                />
                <span className="property-number">{property.number}</span>
                <span className="property-status">Available on request</span>
              </div>
              <div className="property-caption">
                <div className="property-title">
                  <p className="property-location">{property.location}</p>
                  <h3>{property.name}</h3>
                </div>
                <div className="property-facts">
                  <span>{property.rate}</span>
                  <span>{property.capacity}</span>
                </div>
                <p className="property-amenities">{property.amenities}</p>
                <a className="text-link" href="#contact">
                  View residence <Arrow />
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="experience-section" id="stay">
        <div className="experience-heading reveal">
          <p className="eyebrow">02 / The stay experience</p>
          <h2>
            Luxury, with
            <br />
            <em>the edges left open.</em>
          </h2>
          <p>
            The best parts are rarely on the itinerary. Arcadia is a softer kind of
            service: personal, intuitive, and tuned to the way you want to spend a
            day by the sea.
          </p>
        </div>

        <div className="experience-layout">
          <div className="experience-image reveal">
            <img
              src="https://images.unsplash.com/photo-1602002418082-a4443e081dd1?auto=format&fit=crop&w=1400&q=88"
              alt="Sunlit terrace overlooking a quiet Mediterranean sea"
              loading="lazy"
            />
            <div className="image-caption">
              <span>Take the long way</span>
              <span>01 — 06</span>
            </div>
          </div>

          <div className="experience-list">
            {experienceItems.map((item, index) => (
              <div
                className="experience-row reveal"
                key={item.number}
                style={{ transitionDelay: `${index * 70}ms` }}
              >
                <span className="experience-number">{item.number}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <span className="experience-arrow" aria-hidden="true">
                  ↗
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="contact-section" id="contact">
        <div className="contact-inner reveal">
          <p className="eyebrow">03 / Begin anywhere</p>
          <h2>
            Your escape
            <br />
            <em>starts here.</em>
          </h2>
          <p className="contact-copy">
            Tell us the kind of horizon you are looking for. We will take it from
            there.
          </p>
          <a className="button button--ivory" href="mailto:stay@arcadia-stays.example">
            Find a Stay <Arrow />
          </a>
        </div>

        <footer className="site-footer">
          <div className="footer-brand">Arcadia / 2026</div>
          <div className="footer-note">Private coastal villas &amp; considered stays</div>
          <a href="mailto:stay@arcadia-stays.example">stay@arcadia-stays.example</a>
          <a href="#arrival" className="footer-top">
            Back to top ↑
          </a>
        </footer>
      </section>
    </main>
  );
}
