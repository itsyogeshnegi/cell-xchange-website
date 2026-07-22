export default function PhoneVisual() {
  return <div className="relative mx-auto h-[430px] w-[280px] sm:h-[500px] sm:w-[325px]">
    <div className="phone-shadow absolute left-0 top-12 h-[375px] w-[188px] -rotate-[11deg] rounded-[34px] border-[7px] border-[#202522] bg-[#d6efce] sm:h-[440px] sm:w-[220px]">
      <div className="absolute left-1/2 top-2 h-4 w-14 -translate-x-1/2 rounded-full bg-[#202522]"/><div className="dot-grid m-2.5 h-[calc(100%-20px)] rounded-[23px]"/><span className="absolute bottom-9 left-7 text-[10px] font-black uppercase tracking-[.2em]">mobile<br/>made<br/>simple.</span>
    </div>
    <div className="phone-shadow absolute bottom-0 right-0 h-[375px] w-[188px] rotate-[9deg] rounded-[34px] border-[7px] border-[#d9d9d7] bg-[#f3f0e9] sm:h-[440px] sm:w-[220px]">
      <div className="absolute left-5 top-5 h-16 w-16 rounded-[19px] bg-[#d5d5d1]"><i className="absolute left-2 top-2 h-6 w-6 rounded-full bg-[#1d211f] ring-4 ring-[#babbb7]"/><i className="absolute bottom-2 right-2 h-6 w-6 rounded-full bg-[#1d211f] ring-4 ring-[#babbb7]"/></div>
      <div className="absolute bottom-7 left-1/2 h-6 w-20 -translate-x-1/2 rounded-full bg-[#e8e5dd]"/>
    </div>
  </div>;
}
