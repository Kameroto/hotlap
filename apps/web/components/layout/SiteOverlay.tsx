"use client";

import {
  useEffect,
  useRef,
  type ReactNode,
  type RefObject,
} from "react";

import {
  cn,
} from "@/lib/utils";

type SiteOverlayProps = {
  id?: string;
  open: boolean;
  onClose: () => void;
  triggerRef: RefObject<HTMLElement | null>;
  labelledBy: string;
  children: ReactNode;
  panelClassName?: string;
};

export default function SiteOverlay({
  id,
  open,
  onClose,
  triggerRef,
  labelledBy,
  children,
  panelClassName,
}: SiteOverlayProps) {
  const dialogRef =
    useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    if (open && !dialog.open) {
      const previousOverflow =
        document.body.style.overflow;

      const trigger =
        triggerRef.current;

      dialog.showModal();
      document.body.style.overflow =
        "hidden";

      return () => {
        document.body.style.overflow =
          previousOverflow;

        if (dialog.open) {
          dialog.close();
        }

        requestAnimationFrame(() => {
          trigger?.focus();
        });
      };
    }
  }, [
    open,
    triggerRef,
  ]);

  return (
    <dialog
      id={id}
      ref={dialogRef}
      aria-labelledby={labelledBy}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClose={() => {
        if (open) {
          onClose();
        }
      }}
      onClick={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
      className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none overflow-hidden border-0 bg-transparent p-0 text-foreground backdrop:bg-black/75 backdrop:backdrop-blur-sm"
    >
      <div
        className="flex h-full justify-end"
        onClick={(event) => {
          if (
            event.target ===
            event.currentTarget
          ) {
            onClose();
          }
        }}
      >
        <div
          className={cn(
            "h-full w-[min(92vw,28rem)] overflow-y-auto overscroll-contain border-l border-white/10 bg-[#0b0e11] shadow-[-24px_0_70px_rgba(0,0,0,0.5)]",
            panelClassName,
          )}
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          {children}
        </div>
      </div>
    </dialog>
  );
}
