"use client";

import { useEffect, useState } from "react";
import { Save, Trash2, Video } from "lucide-react";

export default function SiteVideoPage() {
  const [videoUrl, setVideoUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadVideo = async () => {
      try {
        const response = await fetch("/api/site-video", { cache: "no-store" });
        if (!response.ok) throw new Error("Failed to load home video");
        const data = await response.json();
        setVideoUrl(data.videoUrl || "");
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load home video");
      } finally {
        setIsLoading(false);
      }
    };
    loadVideo();
  }, []);

  const saveVideo = async (nextUrl: string) => {
    setIsSaving(true);
    setMessage("");
    setError("");
    try {
      const response = await fetch("/api/site-video", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl: nextUrl }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to save home video");
      setVideoUrl(data.videoUrl || "");
      setMessage(nextUrl ? "Home video saved" : "Home video removed");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save home video");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-10">
      <div className="mx-auto max-w-2xl rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <Video className="h-7 w-7 text-green-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Home Page Video</h1>
            <p className="text-sm text-gray-600">Shown as a movable player at the bottom-left of the home page.</p>
          </div>
        </div>

        <label htmlFor="homeVideoUrl" className="mb-1 block text-sm font-semibold text-gray-700">
          Video URL
        </label>
        <input
          id="homeVideoUrl"
          type="url"
          value={videoUrl}
          onChange={(event) => setVideoUrl(event.target.value)}
          disabled={isLoading || isSaving}
          placeholder="Instagram, YouTube, or direct video link"
          className="w-full rounded border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 disabled:bg-gray-100"
        />

        {message && <p className="mt-3 text-sm font-medium text-green-700">{message}</p>}
        {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => saveVideo(videoUrl.trim())}
            disabled={isLoading || isSaving || !videoUrl.trim()}
            className="inline-flex items-center gap-2 rounded bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save Video"}
          </button>
          <button
            type="button"
            onClick={() => saveVideo("")}
            disabled={isLoading || isSaving || !videoUrl}
            className="inline-flex items-center gap-2 rounded border border-red-300 px-4 py-2 font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            Remove Video
          </button>
        </div>
      </div>
    </div>
  );
}
