interface OnboardingStepIndicatorProps {
  total: number;
  current: number;
  onSelect?: (index: number) => void;
}

export function OnboardingStepIndicator({ total, current, onSelect }: OnboardingStepIndicatorProps) {
  return (
    <div className="flex justify-center gap-2">
      {Array.from({ length: total }).map((_, index) => (
        <button
          key={index}
          onClick={() => onSelect?.(index)}
          className={`h-2 rounded-full transition-all duration-300 ${
            index === current ? "w-8 bg-[#C9A24A]" : "w-2 bg-white/30 hover:bg-white/50"
          }`}
          aria-label={`Ke slide ${index + 1}`}
        />
      ))}
    </div>
  );
}
