"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { toast as sonnerToast } from "sonner";
import { cn } from "@/lib/utils";
import { CheckCircleFillIcon, WarningIcon } from "./icons";

const iconsByType: Record<"success" | "error", ReactNode> = {
  success: <CheckCircleFillIcon />,
  error: <WarningIcon />,
};

/**
 * Displays a custom toast notification using the Sonner library.
 *
 * @param props - The properties for the toast, excluding the id which is generated internally.
 * @returns {void}
 */
export function toast(props: Omit<ToastProps, "id">) {
  return sonnerToast.custom((id) => (
    <Toast description={props.description} id={id} type={props.type} />
  ));
}

/**
 * Renders the individual toast UI component.
 *
 * @param props - The complete properties for this toast instance.
 */
function Toast(props: ToastProps) {
  const { id, type, description } = props;

  const descriptionRef = useRef<HTMLDivElement>(null);
  const [multiLine, setMultiLine] = useState(false);

  useEffect(() => {
    const el = descriptionRef.current;
    if (!el) {
      return;
    }

    const update = () => {
      const lineHeight = Number.parseFloat(getComputedStyle(el).lineHeight);
      const lines = Math.round(el.scrollHeight / lineHeight);
      setMultiLine(lines > 1);
    };

    update(); // initial check
    const ro = new ResizeObserver(update); // re-check on width changes
    ro.observe(el);

    return () => ro.disconnect();
  }, []);

  return (
    <div className="flex toast-mobile:w-[356px] w-full justify-center">
      <div
        className={cn(
          "flex toast-mobile:w-fit w-full flex-row gap-3 rounded-lg bg-white p-3",
          multiLine ? "items-start" : "items-center"
        )}
        data-testid={`toast-${id}`}
        role="alert"
        aria-live="polite"
        key={id}
      >
        <div
          className={cn(
            "data-[type=error]:text-red-600 data-[type=success]:text-green-600",
            { "pt-1": multiLine }
          )}
          data-testid="toast-icon"
          data-type={type}
        >
          {iconsByType[type]}
        </div>
        <div className="text-sm text-zinc-950" ref={descriptionRef} data-testid="toast-description">
          {description}
        </div>
      </div>
    </div>
  );
}
/**
 * Type definition for the props accepted by the Toast component.
 */
type ToastProps = {
  id: string | number;
  type: "success" | "error";
  description: string;
};
