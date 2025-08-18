// ✅ GamePage.tsx
"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Navbar from "@/components/Navbar";

export default function GamePage() {
  const { quizId } = useParams<{ quizId: string }>();

  // player ambil dari localStorage
  const [player, setPlayer] = useState<any>(null);
  useEffect(() => {
    const saved = localStorage.getItem("player");
    if (saved) setPlayer(JSON.parse(saved));
  }, []);

  const [quizTitle, setQuizTitle] = useState<string>("Quiz");
  const [questions, setQuestions] = useState<any[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);

  const [finalScore, setFinalScore] = useState(0);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // state tambahan
  const [alreadyPlayed, setAlreadyPlayed] = useState(false);
  const [started, setStarted] = useState(false);

  // ambil quiz & pertanyaan
  useEffect(() => {
    if (!quizId) return;

    const loadQuiz = async () => {
      const { data: quizData } = await supabase
        .from("quizzes")
        .select("title")
        .eq("id", quizId)
        .single();

      if (quizData) setQuizTitle(quizData.title);

      const { data } = await supabase
        .from("questions")
        .select("*")
        .eq("quiz_id", quizId)
        .order("order", { ascending: true });

      setQuestions(data || []);
    };

    loadQuiz();
    updateLeaderboard();

    const channel = supabase
      .channel("answers")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "answers" },
        () => updateLeaderboard()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [quizId]);

  // cek apakah player sudah pernah ikut
  useEffect(() => {
    if (!quizId || !player) return;

    const checkAlreadyPlayed = async () => {
      const { data, error } = await supabase
        .from("answers")
        .select("id")
        .eq("quiz_id", quizId)
        .eq("player", player.name)
        .limit(1);

      if (error) console.error(error);

      if (data && data.length > 0) {
        setAlreadyPlayed(true);
        // ❌ jangan setFinished di sini
      }
    };

    checkAlreadyPlayed();
  }, [quizId, player]);

  // timer
  useEffect(() => {
    if (finished || !questions.length || !started) return;

    if (timeLeft === 0) {
      if (current + 1 < questions.length) {
        setCurrent((c) => c + 1);
        setSelected(null);
        setTimeLeft(15);
      } else {
        updateLeaderboard().then(() => setFinished(true));
      }
    }

    const timer = setTimeout(() => {
      if (timeLeft > 0) setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, finished, current, questions, started]);

  useEffect(() => {
    if (finished) updateLeaderboard();
  }, [finished]);

  const updateLeaderboard = async () => {
    const { data } = await supabase
      .from("leaderboard")
      .select("*")
      .eq("quiz_id", quizId)
      .order("total_score", { ascending: false })
      .limit(10);

    setPlayers(data || []);
  };

  const sendAnswer = async (choice: string) => {
    if (!questions[current] || !player) return;

    const correct = choice === questions[current].answer;

    await supabase.from("answers").insert({
      quiz_id: quizId,
      question_id: questions[current].id,
      player: player.name,
      choice,
      correct,
      score: correct ? 10 : 0,
    });

    if (correct) setFinalScore((prev) => prev + 10);

    setSelected(choice);

    setTimeout(async () => {
      if (current + 1 < questions.length) {
        setCurrent(current + 1);
        setSelected(null);
        setTimeLeft(15);
      } else {
        await updateLeaderboard();
        setFinished(true);
      }
    }, 1200);
  };

  // ✅ waiting screen (sebelum mulai quiz)
  if (!started && !finished) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-400 to-indigo-500 text-white p-6">
        <h1 className="text-3xl font-bold mb-4">{quizTitle}</h1>
        <p className="mb-6 text-lg">
          {player?.avatar} {player?.name}
        </p>
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => (window.location.href = "/quiz-list")}
            className="px-4 py-2 rounded-xl bg-purple-800 text-white font-bold hover:bg-purple-900"
          >
            👈 Kembali
          </button>
          <button
          onClick={() => {
            if (alreadyPlayed) {
              setFinished(true);
            } else {
              setStarted(true);
            }
          }}
          className="px-6 py-3 rounded-xl bg-yellow-400 text-purple-900 font-bold hover:bg-yellow-500"
        >
          🚀 Mulai Quiz
        </button>
        </div>
      </div>
    );
  }

  // ✅ UI selesai
  if (finished) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-400 to-indigo-500 text-white p-6">
        <h1 className="text-3xl font-bold mb-2">🎉 Quiz Selesai!</h1>

        {alreadyPlayed ? (
          <p className="mb-2 text-xl">Kamu sudah pernah ikut kuis ini 👌</p>
        ) : (
          <p className="mb-2 text-xl">
            Skor kamu: <span className="font-bold">{finalScore}</span>
          </p>
        )}

        <p className="mb-6">Cek leaderboard untuk hasil akhir.</p>
        <div className="flex gap-4 mb-8">
            <button
            onClick={() => (window.location.href = "/quiz-list")}
            className="px-4 py-2 rounded-xl bg-purple-800 text-white font-bold hover:bg-purple-900"
          >
            👈 Kembali
          </button>
          <button
            onClick={() => setShowLeaderboard(true)}
            className="px-4 py-2 rounded-xl bg-yellow-400 text-purple-900 font-bold hover:bg-yellow-500"
          >
            🏆 Lihat Leaderboard
          </button>
        </div>

        {showLeaderboard && (
          <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-md w-full max-w-md text-gray-900">
            <h2 className="text-lg font-bold mb-2">🏆 Leaderboard</h2>
            <ul>
              {players.map((p, idx) => (
                <li
                  key={idx}
                  className={`flex items-center gap-2 mb-1 p-2 rounded-lg ${
                    idx === 0
                      ? "bg-yellow-100"
                      : idx === 1
                      ? "bg-gray-200"
                      : idx === 2
                      ? "bg-orange-200"
                      : ""
                  }`}
                >
                  <span className="font-medium text-gray-800">{p.player}</span>
                  <span className="ml-auto font-bold text-blue-600">
                    {p.total_score}
                  </span>
                  {idx === 0 && "🥇"}
                  {idx === 1 && "🥈"}
                  {idx === 2 && "🥉"}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  // ✅ UI quiz berjalan
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <Navbar />
      <div className="grid grid-cols-3 h-screen p-6 pt-21 gap-4 bg-gradient-to-br from-purple-400 to-indigo-500">
        <div className="col-span-2 flex flex-col items-center justify-center bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-lg w-full">
          {questions.length > 0 ? (
            <>
              <div className="w-full flex justify-between items-center mb-6 text-gray-700">
                <h2 className="font-bold">{quizTitle}</h2>
                <span>
                  {player?.avatar} {player?.name}
                </span>
                <span>
                  Soal {current + 1} / {questions.length}
                </span>
              </div>

              <div className="w-full flex justify-center mb-4">
                <div className="px-4 py-2 bg-purple-600 text-white rounded-full font-bold">
                  ⏳ {timeLeft}s
                </div>
              </div>

              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-6">
                <div
                  className="h-2 bg-purple-600 transition-all"
                  style={{
                    width: `${((current + 1) / questions.length) * 100}%`,
                  }}
                />
              </div>

              <h1 className="text-2xl font-bold mb-6 text-gray-900 text-center">
                {questions[current].text}
              </h1>

              <div className="grid grid-cols-2 gap-4 w-full">
                {questions[current].options.map((opt: string, i: number) => {
                  const isCorrect = opt === questions[current].answer;
                  const isSelected = selected === opt;

                  return (
                    <button
                      key={i}
                      onClick={() => sendAnswer(opt)}
                      className={`p-4 rounded-xl border font-medium transition-all
                        ${
                          selected
                            ? isCorrect
                              ? "bg-green-500 text-white border-green-600"
                              : isSelected
                              ? "bg-red-500 text-white border-red-600"
                              : "bg-gray-100 text-gray-800"
                            : "bg-gray-100 text-gray-800 hover:bg-blue-100"
                        }`}
                      disabled={!!selected}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <p className="text-gray-700">Menunggu pertanyaan...</p>
          )}
        </div>

        <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-md overflow-y-auto">
          <h2 className="text-lg font-bold mb-2 text-gray-900">🏆 Leaderboard</h2>
          <ul>
            {players.map((p, idx) => (
              <li
                key={idx}
                className={`flex items-center gap-2 mb-1 p-2 rounded-lg ${
                  idx === 0
                    ? "bg-yellow-100"
                    : idx === 1
                    ? "bg-gray-200"
                    : idx === 2
                    ? "bg-orange-200"
                    : ""
                }`}
              >
                <span className="font-medium text-gray-800">{p.player}</span>
                <span className="ml-auto font-bold text-blue-600">
                  {p.total_score}
                </span>
                {idx === 0 && "🥇"}
                {idx === 1 && "🥈"}
                {idx === 2 && "🥉"}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
