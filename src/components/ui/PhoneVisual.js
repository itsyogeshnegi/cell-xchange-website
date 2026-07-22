export default function PhoneVisual() {
  return <div className="relative mx-auto h-[430px] w-[310px] sm:h-[530px] sm:w-[390px]">
    <div className="absolute left-1/2 top-1/2 h-[330px] w-[330px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-black/10 sm:h-[420px] sm:w-[420px]"/>
    <div className="phone-shadow absolute left-3 top-16 h-[345px] w-[174px] -rotate-[9deg] rounded-[30px] border-[6px] border-[#b7b8ba] bg-[#d9d9d8] sm:left-5 sm:h-[430px] sm:w-[214px] sm:rounded-[38px]">
      <div className="absolute left-4 top-4 h-16 w-16 rounded-[18px] bg-[#c6c7c7]"><i className="absolute left-2 top-2 h-6 w-6 rounded-full border-[3px] border-[#9fa1a3] bg-[#101114]"/><i className="absolute bottom-2 right-2 h-6 w-6 rounded-full border-[3px] border-[#9fa1a3] bg-[#101114]"/></div><span className="absolute bottom-5 left-1/2 -translate-x-1/2 text-[8px] font-bold uppercase tracking-[.25em] text-black/35">cell.xchange</span>
    </div>
    <div className="phone-shadow absolute bottom-0 right-2 h-[355px] w-[180px] rotate-[7deg] rounded-[32px] border-[6px] border-[#181a1e] bg-[#08090b] sm:right-3 sm:h-[440px] sm:w-[220px] sm:rounded-[39px]">
      <div className="absolute inset-[5px] overflow-hidden rounded-[22px] bg-[radial-gradient(circle_at_70%_25%,#547cff_0%,#18317b_28%,#101218_68%)] sm:rounded-[29px]"><div className="absolute left-1/2 top-2 h-4 w-14 -translate-x-1/2 rounded-full bg-black"/><p className="absolute left-5 top-11 text-[9px] font-semibold uppercase tracking-[.2em] text-white/55">Wednesday</p><p className="absolute left-5 top-16 text-4xl font-light tracking-[-.06em] text-white sm:text-5xl">12:00</p><div className="absolute bottom-5 left-5 right-5 flex justify-between text-[7px] font-bold uppercase tracking-[.2em] text-white/50"><span>In stock</span><span>Vasant Kunj</span></div></div>
    </div>
    <div className="absolute right-0 top-5 border border-black/10 bg-white px-4 py-3 shadow-[0_15px_35px_rgba(0,0,0,.08)]"><p className="text-[9px] font-bold uppercase tracking-[.18em] text-[#777b82]">Open daily</p><p className="mt-1 text-sm font-bold">12 PM — 10 PM</p></div>
  </div>;
}
