export function AppFooter(): React.JSX.Element {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="fixed bottom-0 left-0 w-full bg-gray-100 border-t border-gray-300 text-gray-600 text-sm flex justify-between items-center px-4 py-2">
      <div>Streakly v0.1</div>
      <div className="flex gap-4">
        <a href="#" className="hover:text-gray-800 transition">
          GitHub
        </a>
        <a href="#" className="hover:text-gray-800 transition">
          About
        </a>
      </div>
      <div>{currentYear}</div>
    </footer>
  );
}
