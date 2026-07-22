"use client";
import Image from "next/image";
import { useState } from "react";
import { Maximize2 } from "lucide-react";

export default function PhoneGallery({ phone }) {
  const [active, setActive] = useState(0); const [zoom, setZoom] = useState(false); const images = phone.images || [];
  return <div className="grid gap-3 sm:grid-cols-[76px_1fr]">
    <div className="order-2 flex gap-2 sm:order-1 sm:flex-col">{images.map((image,index)=><button aria-label={`View image ${index+1}`} key={image.url} onClick={()=>setActive(index)} className={`relative aspect-square w-[68px] overflow-hidden bg-[#f3f4f2] ${active===index?"ring-2 ring-black":"ring-1 ring-[#e3e3e0]"}`}><Image fill src={image.url} alt="" className="object-cover" sizes="76px"/></button>)}</div>
    <button onClick={()=>setZoom(!zoom)} className={`group relative order-1 overflow-hidden rounded-[28px] bg-[#f3f4f2] sm:order-2 ${zoom?"cursor-zoom-out":"cursor-zoom-in"}`} style={{aspectRatio:"1/1.08"}}><Image fill priority src={images[active]?.url} alt={`${phone.brand} ${phone.model}`} sizes="(max-width: 768px) 100vw, 50vw" className={`object-cover transition duration-500 ${zoom?"scale-150":"group-hover:scale-[1.03]"}`}/><span className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/90 shadow-sm"><Maximize2 size={16}/></span></button>
  </div>;
}
