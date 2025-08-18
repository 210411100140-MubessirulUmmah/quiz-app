"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabaseClient";

export default function QuizListPage() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [player, setPlayer] = useState<any>(null);

  useEffect(() => {
    // ambil player dari localStorage
    const saved = localStorage.getItem("player");
    if (saved) setPlayer(JSON.parse(saved));

    // ambil quiz dari Supabase
    const fetchQuizzes = async () => {
      const { data, error } = await supabase.from("quizzes").select("*");
      if (error) {
        console.error(error);
      } else {
        setQuizzes(data || []);
      }
    };
    fetchQuizzes();
  }, []);

  const joinQuiz = (quizId: string) => {
    router.push(`/game/${quizId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      {/* Navbar */}
      <Navbar />

      {/* Konten */}
      <div className="flex items-center justify-center p-6 pt-28">
        <div className="relative bg-white/80 backdrop-blur-md p-10 rounded-3xl shadow-2xl w-full max-w-lg border border-white/30">
          <h1 className="text-3xl font-extrabold mb-4 text-gray-900 drop-shadow text-center">
            Pilih Quiz 🎯
          </h1>

          <p className="mb-6 text-center text-gray-700">
            Halo, <b>{player?.avatar} {player?.name}</b> 👋
          </p>

          {/* List Quiz */}
          <div className="grid gap-4">
            {quizzes.map((quiz) => (
              <div
                key={quiz.id}
                onClick={() => joinQuiz(quiz.id)}
                className="flex items-center gap-4 p-5 bg-white rounded-2xl shadow-md cursor-pointer border border-gray-200 
                           hover:shadow-xl hover:-translate-y-1 active:scale-95 transition-all"
              >
                <div className="w-16 h-16 relative flex-shrink-0">
                  <Image
                    src={quiz.image || "/images/default.png"}
                    alt={quiz.title}
                    fill
                    className="object-contain rounded-lg"
                  />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{quiz.title}</h2>
                  <p className="text-gray-600 text-sm">{quiz.description}</p>
                </div>
              </div>
            ))}

            {quizzes.length === 0 && (
              <p className="text-center text-gray-600">Belum ada quiz 😢</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
