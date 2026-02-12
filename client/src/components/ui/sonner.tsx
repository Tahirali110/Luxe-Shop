import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-right"
      offset={90} // 90px offset to clear the sticky navbar
      closeButton={true} // Enable dismiss X button on all toasts
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-card group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:rounded-xl dark:group-[.toaster]:bg-[#1a1a1a]",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          closeButton: "group-[.toast]:bg-background group-[.toast]:border-border group-[.toast]:text-foreground hover:group-[.toast]:bg-secondary",
          success: "group-[.toaster]:border-green-500/30 group-[.toaster]:bg-green-50 dark:group-[.toaster]:bg-[#1a1a1a] dark:group-[.toaster]:border-green-500/50",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
