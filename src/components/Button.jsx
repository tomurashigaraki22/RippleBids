const Button = ({
  children,
  onClick,
  disabled = false,
  variant = "default",
  size = "default",
  className = "",
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

  const variants = {
    default: "bg-black text-green-400 hover:bg-green-900 focus:ring-green-600",
    outline: "border border-green-500 text-green-400 bg-transparent hover:bg-green-900 focus:ring-green-600",
    ghost: "text-green-400 hover:bg-green-800 focus:ring-green-600",
    link: "text-green-400 underline underline-offset-4 hover:text-green-300 focus:ring-green-600",
  };

  const sizes = {
    sm: "h-8 px-3 text-sm",
    default: "h-10 px-4 py-2",
    lg: "h-12 px-6 text-lg",
  };

  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;

  return (
    <button className={classes} onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  );
};

export default Button;
