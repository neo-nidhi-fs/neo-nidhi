import content from '@/content/content.json';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-4">
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-sm">{content.footer.quote}</p>
        <p className="text-xs text-gray-400 mt-2">
          © {new Date().getFullYear()} {content.app.name}.{' '}
          {content.footer.copyrightLearn}
        </p>
      </div>
    </footer>
  );
}

