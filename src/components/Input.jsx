"use client"

const Input = ({ type = "text", placeholder = "", value, onChange, className = "", disabled = false, ...props }) => {
  const baseClasses =
    "flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"

  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`${baseClasses} ${className}`}
      {...props}
    />
  )
}

export default Input
