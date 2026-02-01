import Link from "next/link";

export default function Home() {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-cover bg-center page-transition"
      style={{ backgroundImage: "url('/background.png')" }}
    >
      {/* Overlay to ensure text readability */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />

      <div className="relative z-10 text-center max-w-md w-full p-6">
        <h1 className="text-3xl md:text-5xl font-semibold text-white mb-12 drop-shadow-lg">
          Hey, how are you feeling today?
        </h1>

        <div className="flex flex-col gap-6 sm:flex-row sm:justify-center">
          <Link
            href="/yes"
            className="px-10 py-5 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border border-white/30 rounded-2xl shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 text-xl font-medium"
          >
            Yes, I’m okay
          </Link>
          <Link
            href="/no"
            className="px-10 py-5 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 rounded-2xl shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 text-xl font-medium"
          >
            No, not really
          </Link>
        </div>
      </div>
    </div>
  );
}
