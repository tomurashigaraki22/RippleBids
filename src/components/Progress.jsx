const Progress = ({ value = 0, className = "" }) => {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div className={`relative w-full overflow-hidden rounded-full bg-black border border-green-500 ${className}`}>
      <div
        className="h-2 bg-green-500 transition-all duration-300 ease-in-out"
        style={{ width: `${clampedValue}%` }}
      />
    </div>
  );
};

export default Progress;
