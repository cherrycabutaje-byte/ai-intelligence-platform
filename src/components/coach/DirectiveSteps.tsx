import type { Directive } from "@/types/bottleneck";
export default function DirectiveSteps({ directive }: { directive: Directive }) {
  return (
    <div className="bg-[#1a1d27] border border-gray-800 rounded-xl p-6">
      <h2 className="text-white text-xl font-bold">{directive.title}</h2>
    </div>
  );
}
