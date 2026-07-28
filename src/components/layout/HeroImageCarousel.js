"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

export default function HeroImageCarousel({ images = [], alt = "Store hero image" }) {
  const slides = images.filter((image) => image?.url);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (slides.length < 2 || paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % slides.length), 5000);
    return () => window.clearInterval(timer);
  }, [paused, slides.length]);

  if (!slides.length) return null;
  const visibleSlide = active % slides.length;
  const goTo = (index) => setActive((index + slides.length) % slides.length);

  return <div
    className="absolute inset-0"
    aria-roledescription="carousel"
    aria-label="Featured store images"
    onMouseEnter={() => setPaused(true)}
    onMouseLeave={() => setPaused(false)}
    onFocus={() => setPaused(true)}
    onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
    }}
  >
    {slides.map((image, index) => <div
      key={image.publicId || image.url}
      className={`absolute inset-0 transition-opacity duration-700 ${index === visibleSlide ? "opacity-100" : "pointer-events-none opacity-0"}`}
      aria-hidden={index !== visibleSlide}
    >
      <Image
        src={image.url}
        alt={index === visibleSlide ? alt : ""}
        fill
        priority={index === 0}
        sizes="(min-width: 1024px) 48vw, 100vw"
        className="object-cover object-center"
      />
    </div>)}
    {slides.length > 1 && <>
      <button type="button" onClick={() => goTo(visibleSlide - 1)} aria-label="Show previous hero image" className="absolute left-4 top-1/2 z-10 grid size-10 -translate-y-1/2 place-items-center rounded-full border border-white/30 bg-black/45 text-white backdrop-blur-sm transition hover:bg-black/75"><ChevronLeft size={19}/></button>
      <button type="button" onClick={() => goTo(visibleSlide + 1)} aria-label="Show next hero image" className="absolute right-4 top-1/2 z-10 grid size-10 -translate-y-1/2 place-items-center rounded-full border border-white/30 bg-black/45 text-white backdrop-blur-sm transition hover:bg-black/75"><ChevronRight size={19}/></button>
      <div className="absolute bottom-7 right-6 z-10 flex gap-2 sm:bottom-9 sm:right-8" aria-label={`Slide ${visibleSlide + 1} of ${slides.length}`}>
        {slides.map((image, index) => <button key={image.publicId || image.url} type="button" onClick={() => goTo(index)} aria-label={`Show hero image ${index + 1}`} aria-current={index === visibleSlide ? "true" : undefined} className={`h-1.5 rounded-full transition-all ${index === visibleSlide ? "w-7 bg-white" : "w-2 bg-white/50 hover:bg-white/80"}`}/>)}
      </div>
    </>}
  </div>;
}
