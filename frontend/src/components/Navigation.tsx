import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

const navLinks = [
  { to: '/about', label: 'About' },
  //{ to: '/support', label: 'Support' },
  { to: '/privacy', label: 'Privacy' },
  { to: '/terms', label: 'Terms' },
  { to: '/contact', label: 'Contact' },
];

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[60] transition-all duration-500 ${
        scrolled ? 'bg-transparent' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link
              to="/"
              className={`text-xl font-jetbrains-mono font-bold tracking-tight transition-colors ${
                scrolled ? 'text-green-700 hover:text-green-500' : 'text-white hover:text-green-300'
              }`}
            >
              Track<span className="text-emerald-400">Farm</span>Ops
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`group relative px-3 py-2 text-sm font-medium transition-colors ${
                  scrolled ? 'text-gray-700 hover:text-green-600' : 'text-white/90 hover:text-white'
                }`}
              >
                {link.label}
                <span className="pointer-events-none absolute left-3 right-3 -bottom-0.5 h-0.5 origin-left scale-x-0 rounded-full bg-green-500 transition-transform duration-300 group-hover:scale-x-100" />
              </Link>
            ))}
            <Link
              to="/login"
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                scrolled ? 'text-gray-700 hover:text-green-600' : 'text-white/90 hover:text-white'
              }`}
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="relative overflow-hidden bg-emerald-400 text-emerald-950 px-5 py-2 rounded-full text-sm font-semibold shadow-lg shadow-emerald-950/30 hover:bg-emerald-300 hover:shadow-emerald-950/40 transition-all duration-300 hover:-translate-y-0.5 animate-shimmer"
            >
              Sign Up
            </Link>
          </div>
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`focus:outline-none transition-colors ${
                scrolled ? 'text-green-700 hover:text-green-500' : 'text-white hover:text-green-300'
              }`}
            >
              <svg className="h-6 w-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className={`md:hidden fixed top-16 right-0 h-fit max-h-[60vh] w-[62%] min-w-[180px] bg-white border-l border-gray-200 shadow-2xl rounded-bl-2xl transition-transform duration-300 ease-in-out z-40 ${
        isMenuOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="p-4" onClick={() => setIsMenuOpen(false)}>
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-gray-800 hover:text-green-600 hover:bg-green-50 block px-3 py-2 rounded-lg text-base font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-gray-200 pt-2 mt-2">
              <Link to="/login" className="text-gray-800 hover:text-green-600 hover:bg-green-50 block px-3 py-2 rounded-lg text-base font-medium transition-colors">
                Login
              </Link>
              <Link to="/signup" className="bg-green-600 text-white text-center block px-3 py-2 rounded-lg text-base font-semibold hover:bg-green-700 transition-all duration-300 mt-1">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile menu overlay */}
      {isMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-transparent z-30"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </nav>
  );
};

export default Navigation;
