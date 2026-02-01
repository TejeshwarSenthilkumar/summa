import Image from "next/image";
import Link from "next/link";

export default function NoPage() {
    return (
        <div className="text-center page-transition max-w-md w-full">
            <div className="mb-8 flex justify-center">
                <Image
                    src="/kuromi-comfort.png"
                    alt="Kuromi in a gentle, caring pose"
                    width={250}
                    height={250}
                    className="rounded-3xl"
                    priority
                />
            </div>

            <h1 className="text-3xl font-medium text-gray-700 mb-6 text-glow-pink">
                It’s okay to feel this way.
            </h1>

            <p className="text-xl text-gray-600 mb-10 leading-relaxed opacity-90">
                You’re not alone. Take a breath. Things will get better.
            </p>

            <div className="mb-6">
                <Link
                    href="/laugh"
                    className="inline-block px-6 py-3 bg-pink-100 hover:bg-pink-200 text-pink-600 font-medium rounded-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-sm"
                >
                    wanna see smth tht might make u laugh?
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
