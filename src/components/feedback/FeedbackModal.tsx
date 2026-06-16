"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase";

interface FeedbackModalProps {
  onClose: () => void;
}

export default function FeedbackModal({ onClose }: FeedbackModalProps) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [whatYouLoved, setWhatYouLoved] = useState("");
  const [whatToImprove, setWhatToImprove] = useState("");
  const [wouldRecommend, setWouldRecommend] = useState(true);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from("feedback").insert({
        user_id: user.id,
        rating,
        what_you_loved: whatYouLoved || null,
        what_to_improve: whatToImprove || null,
        would_recommend: wouldRecommend,
      });
      setDone(true);
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1d27] border border-gray-700 rounded-xl w-full max-w-md">
        {done ? (
          <div className="px-6 py-12 text-center">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-xl font-bold text-white mb-2">Thank you!</h2>
            <p className="text-gray-400 text-sm mb-6">Your feedback helps us make Jarvis better for everyone.</p>
            <button onClick={onClose} className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-6 py-2 rounded-lg text-sm">
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
              <div>
                <h2 className="text-lg font-semibold text-white">⭐ Rate Jarvis</h2>
                <p className="text-xs text-gray-400 mt-0.5">Your feedback helps us improve</p>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">✕</button>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* Star Rating */}
              <div>
                <p className="text-sm text-gray-300 font-medium mb-3">How would you rate Jarvis?</p>
                <div className="flex gap-2 justify-center">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onMouseEnter={() => setHovered(star)}
                      onMouseLeave={() => setHovered(0)}
                      onClick={() => setRating(star)}
                      className="text-4xl transition-transform hover:scale-110"
                    >
                      {star <= (hovered || rating) ? "⭐" : "☆"}
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="text-center text-sm mt-2 text-gray-400">
                    {rating === 1 ? "😞 Poor" : rating === 2 ? "😐 Fair" : rating === 3 ? "🙂 Good" : rating === 4 ? "😊 Great" : "🤩 Amazing!"}
                  </p>
                )}
              </div>

              {/* What you loved */}
              <div>
                <label className="block text-sm text-gray-300 font-medium mb-1">What did you love about Jarvis?</label>
                <textarea
                  value={whatYouLoved}
                  onChange={e => setWhatYouLoved(e.target.value)}
                  placeholder="e.g. The SEO tags were super specific and accurate!"
                  rows={3}
                  className="w-full bg-[#0f1117] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              {/* What to improve */}
              <div>
                <label className="block text-sm text-gray-300 font-medium mb-1">What can we improve?</label>
                <textarea
                  value={whatToImprove}
                  onChange={e => setWhatToImprove(e.target.value)}
                  placeholder="e.g. I wish the thumbnail formula had examples..."
                  rows={3}
                  className="w-full bg-[#0f1117] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              {/* Would recommend */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="recommend"
                  checked={wouldRecommend}
                  onChange={e => setWouldRecommend(e.target.checked)}
                  className="w-4 h-4 accent-cyan-500"
                />
                <label htmlFor="recommend" className="text-sm text-gray-300">I would recommend Jarvis to other creators</label>
              </div>
            </div>

            <div className="flex gap-3 justify-end px-6 py-4 border-t border-gray-800">
              <button onClick={onClose} className="px-4 py-2 text-sm text-gray-400 border border-gray-700 rounded-lg hover:border-gray-500">
                Skip
              </button>
              <button
                onClick={handleSubmit}
                disabled={rating === 0 || saving}
                className="px-6 py-2 text-sm bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg disabled:opacity-40"
              >
                {saving ? "Submitting..." : "Submit Feedback"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
