const Badge = ({ children, variant = "default", className = "" }) => {
  const baseClasses = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium";

  const variants = {
    default: "bg-black text-green-400",
    secondary: "bg-green-900 text-green-400",
    success: "bg-green-700 text-white",
    warning: "bg-yellow-700 text-yellow-100",
    error: "bg-red-700 text-red-100",
  };

  const classes = `${baseClasses} ${variants[variant]} ${className}`;

  return <span className={classes}>{children}</span>;
};

export default Badge;
