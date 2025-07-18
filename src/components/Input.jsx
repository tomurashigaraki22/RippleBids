const Input = ({
  type = "text",
  placeholder = "",
  value,
  onChange,
  className = "",
  disabled = false,
  ...props
}) => {
  const baseClasses = `
    flex w-full rounded-md border border-green-500 
    bg-black px-3 py-2 text-sm text-white
    placeholder:text-green-400
    focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent
    disabled:cursor-not-allowed disabled:opacity-50
  `;

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
  );
};

export default Input;
