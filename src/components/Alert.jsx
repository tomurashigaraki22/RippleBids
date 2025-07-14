const Alert = ({ children, variant = "default", className = "" }) => {
  const baseClasses = "relative w-full rounded-lg border p-4";

  const variants = {
    default: "bg-black border-green-500 text-green-400",
    warning: "bg-yellow-950 border-yellow-600 text-yellow-300",
    error: "bg-red-950 border-red-600 text-red-300",
    success: "bg-green-950 border-green-600 text-green-300",
  };

  const classes = `${baseClasses} ${variants[variant]} ${className}`;

  return <div className={classes}>{children}</div>;
};

const AlertDescription = ({ children, className = "" }) => {
  return <div className={`text-sm text-green-300 ${className}`}>{children}</div>;
};

export { Alert, AlertDescription };
