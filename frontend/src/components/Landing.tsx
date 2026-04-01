import { Link } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import ParallaxSection from './ParallaxSection';
import Pricing from './Pricing';
import Navigation from './Navigation';

const Landing = () => {
  // Add CSS animation for infinite scroll
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes scroll-x {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
      
      @keyframes starPulse {
        0% { transform: scale(0.2); opacity: 0; }
        50% { transform: scale(3); opacity: 1; }
        100% { transform: scale(1); opacity: 1; }
      }
      
      .animate-scroll-x {
        animation: scroll-x 36s linear infinite;
      }
      
      .animate-scroll-x:hover {
        animation-play-state: paused;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  const [visibleSections, setVisibleSections] = useState(new Set());
  const [visibleHeaders, setVisibleHeaders] = useState(new Set());
  const sectionsRef = useRef<(HTMLElement | null)[]>([]);
  const [buttonVisible, setButtonVisible] = useState<number[]>([]);

  // Typing animation for subtitle
  const [typedText, setTypedText] = useState('');
  const fullText = "A complete farm management system.\nTrack your income, expenses, inventory and assets.\nMonitor day-to-day transactions from anywhere.";

  // Word pop-up animation for title
  const words = ["Farm", "Operations", "Made", "Simple"];
  const [visibleWords, setVisibleWords] = useState(new Set<number>());
  const [animationStarted, setAnimationStarted] = useState(false);
  const [starsVisible, setStarsVisible] = useState(false);

  useEffect(() => {
    // Start animation after 2 seconds delay
    const startDelay = setTimeout(() => {
      setAnimationStarted(true);
    }, 2000);

    return () => {
      clearTimeout(startDelay);
    };
  }, []);

  useEffect(() => {
    if (animationStarted) {
      // Show all words sliding in from right, one by one
      words.forEach((_, index) => {
        setTimeout(() => {
          setVisibleWords(prev => new Set(prev).add(index));
        }, index * 200); // 200ms delay between each word
      });
    }
  }, [animationStarted]);

  // Typing animation starts after all words are visible + animation complete
  useEffect(() => {
    if (visibleWords.size === words.length) {
      // Calculate exact completion time: last word starts at (words.length-1)*200ms + 800ms duration
      const lastWordStartTime = (words.length - 1) * 200;
      const animationCompletionTime = lastWordStartTime + 800;
      
      // Add additional delay before starting subtitle animation
      setTimeout(() => {
        let currentIndex = 0;
        const typingInterval = setInterval(() => {
          if (currentIndex <= fullText.length) {
            setTypedText(fullText.slice(0, currentIndex));
            currentIndex++;
          } else {
            clearInterval(typingInterval);
            // Show star ratings after typing is complete
            setTimeout(() => {
              setStarsVisible(true);
              
              // Animate stars from center to normal size
              setTimeout(() => {
                // Show buttons sequentially
                setTimeout(() => {
                  setButtonVisible(prev => [...prev, 0]); // Show first button
                }, 400);
                setTimeout(() => {
                  setButtonVisible(prev => [...prev, 1]); // Show second button
                }, 500);
              }, 500);
            }, 500);
          }
        }, 40); // Typing speed

        return () => clearInterval(typingInterval);
      }, animationCompletionTime + 600); // Add 600ms delay after hero animation completes
    }
  }, [visibleWords.size, words.length]);

  // Scroll reveal animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.getAttribute('data-section');
            if (sectionId) {
              // Show header first
              setTimeout(() => {
                setVisibleHeaders(prev => new Set(prev).add(sectionId));
              }, 200);
              
              // Show content after header
              setTimeout(() => {
                setVisibleSections(prev => new Set(prev).add(sectionId));
              }, 600);
            }
          }
        });
      },
      {
        threshold: 0.2, // Trigger when 20% of section is visible
        rootMargin: '0px 0px -50px 0px'
      }
    );

    sectionsRef.current.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  const addToRefs = (el: HTMLElement | null) => {
    if (el && !sectionsRef.current.includes(el)) {
      sectionsRef.current.push(el);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <Navigation />

      {/* Hero Section with Video Background */}
      <div className="relative overflow-hidden h-screen flex items-center">
        {/* Video Background - Only in Hero Section */}
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/track-farm-ops-bg.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-24 w-full relative z-10">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-poppins font-bold text-white mb-4 sm:mb-6 relative leading-tight">
              {words.map((word, index) => (
                <span
                  key={index}
                  className={`inline-block mr-1 sm:mr-2 transition-all duration-800 ease-out ${
                    !animationStarted
                      ? 'opacity-0 translate-x-full'
                      : visibleWords.has(index)
                      ? 'opacity-100 translate-x-0'
                      : 'opacity-0 translate-x-full'
                  } ${word === 'Simple' ? 'text-white bg-green-600 px-3 py-1 rounded' : word === 'Operations' ? 'text-green-600' : ''}`}
                  style={{
                    transitionDelay: animationStarted ? `${index * 200}ms` : '0ms'
                  }}
                >
                  {word}
                </span>
              ))}
            </h1>
            <p className="text-sm font-inter text-white mb-8 max-w-3xl mx-auto h-[4.5em] leading-relaxed sm:text-base md:text-lg lg:text-lg xl:text-lg">
              <span className="inline-block whitespace-pre-line">
                {typedText}
              </span>
            </p>
            
            {/* Star Ratings */}
            <div className="flex justify-center items-center mb-8">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4].map((star) => (
                  <svg
                    key={star}
                    className={`w-6 h-6 text-yellow-400 fill-current transition-all duration-500 ease-out ${
                      starsVisible
                        ? 'opacity-100 scale-100'
                        : 'opacity-0 scale-0'
                    }`}
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                      transitionDelay: starsVisible ? `${star * 100}ms` : '0ms',
                      animation: starsVisible ? `starPulse ${0.5 + star * 0.1}s ease-out ${star * 0.1}s` : 'none'
                    }}
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                ))}
                {/* Half full star */}
                <svg
                  className={`w-6 h-6 transition-all duration-500 ease-out ${
                    starsVisible
                      ? 'opacity-100 scale-100'
                      : 'opacity-0 scale-0'
                  }`}
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{
                    transitionDelay: starsVisible ? '500ms' : '0ms',
                    animation: starsVisible ? `starPulse 0.6s ease-out 0.5s` : 'none'
                  }}
                >
                  <defs>
                    <linearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="50%" stopColor="#FBBF24" />
                      <stop offset="50%" stopColor="#6B7280" />
                    </linearGradient>
                  </defs>
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" fill="url(#starGradient)"/>
                </svg>
                <span className={`ml-2 text-sm font-inter text-white transition-all duration-500 ease-out ${
                  starsVisible ? 'opacity-100' : 'opacity-0'
                }`}
                  style={{
                    transitionDelay: starsVisible ? '1200ms' : '0ms'
                  }}
                >
                  4.7 out of 5
                </span>
              </div>
            </div>
            
            {/* User Profiles */}
            <div className="flex justify-center items-center mb-8">
              <div className="flex items-center">
                <div className={`flex -space-x-2 transition-all duration-500 ease-out ${
                  starsVisible ? 'opacity-100' : 'opacity-0'
                }`}
                  style={{
                    transitionDelay: starsVisible ? '1500ms' : '0ms'
                  }}
                >
                  {/* User 1 */}
                  <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-white text-xs font-medium">
                    JD
                  </div>
                  {/* User 2 */}
                  <div className="w-8 h-8 rounded-full bg-green-500 border-2 border-white flex items-center justify-center text-white text-xs font-medium">
                    SM
                  </div>
                  {/* User 3 */}
                  <div className="w-8 h-8 rounded-full bg-purple-500 border-2 border-white flex items-center justify-center text-white text-xs font-medium">
                    AK
                  </div>
                  {/* User 4 */}
                  <div className="w-8 h-8 rounded-full bg-orange-500 border-2 border-white flex items-center justify-center text-white text-xs font-medium">
                    RT
                  </div>
                  {/* User 5 */}
                  <div className="w-8 h-8 rounded-full bg-pink-500 border-2 border-white flex items-center justify-center text-white text-xs font-medium">
                    LW
                  </div>
                  {/* User 6 */}
                  <div className="w-8 h-8 rounded-full bg-indigo-500 border-2 border-white flex items-center justify-center text-white text-xs font-medium">
                    KC
                  </div>
                </div>
                <span className={`ml-3 text-sm font-inter text-white transition-all duration-500 ease-out ${
                  starsVisible ? 'opacity-100' : 'opacity-0'
                }`}
                  style={{
                    transitionDelay: starsVisible ? '1700ms' : '0ms'
                  }}
                >
                  Trusted by farmers nationwide
                </span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => {
                  const imageSection = document.querySelector('.bg-gray-900');
                  if (imageSection) {
                    const startPosition = window.pageYOffset;
                    const targetPosition = imageSection.getBoundingClientRect().top + window.pageYOffset;
                    const distance = targetPosition - startPosition;
                    const duration = 3000; // 3 seconds for super slow scroll
                    let start: number | null = null;
                    
                    function animation(currentTime: number) {
                      if (start === null) start = currentTime;
                      const timeElapsed = currentTime - start;
                      const progress = Math.min(timeElapsed / duration, 1);
                      const ease = 1 - Math.pow(1 - progress, 3); // Cubic ease-out
                      
                      window.scrollTo(0, startPosition + (distance * ease));
                      
                      if (timeElapsed < duration) {
                        requestAnimationFrame(animation);
                      }
                    }
                    
                    requestAnimationFrame(animation);
                  }
                }}
                className={`font-inter bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-green-700 transition-all duration-300 transform shadow-lg hover:shadow-xl hover:scale-105 hover:-translate-y-1 ${
                  buttonVisible.includes(0)
                    ? 'opacity-100 scale-100 translate-y-0'
                    : 'opacity-0 scale-50 translate-y-4'
                }`}
                style={{
                  transitionDelay: buttonVisible.includes(0) ? '1500ms' : '0ms'
                }}
              >
                Learn More
              </button>
              <Link 
                to="/login" 
                className={`font-inter border-2 border-green-600 text-green-600 px-8 py-3 rounded-lg text-lg font-medium hover:bg-green-50 hover:border-green-700 hover:text-green-700 transition-all duration-300 transform shadow-lg hover:shadow-xl hover:scale-105 hover:-translate-y-1 ${
                  buttonVisible.includes(1)
                    ? 'opacity-100 scale-100 translate-y-0'
                    : 'opacity-0 scale-50 translate-y-4'
                }`}
                style={{
                  transitionDelay: buttonVisible.includes(1) ? '1500ms' : '0ms'
                }}
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Parallax Image Section */}
      <div className="bg-gray-900">
        <ParallaxSection />
      </div>

      {/* Features Section */}
      <div 
        id="features-section"
        ref={addToRefs}
        data-section="features"
        className="py-20 bg-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-16 transition-all duration-1000 transform ${
            visibleHeaders.has('features')
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-16'
          }`}>
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-gray-900 mb-4">
              Everything You Need to Manage Your Farm
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className={`text-center p-1 transition-all duration-700 transform ${
              visibleSections.has('features')
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-16'
            }`} style={{
              transitionDelay: visibleSections.has('features') ? '200ms' : '0ms'
            }}>
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-poppins font-semibold text-gray-900 mb-2">Income & Expense Tracking</h3>
              <p className="font-inter text-gray-600">
                Record daily income and expenses with automatic categorization and financial summaries
              </p>
            </div>

            <div className={`text-center p-1 transition-all duration-700 transform ${
              visibleSections.has('features')
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-16'
            }`} style={{
              transitionDelay: visibleSections.has('features') ? '400ms' : '0ms'
            }}>
              <div className="text-4xl mb-4">📦</div>
              <h3 className="text-xl font-poppins font-semibold text-gray-900 mb-2">Inventory Management</h3>
              <p className="font-inter text-gray-600">
                Track livestock, feed, and produce with real-time inventory updates and low stock alerts
              </p>
            </div>

            <div className={`text-center p-1 transition-all duration-700 transform ${
              visibleSections.has('features')
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-16'
            }`} style={{
              transitionDelay: visibleSections.has('features') ? '600ms' : '0ms'
            }}>
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-poppins font-semibold text-gray-900 mb-2">Analytics & Reports</h3>
              <p className="font-inter text-gray-600">
                Comprehensive dashboards and reports to monitor farm performance from anywhere
              </p>
            </div>

            <div className={`text-center p-1 transition-all duration-700 transform ${
              visibleSections.has('features')
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-16'
            }`} style={{
              transitionDelay: visibleSections.has('features') ? '800ms' : '0ms'
            }}>
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-xl font-poppins font-semibold text-gray-900 mb-2">Multi-User Access</h3>
              <p className="font-inter text-gray-600">
                Authentication-based access control for owners, managers, and workers
              </p>
            </div>

            <div className={`text-center p-1 transition-all duration-700 transform ${
              visibleSections.has('features')
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-16'
            }`} style={{
              transitionDelay: visibleSections.has('features') ? '1000ms' : '0ms'
            }}>
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-xl font-poppins font-semibold text-gray-900 mb-2">Mobile Optimized</h3>
              <p className="font-inter text-gray-600">
                Works perfectly on low-end Android phones with poor internet connectivity
              </p>
            </div>

            <div className={`text-center p-1 transition-all duration-700 transform ${
              visibleSections.has('features')
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-16'
            }`} style={{
              transitionDelay: visibleSections.has('features') ? '1200ms' : '0ms'
            }}>
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-poppins font-semibold text-gray-900 mb-2">Secure & Reliable</h3>
              <p className="font-inter text-gray-600">
                Bank-level security with HTTPS and AES-256 encryption for secure data storage and backups
              </p>
            </div>
          </div>
        </div>
        
        {/* Bouncing Arrow with Text */}
        <div className="relative bottom-0">
          <div className="absolute left-1/2 transform -translate-x-1/2 text-center">
            <button
              onClick={() => {
                const howItWorksSection = document.querySelector('[data-section="how-it-works"]');
                if (howItWorksSection) {
                  const startPosition = window.pageYOffset;
                  const targetPosition = howItWorksSection.getBoundingClientRect().top + window.pageYOffset;
                  const distance = targetPosition - startPosition;
                  const duration = 3000; // 3 seconds for super slow scroll
                  let start: number | null = null;
                  
                  function animation(currentTime: number) {
                    if (start === null) start = currentTime;
                    const timeElapsed = currentTime - start;
                    const progress = Math.min(timeElapsed / duration, 1);
                    const ease = 1 - Math.pow(1 - progress, 3); // Cubic ease-out
                    
                    window.scrollTo(0, startPosition + (distance * ease));
                    
                    if (timeElapsed < duration) {
                      requestAnimationFrame(animation);
                    }
                  }
                  
                  requestAnimationFrame(animation);
                }
              }}
              className="group flex flex-col items-center text-green-600 hover:text-green-700 transition-colors duration-300"
            >
              <span className="text-sm font-inter mb-2 opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                How does it work
              </span>
              <div className="animate-bounce">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div 
        ref={addToRefs}
        data-section="how-it-works"
        className="py-20 bg-gray-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-16 transition-all duration-1000 transform ${
            visibleHeaders.has('how-it-works')
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-16'
          }`}>
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Get started with Track Farm Ops in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className={`text-center transition-all duration-700 transform ${
              visibleSections.has('how-it-works')
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-16'
            }`} style={{
              transitionDelay: visibleSections.has('how-it-works') ? '200ms' : '0ms'
            }}>
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-poppins font-bold text-green-600">1</span>
              </div>
              <h3 className="text-xl font-poppins font-semibold text-gray-900 mb-2">Sign Up</h3>
              <p className="text-gray-600">Create your account and set up your farm profile in minutes.</p>
            </div>

            <div className={`text-center transition-all duration-700 transform ${
              visibleSections.has('how-it-works')
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-16'
            }`} style={{
              transitionDelay: visibleSections.has('how-it-works') ? '400ms' : '0ms'
            }}>
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-poppins font-bold text-green-600">2</span>
              </div>
              <h3 className="text-xl font-poppins font-semibold text-gray-900 mb-2">Add Workers</h3>
              <p className="text-gray-600">Add your farm workers and assign roles and responsibilities.</p>
            </div>

            <div className={`text-center transition-all duration-700 transform ${
              visibleSections.has('how-it-works')
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-16'
            }`} style={{
              transitionDelay: visibleSections.has('how-it-works') ? '600ms' : '0ms'
            }}>
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-poppins font-bold text-green-600">3</span>
              </div>
              <h3 className="text-xl font-poppins font-semibold text-gray-900 mb-2">Start Managing</h3>
              <p className="text-gray-600">Begin tracking operations, assets, and optimizing your farm workflow.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <Pricing />

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="mb-4">© 2024 Track Farm Ops. All rights reserved.</p>
            <div className="flex justify-center space-x-6">
              <Link to="/privacy" className="hover:text-green-400 transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-green-400 transition-colors">Terms of Service</Link>
              <Link to="/contact" className="hover:text-green-400 transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
