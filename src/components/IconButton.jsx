export default function IconButton({
  title,
  onClick,
  children,
  variant = "ghost", // "ghost" | "filled"
  size = "md", // "sm" | "md" | "lg"
  className = ""
}) {
  const dims =
    size === "lg" ? "h-12 w-12 text-2xl" :
    size === "sm" ? "h-8 w-8 text-lg"  :
                    "h-10 w-10 text-xl";

  const style =
    variant === "filled"
      ? "bg-[var(--card)] shadow-sm hover:bg-[var(--surface-2)]"
      : "bg-transparent hover:bg-[var(--surface)]";

  return (
    <button
      title={title}
      onClick={onClick}
      className={`${dims} grid place-items-center rounded-xl transition ${style} ${className}`}
    >
      {children}
    </button>
  );
}
