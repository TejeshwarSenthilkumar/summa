import Image from "next/image";
import Link from "next/link";

export default function YesPage() {
    return (
        <div className="text-center page-transition max-w-md w-full">
            <div className="mb-8 flex justify-center">
                <Image
                    src="/kuromi-yes.png"
                    alt="Kuromi giving a thumbs up"
                    width={250}
                    height={250}
                    className="rounded-3xl"
                    priority
                />
            </div>

            <h1 className="text-3xl font-medium text-gray-700 mb-6 text-glow-blue">
                That’s good to hear.
            </h1>

            <p className="text-xl text-gray-600 mb-10 leading-relaxed opacity-90">
                Keep going. You’re doing great. We’re with you.
            </p>

            <div className="mb-6">
                <Link
                    href="/funny"
                    className="inline-block px-6 py-3 bg-blue-100 hover:bg-blue-200 text-blue-600 font-medium rounded-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-sm"
                >
                    wanna see a funny fight?
                </Link>
            </div>

            <Link
                href="/"
                className="text-gray-400 hover:text-gray-600 transition-colors duration-300 underline underline-offset-4"
            >
                Go back
            </Link>
        </div>
    );
}
