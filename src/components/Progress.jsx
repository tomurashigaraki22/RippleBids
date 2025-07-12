const Progress = ({ value = 0, className = "" }) => {
  const clampedValue = Math.min(100, Math.max(0, value))

  return (
    <div className={`relative w-full overflow-hidden rounded-full bg-gray-200 ${className}`}>
      <div
        className="h-full bg-blue-600 transition-all duration-300 ease-in-out"
        style={{ width: `${clampedValue}%` }}
      />
    </div>
  )
}

export default Progress
