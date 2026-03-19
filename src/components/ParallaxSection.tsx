export default function ParallaxSection() {
  const handleExploreFeatures = () => {
    const featuresSection = document.getElementById('features-section');
    if (featuresSection) {
      const startPosition = window.pageYOffset;
      const targetPosition = featuresSection.getBoundingClientRect().top + window.pageYOffset;
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
  };

  return (
    <div className="relative h-screen overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url("/farm-os.png")',
        }}
      />
      
      {/* Bouncing Arrow with Text */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center">
        <button
          onClick={handleExploreFeatures}
          className="group flex flex-col items-center text-white hover:text-gray-200 transition-colors duration-300"
        >
          <span className="text-sm font-inter mb-2 opacity-80 group-hover:opacity-100 transition-opacity duration-300">
            Explore features
          </span>
          <div className="animate-bounce">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>
        </button>
      </div>
    </div>
  );
}
