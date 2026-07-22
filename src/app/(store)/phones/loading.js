import { PhoneGridSkeleton } from "@/components/ui/Skeletons";
export default function Loading() { return <section className="container-shell py-16"><div className="mb-12"><div className="h-3 w-28 animate-pulse rounded bg-[#e9ece8]"/><div className="mt-5 h-16 max-w-xl animate-pulse rounded-2xl bg-[#e9ece8]"/></div><PhoneGridSkeleton/></section>; }
