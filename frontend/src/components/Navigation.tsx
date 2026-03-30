import { Link } from 'react-router-dom';

const Navigation = () => {
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-green-600">
              🚜 Track-Farm-Ops
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/about" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
              About
            </Link>
            <Link to="/privacy" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
              Privacy
            </Link>
            <Link to="/terms" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
              Terms
            </Link>
            <Link to="/contact" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
              Contact
            </Link>
            <Link to="/login" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
              Login
            </Link>
            <Link to="/signup" className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700">
              Sign Up
            </Link>
          </div>
          <div className="md:hidden flex items-center space-x-2">
            <Link to="/login" className="text-gray-600 hover:text-gray-900 px-2 py-2 rounded-md text-xs font-medium">
              Login
            </Link>
            <Link to="/signup" className="bg-green-600 text-white px-3 py-2 rounded-md text-xs font-medium hover:bg-green-700">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
