import Image from "next/image";
import type { Attachment } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Loader } from "./elements/loader";
import { CrossSmallIcon } from "./icons";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export const getFileIcon = (contentType: string) => {
  if (contentType.includes("pdf")) {
    return (
      <Image alt="PDF icon" height={25} src="/icons/pdf-icon.svg" width={25} />
    );
  }
  if (contentType.includes("csv")) {
    return (
      <Image alt="CSV icon" height={25} src="/icons/csv-icon.svg" width={25} />
    );
  }
  if (
    contentType.includes("markdown") ||
    contentType.includes("text/plain") ||
    contentType.includes("txt")
  ) {
    return (
      <Image alt="Text icon" height={25} src="/icons/txt-icon.svg" width={25} />
    );
  }
  return (
    <Image alt="File icon" height={25} src="/icons/file-icon.svg" width={25} />
  );
};

const truncateFileName = (name: string, maxLength = 20) => {
  if (name.length <= maxLength) {
    return name;
  }
  const extension = name.split(".").pop() || "";
  const nameWithoutExt = name.substring(0, name.lastIndexOf("."));
  const truncated = `${nameWithoutExt.substring(0, maxLength - extension.length - 4)}`;
  return `${truncated}...`;
};

export const PreviewAttachment = ({
  attachment,
  isUploading = false,
  onRemove,
}: {
  attachment: Attachment;
  isUploading?: boolean;
  onRemove?: () => void;
}) => {
  const { name, url, contentType } = attachment;
  const isImage = contentType?.startsWith("image");

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-lg border bg-muted transition-all",
        isImage ? "size-12" : "flex h-12 w-40 flex-col"
      )}
      data-testid="input-attachment-preview"
    >
      {isImage ? (
        <Image
          alt={name ?? "An image attachment"}
          className="size-full object-cover"
          height={96}
          src={url}
          width={96}
        />
      ) : (
        <div className="flex size-full items-center justify-center gap-2 p-3">
          {getFileIcon(contentType)}
          <div className="w-full truncate text-center font-medium text-sm">
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="truncate">{truncateFileName(name)}</span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{name}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      )}

      {isUploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <Loader size={20} />
        </div>
      )}

      {onRemove && !isUploading && (
        <Button
          className="absolute top-0.5 right-0.5 size-3 rounded-full p-0 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={onRemove}
          size="sm"
          variant={"outline"}
        >
          <CrossSmallIcon size={2} />
        </Button>
      )}
    </div>
  );
};
