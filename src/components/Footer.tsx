export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-4">
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-sm">
          🌱 “A penny saved is a penny earned.” — Start small, grow big with
          savings!
        </p>
        <p className="text-xs text-gray-400 mt-2">
          © {new Date().getFullYear()} neoNidhi. Learn banking the fun way.
        </p>
      </div>
    </footer>
  );
}
