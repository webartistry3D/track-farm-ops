import { scenes } from './scenes';

interface ProgressRailProps {
  activeScene: number;
  onJump: (sceneIndex: number) => void;
}

const ProgressRail = ({ activeScene, onJump }: ProgressRailProps) => {
  return (
    <div className="fixed left-6 top-1/2 z-[50] hidden -translate-y-1/2 flex-col gap-3 lg:flex">
      {scenes.map((scene, i) => (
        <button
          key={scene.id}
          type="button"
          onClick={() => onJump(i)}
          aria-label={`Go to ${scene.label}`}
          className="group flex items-center gap-2"
        >
          {/* <span
            className={`h-2 w-2 rounded-full transition-all duration-300 ${
              activeScene === i
                ? 'scale-125 bg-emerald-400 shadow-[0_0_8px_2px_rgba(52,211,153,0.5)]'
                : 'bg-white/30 hover:bg-white/60'
            }`}
          /> */}
          {/* <span
            className={`text-xs font-medium transition-all duration-300 ${
              activeScene === i ? 'text-emerald-300 opacity-100' : 'text-white/50 opacity-0 group-hover:opacity-100'
            }`}
          >
            {scene.label}
          </span> */}
        </button>
      ))}
    </div>
  );
};

export default ProgressRail;
