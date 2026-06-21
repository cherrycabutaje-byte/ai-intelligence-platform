import type { Evidence } from "@/types/bottleneck";
export default function EvidenceBlock({ evidence }: { evidence: Evidence }) {
  return (
    <div className="bg-[#1a1d27] border border-gray-800 rounded-xl p-6">
      <p className="text-gray-300 text-sm">{evidence.signal}</p>
    </div>
  );
}
