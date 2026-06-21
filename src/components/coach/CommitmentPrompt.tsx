import type { CommitmentResponse } from "@/types/bottleneck";
import type { Dispatch, SetStateAction } from "react";
export default function CommitmentPrompt({ sessionId, onCommit }: { sessionId: string | null; onCommit: Dispatch<SetStateAction<CommitmentResponse | null>> }) {
  return (
    <div className="bg-[#1a1d27] border border-gray-800 rounded-xl p-6">
      <p className="text-gray-300 text-sm">Session: {sessionId}</p>
    </div>
  );
}
