export default function AvatarPicker({ avatar, setAvatar }) {
  const avatars = ["🐱","🐶","🐼","🐸","🐵"];
  return (
    <div className="flex gap-2">
      {avatars.map((a) => (
        <button
          key={a}
          className={`text-3xl p-2 rounded ${avatar === a ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          onClick={() => setAvatar(a)}
        >
          {a}
        </button>
      ))}
    </div>
  );
}
