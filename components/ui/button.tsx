import { cn } from "@/lib/utils/cn";
import Link from "next/link";
import type { ButtonHTMLAttributes, ReactElement, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-text-primary text-void hover:bg-text-secondary border border-transparent",
  secondary:
    "bg-surface-elevated text-text-primary hover:bg-surface border border-border",
  ghost: "bg-transparent text-text-primary hover:bg-surface border border-transparent",
  outline:
    "bg-transparent text-text-primary border border-border hover:border-accent-muted hover:text-text-primary",
};

const sizes: Record<Size, string> = {
  sm: "px-4 py-2 text-xs tracking-wide uppercase",
  md: "px-6 py-2.5 text-sm tracking-wide",
  lg: "px-8 py-3.5 text-sm tracking-wide uppercase",
};

type BaseProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
};

type ButtonProps = BaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type LinkButtonProps = BaseProps & {
  href: string;
  external?: boolean;
};

export function Button(props: LinkButtonProps): ReactElement;
export function Button(props: ButtonProps): ReactElement;
export function Button(props: ButtonProps | LinkButtonProps) {
  const {
    variant = "primary",
    size = "md",
    className,
    children,
  } = props;

  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-sm font-medium transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    sizes[size],
    className,
  );

  if ("href" in props && props.href) {
    if (props.external) {
      return (
        <a href={props.href} className={classes} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      );
    }
    return (
      <Link href={props.href} className={classes}>
        {children}
      </Link>
    );
  }

  const buttonProps = props as ButtonProps;
  const {
    variant: _v,
    size: _s,
    className: _c,
    children: _ch,
    ...rest
  } = buttonProps;
  void _v;
  void _s;
  void _c;
  void _ch;
  return (
    <button type="button" className={classes} {...rest}>
      {children}
    </button>
  );
}
