"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";

export default function Navbar() {
  const [player, setPlayer] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const avatars = ["🐱", "🐶", "🐼", "🐵", "🐧", "🦊"];

  useEffect(() => {
    const saved = localStorage.getItem("player");
    if (saved) setPlayer(JSON.parse(saved));
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
        setShowAvatarPicker(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("player");
    window.location.href = "/";
  };

  const updateAvatar = (newAvatar: string) => {
    const updated = { ...player, avatar: newAvatar };
    setPlayer(updated);
    localStorage.setItem("player", JSON.stringify(updated));
    setShowAvatarPicker(false);
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-white/70 backdrop-blur-md shadow-md z-50">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo / Judul */}
        <Link href="/" className="text-xl font-bold text-indigo-600">
          🎮 Quiz App
        </Link>

        {/* Menu */}
        <div className="flex items-center gap-4">
          <Link
            href="/quiz-list"
            className="text-gray-700 hover:text-indigo-600 font-medium transition"
          >
            Pilih Quiz
          </Link>
          <Link
            href="/leaderboards"
            className="text-gray-700 hover:text-indigo-600 font-medium transition"
          >
            Leaderboards
          </Link>

          {/* Profil Popup */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-indigo-100 hover:text-indigo-600 font-medium transition">
              <span>{player?.avatar || "👤"}</span>
              <span className="font-medium text-gray-700">
                {player?.name || "Profil"}
              </span>
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-72 bg-gradient-to-br from-white to-indigo-50 rounded-2xl shadow-xl border border-indigo-100 z-50 overflow-hidden">
                <div className="p-5 flex flex-col items-center border-b border-indigo-100">
                  {/* Avatar bisa di-klik */}
                  <button
                    onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                    className="w-20 h-20 rounded-full bg-white shadow-md flex items-center justify-center text-4xl hover:scale-110 transition"
                  >
                    {player?.avatar || "👤"}
                  </button>
                  <p className="mt-3 font-bold text-gray-800 text-lg">{player?.name}</p>
                  <p className="text-sm text-gray-500">🎮 Player</p>
                </div>

                {/* Pilihan avatar */}
                {showAvatarPicker && (
                  <div className="p-4 grid grid-cols-6 gap-3 border-b border-indigo-100 bg-white">
                    {avatars.map((av) => (
                      <button
                        key={av}
                        onClick={() => updateAvatar(av)}
                        className={`w-12 h-12 flex items-center justify-center text-2xl rounded-full hover:bg-indigo-100 transition ${
                          player?.avatar === av ? "bg-indigo-200 ring-2 ring-indigo-400" : ""
                        }`}
                      >
                        {av}
                      </button>

                    ))}
                  </div>
                )}

                <div className="p-3 flex flex-col gap-2">
                  <button
                    onClick={() => setShowAvatarPicker(true)}
                    className="w-full text-left px-4 py-2 rounded-lg hover:bg-indigo-100 text-indigo-600 font-medium"
                  >
                    ✨ Ubah Avatar
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 rounded-lg hover:bg-red-100 text-red-600 font-bold"
                  >
                    🚪 Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
