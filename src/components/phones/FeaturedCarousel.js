"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import PhoneCard from "@/components/phones/PhoneCard";

export default function FeaturedCarousel({ phones }) {
  const scrollerRef = useRef(null);
  const [paused, setPaused] = useState(false);

  const move = useCallback((direction) => {
    const scroller = scrollerRef.current;
    const card = scroller?.querySelector("[data-carousel-card]");
    if (!scroller || !card) return;
    const gap = Number.parseFloat(getComputedStyle(scroller).columnGap) || 20;
    const step = card.getBoundingClientRect().width + gap;
    const maxScroll = Math.max(0, scroller.scrollWidth - scroller.clientWidth);
    const nearStart = scroller.scrollLeft <= 2;
    const nearEnd = scroller.scrollLeft >= maxScroll - 2;
    const left = direction > 0 && nearEnd
      ? 0
      : direction < 0 && nearStart
        ? scroller.scrollWidth
        : scroller.scrollLeft + step * direction;
    scroller.scrollTo({ left, behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (phones.length < 2 || paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const timer = window.setInterval(() => move(1), 4200);
    return () => window.clearInterval(timer);
  }, [move, paused, phones.length]);

  return <div
    className="group/carousel relative"
    role="region"
    aria-label="Featured products"
    onMouseEnter={() => setPaused(true)}
    onMouseLeave={() => setPaused(false)}
    onFocusCapture={() => setPaused(true)}
    onBlurCapture={() => setPaused(false)}
  >
    <div ref={scrollerRef} className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-2">
      {phones.map((phone) => <div key={phone._id} data-carousel-card className="min-w-0 shrink-0 basis-[86%] snap-start sm:basis-[62%] lg:basis-[52%]">
        <PhoneCard phone={phone}/>
      </div>)}
    </div>
    {phones.length > 1 && <>
      <button type="button" onClick={() => move(-1)} aria-label="Previous featured product" className="absolute left-3 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-black/10 bg-white/90 shadow-lg backdrop-blur hover:bg-black hover:text-white sm:grid"><ChevronLeft size={18}/></button>
      <button type="button" onClick={() => move(1)} aria-label="Next featured product" className="absolute right-3 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-black/10 bg-white/90 shadow-lg backdrop-blur hover:bg-black hover:text-white sm:grid"><ChevronRight size={18}/></button>
    </>}
  </div>;
}
