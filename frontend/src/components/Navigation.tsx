import { Link } from 'react-router-dom';

const Navigation = () => {
  return (
    <nav className="bg-transparent shadow-sm fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-12">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-green-500 hover:text-green-300 transition-colors">
              🚜 Track-Farm-Ops
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
          <div className="md:hidden flex items-center space-x-2">
            <Link to="/login" className="text-black hover:text-green-300 px-2 py-2 rounded-md text-xs font-medium transition-colors">
              Login
            </Link>
            <Link to="/signup" className="bg-green-600 text-white px-3 py-2 rounded-md text-xs font-medium hover:bg-green-700 transition-all duration-300">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
