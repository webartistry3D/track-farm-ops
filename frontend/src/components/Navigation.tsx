import { Link } from 'react-router-dom';
import { useState } from 'react';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-transparent shadow-sm fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-12">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-white hover:text-green-300 transition-colors">
              🚜 TrackFarmOps
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/about" className="text-green-500 hover:text-green-300 px-3 py-2 rounded-md text-sm font-medium transition-colors">
              About
            </Link>
            <Link to="/privacy" className="text-green-500 hover:text-green-300 px-3 py-2 rounded-md text-sm font-medium transition-colors">
              Privacy
            </Link>
            <Link to="/terms" className="text-green-500 hover:text-green-300 px-3 py-2 rounded-md text-sm font-medium transition-colors">
              Terms
            </Link>
            <Link to="/contact" className="text-green-500 hover:text-green-300 px-3 py-2 rounded-md text-sm font-medium transition-colors">
              Contact
            </Link>
            <Link to="/login" className="text-green-500 hover:text-green-300 px-3 py-2 rounded-md text-sm font-medium transition-colors">
              Login
            </Link>
            <Link to="/signup" className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-all duration-300">
              Sign Up
            </Link>
          </div>
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-green-300 focus:outline-none focus:text-green-300 transition-colors"
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
      <div className={`md:hidden fixed top-12 right-0 h-fit max-h-[45vh] w-[30%] min-w-[150px] bg-white bg-opacity-10 backdrop-blur-md border-l border-white border-opacity-20 transition-transform duration-300 ease-in-out z-40 ${
        isMenuOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="p-4">
          <div className="space-y-1">
            <Link to="/about" className="text-green-500 hover:text-green-300 block px-3 py-2 rounded-md text-base font-medium transition-colors">
              About
            </Link>
            <Link to="/privacy" className="text-green-500 hover:text-green-300 block px-3 py-2 rounded-md text-base font-medium transition-colors">
              Privacy
            </Link>
            <Link to="/terms" className="text-green-500 hover:text-green-300 block px-3 py-2 rounded-md text-base font-medium transition-colors">
              Terms
            </Link>
            <Link to="/contact" className="text-green-500 hover:text-green-300 block px-3 py-2 rounded-md text-base font-medium transition-colors">
              Contact
            </Link>
            <div className="border-t border-gray-200 pt-2 mt-2">
              <Link to="/login" className="text-green-500 hover:text-green-300 block px-3 py-2 rounded-md text-base font-medium transition-colors">
                Login
              </Link>
              <Link to="/signup" className="bg-green-600 text-white block px-3 py-2 rounded-md text-base font-medium hover:bg-green-700 transition-all duration-300 mt-1">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile menu overlay */}
      {isMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </nav>
  );
};

export default Navigation;
