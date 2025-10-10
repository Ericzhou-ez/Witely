"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";

type AttachmentLoaderProps = {
  attachments: Array<{
    name?: string;
    mediaType?: string;
  }>;
  className?: string;
};

export function AttachmentLoader({
  attachments,
  className,
}: AttachmentLoaderProps) {
  if (attachments.length === 0) {
    return null;
  }

  const getAttachmentLabel = () => {
    if (attachments.length === 1) {
      return attachments[0].name || "attachment";
    }
    return `${attachments.length} attachments`;
  };

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex items-center justify-between rounded-lg border border-border/50 bg-muted/10 px-3 py-2 text-muted-foreground text-sm backdrop-blur-sm",
        className
      )}
      initial={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-1.5">
        <div className="flex items-center justify-center rounded bg-background p-1">
          <Image
            alt="File icon"
            height={16}
            src="/icons/folder-icon.svg"
            width={16}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="font-medium">Reading {getAttachmentLabel()}</span>

        <div className="flex gap-1">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            className="size-1 rounded-full bg-current"
            transition={{
              duration: 1,
              repeat: Number.POSITIVE_INFINITY,
              delay: 0,
            }}
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            className="size-1 rounded-full bg-current"
            transition={{
              duration: 1,
              repeat: Number.POSITIVE_INFINITY,
              delay: 0.2,
            }}
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            className="size-1 rounded-full bg-current"
            transition={{
              duration: 1,
              repeat: Number.POSITIVE_INFINITY,
              delay: 0.4,
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}
