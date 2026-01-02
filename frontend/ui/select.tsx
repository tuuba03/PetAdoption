import * as React from "react";
import { cn } from "../lib/utils";

interface SelectContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

const SelectContext = React.createContext<SelectContextValue | undefined>(undefined);

interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  children: React.ReactNode;
}

const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  ({ value = "", onValueChange, disabled, required, children, ...props }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [selectedValue, setSelectedValue] = React.useState(value);

    React.useEffect(() => {
      setSelectedValue(value);
    }, [value]);

    const handleValueChange = (newValue: string) => {
      setSelectedValue(newValue);
      onValueChange?.(newValue);
      setIsOpen(false);
    };

    return (
      <SelectContext.Provider value={{ value: selectedValue, onValueChange: handleValueChange }}>
        <div ref={ref} className="relative" {...props}>
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child)) {
              return React.cloneElement(child as React.ReactElement<any>, {
                isOpen,
                setIsOpen,
                disabled,
                required,
              });
            }
            return child;
          })}
        </div>
      </SelectContext.Provider>
    );
  }
);
Select.displayName = "Select";

interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
}

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, children, isOpen, setIsOpen, disabled, ...props }, ref) => {
    return (
      <button
        type="button"
        ref={ref}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        onClick={() => setIsOpen?.(!isOpen)}
        disabled={disabled}
        {...props}
      >
        {children}
        <svg
          className="h-4 w-4 opacity-50"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
    );
  }
);
SelectTrigger.displayName = "SelectTrigger";

const SelectValue = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & { placeholder?: string }
>(({ className, children, placeholder, ...props }, ref) => {
  const context = React.useContext(SelectContext);
  const displayValue = context?.value || children || placeholder;

  return (
    <span ref={ref} className={cn("block truncate", className)} {...props}>
      {displayValue || placeholder}
    </span>
  );
});
SelectValue.displayName = "SelectValue";

interface SelectContentProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
}

const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
  ({ className, children, isOpen, setIsOpen, ...props }, ref) => {
    if (!isOpen) return null;

    return (
      <>
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen?.(false)}
        />
        <div
          ref={ref}
          className={cn(
            "absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white p-1 shadow-lg",
            className
          )}
          {...props}
        >
          {children}
        </div>
      </>
    );
  }
);
SelectContent.displayName = "SelectContent";

interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ className, children, value, ...props }, ref) => {
    const context = React.useContext(SelectContext);

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
          context?.value === value && "bg-blue-50 text-blue-600",
          className
        )}
        onClick={() => context?.onValueChange(value)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
SelectItem.displayName = "SelectItem";

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };

