import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#111b30] text-white">
      <h1 className="text-6xl font-extrabold text-yellow-400">404</h1>
      <p className="mt-4 text-lg text-gray-400">
        Oops! The page you're looking for doesn't exist.
      </p>
      <Link
        to="/"
        className="mt-6 bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition"
      >
        Go Back Home
      </Link>
    </div>
  );
}
