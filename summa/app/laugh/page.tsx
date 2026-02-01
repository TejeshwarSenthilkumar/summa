import Link from "next/link";

export default function LaughPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen w-full bg-gray-50 p-4 page-transition">
            <div className="mb-12 text-center animate-bounce-slow">
                <p className="text-lg font-medium text-gray-700 bg-white/50 backdrop-blur-sm px-6 py-3 rounded-full shadow-sm border border-white/30 glow-pink">
                    For the best experience, please view in <span className="text-pink-500 font-bold">full screen</span> ✨
                </p>
            </div>

            <div className="relative w-full max-w-[350px] aspect-[9/16] bg-black rounded-[40px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-[8px] border-gray-900">
                <video
                    className="w-full h-full object-cover"
                    controls
                    playsInline
                >
                    <source src="/video-project.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            </div>

            <div className="mt-10 text-center">
                <Link
                    href="/"
                    className="group flex items-center gap-2 text-gray-400 hover:text-gray-600 transition-all duration-300 font-medium"
                >
                    <span className="text-xl transform group-hover:-translate-x-1 transition-transform">←</span>
                    <span className="underline underline-offset-4">Go back to question</span>
                </Link>
            </div>
        </div>
    );
}
