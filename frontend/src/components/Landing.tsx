import { Link } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import Pricing from './Pricing';
import Navigation from './Navigation';

const Landing = () => {
  // Add CSS animation for infinite scroll
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes scroll-x {
        0% { transform: translateX(0); }
        100% { transform: translateX(-100%); }
      }
      
      @keyframes scroll-x-reverse {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(0); }
      }
      
      @keyframes starPulse {
        0% { transform: scale(0.2); opacity: 0; }
        50% { transform: scale(3); opacity: 1; }
        100% { transform: scale(1); opacity: 1; }
      }
      
      .animate-scroll-x {
        animation: scroll-x 25s linear infinite;
      }
      
      .animate-scroll-x-reverse {
        animation: scroll-x-reverse 25s linear infinite;
      }
      
      @keyframes scroll-x-mobile {
        0% { transform: translateX(0); }
        100% { transform: translateX(-100%); }
        100% { transform: translateX(-100%); }
      }
      
      @keyframes scroll-x-reverse-mobile {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(0); }
        100% { transform: translateX(0); }
      }
      
      @media (max-width: 768px) {
        .animate-scroll-x {
          animation: scroll-x-mobile 20s linear infinite;
        }
        
        .animate-scroll-x-reverse {
          animation: scroll-x-reverse-mobile 20s linear infinite;
        }
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
  const fullText = "A complete farm management system.\n Track income, expenses, inventory and assets.\nMonitor day-to-day operations from anywhere.";

  // Word pop-up animation for title
  const words = ["Track", "Farm", "Operations"  ];
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
        }, 20); // Typing speed

        return () => clearInterval(typingInterval);
      }, animationCompletionTime + 2); // Add 600ms delay after hero animation completes
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
          // Removed reset logic - animations continue infinitely
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
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 sm:pt-48 md:pt-56 pb-12 sm:pb-16 md:pb-24 w-full relative z-10">
          <div className="text-center">
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-jetbrains-mono font-bold text-white mb-4 sm:mb-6 relative leading-tight">
              {words.map((word, index) => (
                <span
                  key={index}
                  className={`inline-block mr-4 sm:mr-5 transition-all duration-800 ease-out ${
                    !animationStarted
                      ? 'opacity-0 translate-x-full'
                      : visibleWords.has(index)
                      ? 'opacity-100 translate-x-0'
                      : 'opacity-0 translate-x-full'
                  } ${word === 'Simple' ? 'text-white px-3 py-1 rounded' : word === 'Operations' ? 'text-white' : ''}`}
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
                    className={`w-12 h-12 text-yellow-400 fill-current transition-all duration-500 ease-out ${
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
                  className={`w-12 h-12 transition-all duration-500 ease-out ${
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
                  <img src="/Alex.jpg" alt="John Davis" className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                  {/* User 2 */}
                  <img src="/Sarah.jpg" alt="Sarah Miller" className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                  {/* User 3 */}
                  <img src="/Ngozi.jpg" alt="Ngozi Okafor" className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                  {/* User 4 */}
                  <img src="/Uche.jpg" alt="User" className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                  {/* User 5 */}
                  <img src="/Amina.jpg" alt="User" className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                  {/* User 6 */}
                  <img src="/Emeka.jpg" alt="User" className="w-8 h-8 rounded-full border-2 border-white object-cover" />
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
                  const section = document.getElementById('pain-points-section');
                  if (section) {
                    section.scrollIntoView({ 
                      behavior: 'smooth',
                      block: 'start'
                    });
                  }
                }}
                className={`font-inter bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-green-700 transition-all duration-300 transform shadow-lg hover:shadow-xl hover:scale-105 hover:-translate-y-1 ${
                  buttonVisible.includes(0)
                    ? 'opacity-100 scale-100 translate-y-0'
                    : 'opacity-0 scale-50 translate-y-4'
                }`}
                style={{
                  transitionDelay: buttonVisible.includes(0) ? '1000ms' : '0ms'
                }}
              >
                Learn More
              </button>
              <Link 
                to="/login" 
                className={`font-inter border-2 border-white text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-green-50 hover:border-green-700 hover:text-green-700 transition-all duration-300 transform shadow-lg hover:shadow-xl hover:scale-105 hover:-translate-y-1 ${
                  buttonVisible.includes(1)
                    ? 'opacity-100 scale-100 translate-y-0'
                    : 'opacity-0 scale-50 translate-y-4'
                }`}
                style={{
                  transitionDelay: buttonVisible.includes(1) ? '1200ms' : '0ms'
                }}
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Problems. Solutions. Section */}
      <div
        id="pain-points-section"
        ref={addToRefs}
        data-section="problems-solutions"
        className="py-20 bg-gradient-to-br from-red-50 via-orange-50 to-green-50 relative overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-16 transition-all duration-1000 transform ${
            visibleHeaders.has('problems-solutions')
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-16'
          }`}>
            <h2 className="text-3xl md:text-4xl font-jetbrains-mono font-bold text-gray-900 mb-4">
              Farmers face critical challenges daily
            </h2>
          </div>

          {/* Pain Points - 3 per row */}
          <div className={`max-w-6xl mx-auto transition-all duration-700 transform ${
            visibleSections.has('problems-solutions')
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 -translate-y-16'
          }`} style={{
            transitionDelay: visibleSections.has('problems-solutions') ? '200ms' : '0ms'
          }}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-md border-l-4 border-red-500">
                <h4 className="font-jetbrains-mono font-semibold text-gray-900 mb-2">Poor Financial Visibility</h4>
                <p className="font-inter text-gray-600 text-sm">Farmers cannot answer: How much did we earn? Where is money leaking? Which unit is profitable?</p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-md border-l-4 border-red-500">
                <h4 className="font-jetbrains-mono font-semibold text-gray-900 mb-2">Weak Inventory Control</h4>
                <p className="font-inter text-gray-600 text-sm">Difficulty tracking feed, fertilizers, chemicals, seeds, produce - leading to losses, theft, and wastage.</p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-md border-l-4 border-red-500">
                <h4 className="font-jetbrains-mono font-semibold text-gray-900 mb-2">Poor Asset Management</h4>
                <p className="font-inter text-gray-600 text-sm">Struggle to monitor tractors, irrigation, generators, vehicles, including maintenance and depreciation.</p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-md border-l-4 border-red-500">
                <h4 className="font-jetbrains-mono font-semibold text-gray-900 mb-2">Livestock Health Risks</h4>
                <p className="font-inter text-gray-600 text-sm">No systematic tracking of vaccinations, checkups, or health status leading to disease outbreaks and losses.</p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-md border-l-4 border-red-500">
                <h4 className="font-jetbrains-mono font-semibold text-gray-900 mb-2">Workforce Accountability</h4>
                <p className="font-inter text-gray-600 text-sm">Limited visibility into worker attendance, tasks, completion, and daily field activities.</p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-md border-l-4 border-red-500">
                <h4 className="font-jetbrains-mono font-semibold text-gray-900 mb-2">Fragmented Operations</h4>
                <p className="font-inter text-gray-600 text-sm">Information scattered across WhatsApp, exercise books, Excel sheets, and individual managers.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Solutions Section */}
      <div
        ref={addToRefs}
        data-section="solutions"
        className="py-20 bg-white relative overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-16 transition-all duration-1000 transform ${
            visibleHeaders.has('solutions')
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-16'
          }`}>
            <h2 className="text-3xl md:text-4xl font-jetbrains-mono font-bold text-green-600 mb-4 px-4 py-2 rounded-lg inline-block">
              Solution: TrackFarmOps
            </h2>
          </div>

          {/* Solutions - 3 per row */}
          <div className={`max-w-6xl mx-auto transition-all duration-700 transform ${
            visibleSections.has('solutions')
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-16'
          }`} style={{
            transitionDelay: visibleSections.has('solutions') ? '200ms' : '0ms'
          }}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-md border-l-4 border-green-500">
                <h4 className="font-jetbrains-mono font-semibold text-gray-900 mb-2">Income & Expense Manager</h4>
                <p className="font-inter text-gray-600 text-sm">Track produce sales, livestock sales, expenses, with revenue dashboard, trends, and profit reports.</p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-md border-l-4 border-green-500">
                <h4 className="font-jetbrains-mono font-semibold text-gray-900 mb-2">Asset Manager</h4>
                <p className="font-inter text-gray-600 text-sm">Track tractors, generators, vehicles with asset register, maintenance scheduling, and utilization tracking.</p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-md border-l-4 border-green-500">
                <h4 className="font-jetbrains-mono font-semibold text-gray-900 mb-2">Inventory Manager</h4>
                <p className="font-inter text-gray-600 text-sm">Track seeds, feed, fertilizers, agrochemicals with stock levels, low-stock alerts, and waste tracking.</p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-md border-l-4 border-green-500">
                <h4 className="font-jetbrains-mono font-semibold text-gray-900 mb-2">Livestock Health Manager</h4>
                <p className="font-inter text-gray-600 text-sm">Track health status, vaccinations, checkups, and treatments with veterinarian role access.</p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-md border-l-4 border-green-500">
                <h4 className="font-jetbrains-mono font-semibold text-gray-900 mb-2">Workforce Manager</h4>
                <p className="font-inter text-gray-600 text-sm">Track employees, attendance, payroll, task assignments with worker profiles and performance records.</p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-md border-l-4 border-green-500">
                <h4 className="font-jetbrains-mono font-semibold text-gray-900 mb-2">Analytics & Reporting</h4>
                <p className="font-inter text-gray-600 text-sm">Convert raw farm data into business intelligence: income vs expenses, profitability, and operational efficiency.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Cards Section */}
      {/*<div 
        id="everything-you-need-section"
        ref={addToRefs}
        data-section="everything-you-need"
        className="py-20 bg-gray-100"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-16 transition-all duration-1000 transform ${
            visibleHeaders.has('everything-you-need')
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-16'
          }`}>
            <h2 className="text-3xl md:text-4xl font-jetbrains-mono font-bold text-gray-900 mb-4">
              Everything You Need to Manage Your Farm
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Image Card 1
            <div className={`bg-gray-100 rounded-lg overflow-hidden h-88 transition-all duration-800 ease-in transform ${
              visibleSections.has('everything-you-need')
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 -translate-x-16'
            }`} style={{
              transitionDelay: visibleSections.has('everything-you-need') ? '200ms' : '0ms'
            }}>
              <img 
                src="/laptop-dashboard.png" 
                alt="Laptop showing farm management dashboard"
                className="w-full h-68 object-cover"
              />
              {/*<div className="p-6">
                <h3 className="text-lg font-jetbrains-mono font-semibold text-gray-900 mb-2">
                  Complete Farm Management
                </h3>
                <p className="font-inter text-gray-600">
                  Track everything from crops to livestock in one unified platform
                </p>
              </div>
            </div>

            {/* Image Card 2 *
            <div className={`bg-white/90 rounded-lg overflow-hidden w-2/5 mx-auto transition-all duration-800 ease-in transform ${
              visibleSections.has('everything-you-need')
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 translate-x-16'
            }`} style={{
              transitionDelay: visibleSections.has('everything-you-need') ? '400ms' : '0ms'
            }}>
              <img 
                src="/mobile-app.png" 
                alt="Mobile farm tracking app"
                className="w-full h-66 object-cover"
              />
              {/*<div className="p-6">
                <h3 className="text-lg font-jetbrains-mono font-semibold text-gray-900 mb-2">
                  Real-Time Analytics
                </h3>
                <p className="font-inter text-gray-600">
                  Monitor your farm performance with detailed insights and reports
                </p>
              </div>*
            </div>
          </div>
        </div>
      </div>*/}

      {/* How It Works Section */}
      <div 
        ref={addToRefs}
        data-section="how-it-works"
        className="py-20 bg-gray-50 relative overflow-hidden"
      >
        {/* Parallax Background */}
        <div className="absolute inset-0">
          <div 
            className="w-full h-full bg-cover bg-center bg-fixed"
            style={{
              backgroundImage: 'url("/farm-os2.png")',
              backgroundAttachment: 'fixed',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'cover'
            }}
          >
            {/* Overlay for text readability */}
            <div className="absolute inset-0 bg-white/30 bg-opacity-20"></div>
          </div>
        </div>
        
        {/* Content */}
        <div className="relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`text-center mb-16 transition-all duration-1000 transform ${
              visibleHeaders.has('how-it-works')
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-16'
            }`}>
              <div className={`text-center mb-16 transition-all duration-1000 transform ${
              visibleHeaders.has('how-it-works')
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-16'
            }`}>
              <h2 className="text-3xl md:text-4xl font-jetbrains-mono font-bold text-green-600 mb-4 bg-green-100 px-4 py-2 rounded-lg inline-block">
                How It Works
              </h2>
              {/*<p className="text-lg text-white text-opacity-90 max-w-3xl mx-auto">
                  Get started with Track Farm Ops in three simple steps
                </p>*/}
            </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className={`text-center transition-all duration-700 transform ${
                visibleSections.has('how-it-works')
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-16'
              }`} style={{
                transitionDelay: visibleSections.has('how-it-works') ? '200ms' : '0ms'
              }}>
                <div className="bg-transparent p-6">
                  <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-jetbrains-mono font-bold text-green-600">1</span>
                  </div>
                  <div className="bg-green-100 rounded-lg px-4 py-3 shadow-lg">
                    <h3 className="text-xl font-jetbrains-mono font-semibold text-green-600 mb-2">Sign Up</h3>
                    <p className="text-green-600">Create an account to set up your farm profile in seconds.</p>
                  </div>
                </div>
              </div>

              <div className={`text-center transition-all duration-700 transform ${
                visibleSections.has('how-it-works')
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-16'
              }`} style={{
                transitionDelay: visibleSections.has('how-it-works') ? '400ms' : '0ms'
              }}>
                <div className="bg-transparent p-6">
                  <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-jetbrains-mono font-bold text-green-600">2</span>
                  </div>
                  <div className="bg-green-100 rounded-lg px-4 py-3 shadow-lg">
                    <h3 className="text-xl font-jetbrains-mono font-semibold text-green-600 mb-2">Add Workers</h3>
                    <p className="text-green-600">Add your farm workers and assign roles and responsibilities.</p>
                  </div>
                </div>
              </div>

              <div className={`text-center transition-all duration-700 transform ${
                visibleSections.has('how-it-works')
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-16'
              }`} style={{
                transitionDelay: visibleSections.has('how-it-works') ? '600ms' : '0ms'
              }}>
                <div className="bg-transparent p-6">
                  <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-jetbrains-mono font-bold text-green-600">3</span>
                  </div>
                  <div className="bg-green-100 rounded-lg px-4 py-3 shadow-lg">
                    <h3 className="text-xl font-jetbrains-mono font-semibold text-green-600 mb-2">Start Tracking</h3>
                    <p className="text-green-600">Begin tracking operations, assets, and optimizing your farm workflow.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div 
        id="features-section"
        ref={addToRefs}
        data-section="features"
        className="py-20 bg-gray-50 relative overflow-hidden"
      >
        {/* Parallax Background */}
        <div className="absolute inset-0">
          <div 
            className="w-full h-full bg-cover bg-center bg-fixed"
            style={{
              backgroundImage: 'url("/farm-os2.png")',
              backgroundAttachment: 'fixed',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'cover'
            }}
          >
            {/* Overlay for text readability */}
            <div className="absolute inset-0 bg-white/30 bg-opacity-20"></div>
          </div>
        </div>
        
        {/* Content */}
        <div className="relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`text-center mb-16 transition-all duration-1000 transform ${
              visibleHeaders.has('features')
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-16'
            }`}>
              <h2 className="text-3xl md:text-4xl font-jetbrains-mono font-bold text-green-600 mb-4 bg-green-100 px-4 py-2 rounded-lg inline-block">
                Features
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className={`text-center transition-all duration-700 transform ${
                visibleSections.has('features')
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-16'
              }`} style={{
                transitionDelay: visibleSections.has('features') ? '200ms' : '0ms'
              }}>
                <div className="bg-transparent p-6">
                                    <div className="bg-green-100 rounded-lg px-4 py-3 shadow-lg">
                    <h3 className="text-xl font-jetbrains-mono font-semibold text-green-600 mb-2">Income & Expense Tracker</h3>
                    <p className="text-green-600">Track produce sales, livestock sales, expenses, with revenue dashboard, trends, and profit reports.</p>
                  </div>
                </div>
              </div>

              <div className={`text-center transition-all duration-700 transform ${
                visibleSections.has('features')
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-16'
              }`} style={{
                transitionDelay: visibleSections.has('features') ? '300ms' : '0ms'
              }}>
                <div className="bg-transparent p-6">
                  <div className="bg-green-100 rounded-lg px-4 py-3 shadow-lg">
                    <h3 className="text-xl font-jetbrains-mono font-semibold text-green-600 mb-2">Inventory & Assets Manager</h3>
                    <p className="text-green-600">Track seeds, feed, fertilizers, agrochemicals with stock levels, low-stock alerts, and waste tracking.</p>
                  </div>
                </div>
              </div>

              <div className={`text-center transition-all duration-700 transform ${
                visibleSections.has('features')
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-16'
              }`} style={{
                transitionDelay: visibleSections.has('features') ? '400ms' : '0ms'
              }}>
                <div className="bg-transparent p-6">
                  
                  <div className="bg-green-100 rounded-lg px-4 py-3 shadow-lg">
                    <h3 className="text-xl font-jetbrains-mono font-semibold text-green-600 mb-2">Livestock Health Manager</h3>
                    <p className="text-green-600">Track health status, vaccinations, checkups, and treatments with veterinarian role access.</p>
                  </div>
                </div>
              </div>
              <div className={`text-center transition-all duration-700 transform ${
                visibleSections.has('features')
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-16'
              }`} style={{
                transitionDelay: visibleSections.has('features') ? '500ms' : '0ms'
              }}>
                <div className="bg-transparent p-6">
                  
                  <div className="bg-green-100 rounded-lg px-4 py-3 shadow-lg">
                    <h3 className="text-xl font-jetbrains-mono font-semibold text-green-600 mb-2">Analytics & Reports</h3>
                    <p className="text-green-600">Convert raw farm data into business intelligence: income vs expenses, profitability, and operational efficiency.</p>
                  </div>
                </div>
              </div>

              <div className={`text-center transition-all duration-700 transform ${
                visibleSections.has('features')
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-16'
              }`} style={{
                transitionDelay: visibleSections.has('features') ? '600ms' : '0ms'
              }}>
                <div className="bg-transparent p-6">
                  
                  <div className="bg-green-100 rounded-lg px-4 py-3 shadow-lg">
                    <h3 className="text-xl font-jetbrains-mono font-semibold text-green-600 mb-2">Multi-User Access</h3>
                    <p className="text-green-600">Assign roles and permissions to workers, managers, and owners for secure collaboration.</p>
                  </div>
                </div>
              </div>

              <div className={`text-center transition-all duration-700 transform ${
                visibleSections.has('features')
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-16'
              }`} style={{
                transitionDelay: visibleSections.has('features') ? '700ms' : '0ms'
              }}>
                <div className="bg-transparent p-6">
                  
                  <div className="bg-green-100 rounded-lg px-4 py-3 shadow-lg">
                    <h3 className="text-xl font-jetbrains-mono font-semibold text-green-600 mb-2">Mobile Optimized</h3>
                    <p className="text-green-600">Works perfectly on smartphones and tablets — manage your farm from anywhere in the field.</p>
                  </div>
                </div>
              </div>

              <div className={`text-center transition-all duration-700 transform ${
                visibleSections.has('features')
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-16'
              }`} style={{
                transitionDelay: visibleSections.has('features') ? '800ms' : '0ms'
              }}>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div 
        id="benefits-section"
        ref={addToRefs}
        data-section="benefits"
        className="py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="grid grid-cols-6 gap-4 p-8">
              {[...Array(24)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-green-200 rounded-full animate-pulse"
                  style={{
                    animationDelay: `${i * 0.2}s`,
                    animationDuration: '3s'
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-16 transition-all duration-1000 transform ${
            visibleHeaders.has('benefits')
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-16'
          }`}>
            <h2 className="text-3xl md:text-4xl font-jetbrains-mono font-bold text-gray-900 mb-4">
              Benefits of TrackFarmOps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className={`bg-white rounded-xl shadow-lg p-8 transition-all duration-700 transform hover:scale-105 overflow-y-hidden ${
              visibleSections.has('benefits')
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-16'
            }`} style={{
              transitionDelay: visibleSections.has('benefits') ? '200ms' : '0ms'
            }}>
              <div className="text-green-600 text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-jetbrains-mono font-semibold text-gray-900 mb-4">Increase Profitability</h3>
              <p className="font-inter text-gray-600 leading-relaxed">
                Track expenses and income in real-time to identify cost-saving opportunities. Our analytics help you make data-driven decisions that boost your farm's bottom line by up to 30%.
              </p>
            </div>

            <div className={`bg-white rounded-xl shadow-lg p-8 transition-all duration-700 transform hover:scale-105 overflow-y-hidden ${
              visibleSections.has('benefits')
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-16'
            }`} style={{
              transitionDelay: visibleSections.has('benefits') ? '300ms' : '0ms'
            }}>
              <div className="text-blue-600 text-4xl mb-4">📊</div>
              <h3 className="text-xl font-jetbrains-mono font-semibold text-gray-900 mb-4">Smart Analytics</h3>
              <p className="font-inter text-gray-600 leading-relaxed">
                Get detailed insights into your farm operations with customizable reports and dashboards. Monitor crop performance, livestock health, and financial trends all in one place.
              </p>
            </div>

            <div className={`bg-white rounded-xl shadow-lg p-8 transition-all duration-700 transform hover:scale-105 overflow-y-hidden ${
              visibleSections.has('benefits')
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-16'
            }`} style={{
              transitionDelay: visibleSections.has('benefits') ? '400ms' : '0ms'
            }}>
              <div className="text-purple-600 text-4xl mb-4">📱</div>
              <h3 className="text-xl font-jetbrains-mono font-semibold text-gray-900 mb-4">Mobile First</h3>
              <p className="font-inter text-gray-600 leading-relaxed">
                Manage your farm from anywhere with our mobile-optimized app. Works perfectly on low-end Android phones even with poor internet connectivity.
              </p>
            </div>

            <div className={`bg-white rounded-xl shadow-lg p-8 transition-all duration-700 transform hover:scale-105 overflow-y-hidden ${
              visibleSections.has('benefits')
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-16'
            }`} style={{
              transitionDelay: visibleSections.has('benefits') ? '500ms' : '0ms'
            }}>
              <div className="text-orange-600 text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-jetbrains-mono font-semibold text-gray-900 mb-4">Bank-Level Security</h3>
              <p className="font-inter text-gray-600 leading-relaxed">
                Your farm data is protected with AES-256 encryption and secure backups. We comply with international data protection standards to keep your information safe.
              </p>
            </div>

            <div className={`bg-white rounded-xl shadow-lg p-8 transition-all duration-700 transform hover:scale-105 overflow-y-hidden ${
              visibleSections.has('benefits')
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-16'
            }`} style={{
              transitionDelay: visibleSections.has('benefits') ? '600ms' : '0ms'
            }}>
              <div className="text-red-600 text-4xl mb-4">🌍</div>
              <h3 className="text-xl font-jetbrains-mono font-semibold text-gray-900 mb-4">Local Support</h3>
              <p className="font-inter text-gray-600 leading-relaxed">
                Get dedicated support from our Nigerian team who understand local farming challenges. We're here to help you succeed 24/7 with local expertise.
              </p>
            </div>

            <div className={`bg-white rounded-xl shadow-lg p-8 transition-all duration-700 transform hover:scale-105 overflow-y-hidden ${
              visibleSections.has('benefits')
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-16'
            }`} style={{
              transitionDelay: visibleSections.has('benefits') ? '700ms' : '0ms'
            }}>
              <div className="text-indigo-600 text-4xl mb-4">💰</div>
              <h3 className="text-xl font-jetbrains-mono font-semibold text-gray-900 mb-4">Affordable Pricing</h3>
              <p className="font-inter text-gray-600 leading-relaxed">
                Flexible pricing plans designed for Nigerian farmers. Start with our free tier and scale as your farm grows. No hidden fees or surprises.
              </p>
            </div>

            <div className={`bg-white rounded-xl shadow-lg p-8 transition-all duration-700 transform hover:scale-105 overflow-y-hidden ${
              visibleSections.has('benefits')
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-16'
            }`} style={{
              transitionDelay: visibleSections.has('benefits') ? '800ms' : '0ms'
            }}>
              <div className="text-teal-600 text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-jetbrains-mono font-semibold text-gray-900 mb-4">Easy Onboarding</h3>
              <p className="font-inter text-gray-600 leading-relaxed">
                Get started in minutes with our intuitive interface. No technical knowledge required - just sign up and start managing your farm like a pro.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-20 bg-gradient-to-br from-green-300 via-white to-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-jetbrains-mono font-bold text-gray-900 mb-4">
              What Farmers Are Saying
            </h2>
            {/*<p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Join farmers who trust <strong>TrackFarmOps</strong> to manage their operations
            </p>*/}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="flex items-center mb-4">
                    <img src="/Alex.jpg" alt="John Davis" className="w-12 h-12 rounded-full object-cover mr-4" />
                    <div>
                      <h3 className="font-jetbrains-mono font-semibold text-gray-900">John Davis</h3>
                      <p className="text-sm text-gray-600">Dairy Farm Owner</p>
                    </div>
                  </div>
                  <p className="font-inter text-gray-700 italic">
                    "Track Farm Ops has transformed how we manage our dairy operation. The expense tracking alone has saved us thousands in just a few months."
                  </p>
                  <div className="flex mt-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg key={star} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="flex items-center mb-4">
                    <img src="/Sarah.jpg" alt="Sarah Miller" className="w-12 h-12 rounded-full object-cover mr-4" />
                    <div>
                      <h3 className="font-jetbrains-mono font-semibold text-gray-900">Sarah Miller</h3>
                      <p className="text-sm text-gray-600">Crop Farmer</p>
                    </div>
                  </div>
                  <p className="font-inter text-gray-700 italic">
                    "The inventory management feature is exactly what we needed. We can now track our seed, fertilizer, and equipment in one place."
                  </p>
                  <div className="flex mt-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg key={star} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="flex items-center mb-4">
                    <img src="/Ngozi.jpg" alt="Ngozi Okafor" className="w-12 h-12 rounded-full object-cover mr-4" />
                    <div>
                      <h3 className="font-jetbrains-mono font-semibold text-gray-900">Ngozi Okafor</h3>
                      <p className="text-sm text-gray-600">Mixed Farm Owner</p>
                    </div>
                  </div>
                  <p className="font-inter text-gray-700 italic">
                    "The analytics dashboard gives us insights we never had before. We can make better decisions based on real data."
                  </p>
                  <div className="flex mt-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg key={star} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="flex items-center mb-4">
                    <img src="/Alex.jpg" alt="Alex Kumar" className="w-12 h-12 rounded-full object-cover mr-4" />
                    <div>
                      <h3 className="font-jetbrains-mono font-semibold text-gray-900">Alex Kumar</h3>
                      <p className="text-sm text-gray-600">Poultry Farmer</p>
                    </div>
                  </div>
                  <p className="font-inter text-gray-700 italic">
                    "Managing multiple farm locations was a nightmare. Now I have real-time visibility into all my operations from one dashboard."
                  </p>
                  <div className="flex mt-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg key={star} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                    ))}
                  </div>
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
            <p className="mb-4">© 2026 TrackFarmOps. Built by WebArtistry Creations. All rights reserved.</p>
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
