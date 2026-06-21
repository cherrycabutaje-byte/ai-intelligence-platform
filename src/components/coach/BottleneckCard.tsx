import type { BottleneckResult } from "@/types/bottleneck";
export default function BottleneckCard({ result }: { result: BottleneckResult }) {
  return (
    <div className="bg-[#1a1d27] border border-gray-800 rounded-xl p-6">
      <h2 className="text-white text-xl font-bold">
        {result.selected_bottleneck}
      </h2>
    </div>
  );
}
