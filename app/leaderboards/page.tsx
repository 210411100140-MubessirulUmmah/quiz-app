"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Navbar from "@/components/Navbar";

export default function LeaderboardsPage() {
  const [leaderboards, setLeaderboards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLeaderboards = async () => {
      setLoading(true);

      // ambil semua quiz
      const { data: quizzes, error: quizError } = await supabase
        .from("quizzes")
        .select("id, title, description, image");

      if (quizError) {
        console.error(quizError);
        setLoading(false);
        return;
      }

      if (!quizzes || quizzes.length === 0) {
        setLeaderboards([]);
        setLoading(false);
        return;
      }

      // ambil leaderboard per quiz
      const allBoards: any[] = [];
      for (const quiz of quizzes) {
        const { data: lb, error: lbError } = await supabase
          .from("leaderboard")
          .select("*")
          .eq("quiz_id", quiz.id)
          .order("total_score", { ascending: false })
          .limit(5); // top 10

        if (lbError) console.error(lbError);

        allBoards.push({
          quiz,
          leaderboard: lb || [],
        });
      }

      setLeaderboards(allBoards);
      setLoading(false);
    };

    loadLeaderboards();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white">
      <Navbar />
      <div className="p-6 pt-20 max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-center">🏆 Global Leaderboards</h1>

        {loading ? (
          <p className="text-center text-lg">⏳ Loading leaderboards...</p>
        ) : leaderboards.length === 0 ? (
          <p className="text-center text-lg">Belum ada quiz yang dimainkan.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {leaderboards.map((lb, idx) => (
              <div
                key={idx}
                className="bg-white/90 text-gray-900 rounded-2xl shadow-lg p-6 backdrop-blur-md"
              >
                <div className="flex items-center gap-4 mb-4">
                  {lb.quiz.image ? (
                    <img
                      src={lb.quiz.image}
                      alt={lb.quiz.title}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-purple-400 flex items-center justify-center text-white font-bold">
                      {lb.quiz.title.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl font-bold">{lb.quiz.title}</h2>
                    <p className="text-sm text-gray-600">{lb.quiz.description}</p>
                  </div>
                </div>

                {lb.leaderboard.length === 0 ? (
                  <p className="text-gray-500">Belum ada pemain</p>
                ) : (
                  <ul>
                    {lb.leaderboard.map((p: any, i: number) => (
                      <li
                        key={i}
                        className={`flex items-center gap-2 mb-2 p-2 rounded-lg ${
                          i === 0
                            ? "bg-yellow-100"
                            : i === 1
                            ? "bg-gray-200"
                            : i === 2
                            ? "bg-orange-200"
                            : "bg-gray-100"
                        }`}
                      >
                        <span className="font-medium">{p.player}</span>
                        <span className="ml-auto font-bold text-blue-600">
                          {p.total_score}
                        </span>
                        {i === 0 && "🥇"}
                        {i === 1 && "🥈"}
                        {i === 2 && "🥉"}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
