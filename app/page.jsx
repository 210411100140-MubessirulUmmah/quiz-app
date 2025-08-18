"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function HomePage() {
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("🐱");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const avatars = ["🐱", "🐶", "🐼", "🐵", "🐧", "🦊"];

  const handleLogin = async () => {
    if (!name.trim()) return alert("Nama wajib diisi!");
    setLoading(true);

    // simpan ke Supabase
    const { data, error } = await supabase
      .from("players")
      .insert([{ name, avatar }])
      .select()
      .single();

    setLoading(false);

    if (error) {
      console.error(error);
      alert("Gagal login");
      return;
    }

    // simpan player ke localStorage
    localStorage.setItem("player", JSON.stringify(data));

    router.push("/quiz-list");
  };

  return (
    <div className="flex items-center justify-center h-screen relative overflow-hidden">
      {/* Background gradient animasi */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 animate-gradient-x"></div>

      {/* Lapisan blur biar soft */}
      <div className="absolute inset-0 backdrop-blur-sm bg-white/20"></div>

      {/* Card */}
      <div className="relative bg-white/80 backdrop-blur-md p-10 rounded-3xl shadow-2xl w-full sm:w-96 md:w-[500px] lg:w-[600px] text-center border border-white/30">
        <h1 className="text-3xl font-extrabold mb-6 text-gray-900 drop-shadow">
          Masuk ke Quiz 🎮
        </h1>

        {/* Input Nama */}
        <input
          type="text"
          placeholder="Masukkan Nama"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-gray-300 rounded-xl p-3 mb-6 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm text-gray-900 placeholder-gray-500 bg-white/80"
        />

        {/* Pilih Avatar */}
        <div className="flex justify-center gap-3 mb-6">
          {avatars.map((av) => (
            <button
              key={av}
              onClick={() => setAvatar(av)}
              className={`text-3xl p-3 rounded-2xl transition-all transform hover:scale-110 ${
                avatar === av
                  ? "bg-indigo-500 text-white scale-110 shadow-lg"
                  : "bg-white/70 hover:bg-white/90 shadow-sm"
              }`}
            >
              {av}
            </button>
          ))}
        </div>

        {/* Tombol Login */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg w-full">
          {loading ? "Memproses..." : "Login"}
        </button>
      </div>

      {/* Animasi gradient custom */}
      <style jsx>{`
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 6s ease infinite;
        }
        @keyframes gradient-x {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </div>
  );
}
