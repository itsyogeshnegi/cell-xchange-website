import { TableSkeleton } from "@/components/ui/Skeletons";
export default function Loading() { return <div className="mx-auto max-w-7xl"><div className="mb-8 h-10 w-52 animate-pulse rounded-xl bg-[#e4e7e3]"/><TableSkeleton/></div>; }
