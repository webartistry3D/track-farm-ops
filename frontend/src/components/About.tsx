import { Link } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import Navigation from './Navigation';

const About = () => {
  const [visibleSections, setVisibleSections] = useState(new Set());
  const sectionsRef = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set(prev).add(entry.target.id));
          }
        });
      },
      { threshold: 0.1 }
    );

    sectionsRef.current.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => {
      sectionsRef.current.forEach((section) => {
        if (section) observer.unobserve(section);
      });
    };
  }, []);

  const addToRefs = (el: HTMLElement | null) => {
    if (el && !sectionsRef.current.includes(el)) {
      sectionsRef.current.push(el);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-jetbrains-mono font-bold mb-4">
              About TrackFarmOps
            </h1>
            <p className="text-xl font-inter max-w-3xl mx-auto">
              Empowering Nigerian farmers with technology to grow their businesses and feed the nation
            </p>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div 
        id="mission"
        ref={addToRefs}
        className={`py-20 bg-white transition-all duration-1000 transform ${
          visibleSections.has('mission')
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-16'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-jetbrains-mono font-bold text-gray-900 mb-4">
              Our Mission
            </h2>
            <p className="text-lg font-inter text-gray-600 max-w-3xl mx-auto">
              To provide affordable, accessible farm management technology that helps Nigerian farmers 
              increase productivity, reduce waste, and build sustainable businesses.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">🌾</div>
              <h3 className="text-xl font-jetbrains-mono font-semibold text-gray-900 mb-2">
                Local Focus
              </h3>
              <p className="font-inter text-gray-600">
                Built specifically for Nigerian farms, understanding local challenges and opportunities
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">💡</div>
              <h3 className="text-xl font-jetbrains-mono font-semibold text-gray-900 mb-2">
                Simple Technology
              </h3>
              <p className="font-inter text-gray-600">
                Easy-to-use tools that work on basic smartphones, no technical expertise required
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="text-xl font-jetbrains-mono font-semibold text-gray-900 mb-2">
                Real Results
              </h3>
              <p className="font-inter text-gray-600">
                Proven to help farmers increase yields, reduce costs, and improve profitability
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Story Section */}
      <div 
        id="story"
        ref={addToRefs}
        className={`py-20 bg-gray-50 transition-all duration-1000 transform ${
          visibleSections.has('story')
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-16'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-jetbrains-mono font-bold text-gray-900 mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-gray-600 font-inter">
                <p>
                  TrackFarmOps was born from a simple observation: Nigerian farmers work incredibly hard, 
                  but many lack access to modern management tools that could transform their operations.
                </p>
                <p>
                  Founded in 2026, we set out to create a farm management system that would be 
                  affordable, accessible, and specifically designed for the unique challenges of 
                  Nigerian agriculture.
                </p>
                <p>
                  Today, TrackFarmOps is a farm management system that enables farmers track their operations, 
                  manage their finances, and make data-driven decisions that help them grow their businesses.
                </p>
              </div>
            </div>
            <div className="bg-green-100 rounded-2xl p-8 text-center">
              <div className="text-6xl mb-4">🚜</div>
              <h3 className="text-2xl font-jetbrains-mono font-bold text-green-800 mb-2">
                Growing Together
              </h3>
              <p className="font-inter text-green-700">
                Join thousands of Nigerian farmers who are already using TrackFarmOps to build better futures
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div 
        id="values"
        ref={addToRefs}
        className={`py-20 bg-white transition-all duration-1000 transform ${
          visibleSections.has('values')
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-16'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-jetbrains-mono font-bold text-gray-900 mb-4">
              Our Values
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-start space-x-4">
              <div className="text-3xl">🤝</div>
              <div>
                <h3 className="text-xl font-jetbrains-mono font-semibold text-gray-900 mb-2">
                  Partnership
                </h3>
                <p className="font-inter text-gray-600">
                  We work alongside farmers, listening to their needs and building solutions that truly work
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="text-3xl">🎯</div>
              <div>
                <h3 className="text-xl font-jetbrains-mono font-semibold text-gray-900 mb-2">
                  Impact
                </h3>
                <p className="font-inter text-gray-600">
                  Every feature we build is focused on creating real, measurable impact on farm productivity
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="text-3xl">🌍</div>
              <div>
                <h3 className="text-xl font-jetbrains-mono font-semibold text-gray-900 mb-2">
                  Sustainability
                </h3>
                <p className="font-inter text-gray-600">
                  We help farmers build businesses that are profitable today and sustainable for generations
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="text-3xl">📱</div>
              <div>
                <h3 className="text-xl font-jetbrains-mono font-semibold text-gray-900 mb-2">
                  Accessibility
                </h3>
                <p className="font-inter text-gray-600">
                  Technology should be accessible to everyone, regardless of their technical expertise
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-green-600 text-white py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-jetbrains-mono font-bold mb-4">
            Ready to Transform Your Farm?
          </h2>
          <p className="text-xl font-inter mb-8">
            Join hundreds of Nigerian farmers who are already growing their businesses with TrackFarmOps
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/signup"
              className="bg-white text-green-600 px-8 py-3 rounded-lg text-lg font-medium hover:bg-gray-100 transition-colors duration-300"
            >
              Get Started Free
            </Link>
            <Link 
              to="/contact"
              className="border-2 border-white text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-white hover:text-green-600 transition-all duration-300"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
