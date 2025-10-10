import Image from "next/image";
import type { Attachment } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Loader } from "./elements/loader";
import { CrossSmallIcon } from "./icons";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

/**
 * Returns an appropriate icon component based on the file's content type.
 *
 * @param {string} contentType - The MIME type of the file.
 * @returns {JSX.Element} A React component representing the file icon.
 */
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
    <Image
      alt="File icon"
      height={25}
      src="/icons/folder-icon.svg"
      width={25}
    />
  );
};

/**
 * Truncates a filename to a specified maximum length while preserving the file extension.
 *
 * @param {string} name - The original filename.
 * @param {number} [maxLength=20] - The maximum length for the truncated name.
 * @returns {string} The truncated filename.
 */
const truncateFileName = (name: string, maxLength = 20) => {
  if (name.length <= maxLength) {
    return name;
  }
  const extension = name.split(".").pop() || "";
  const nameWithoutExt = name.substring(0, name.lastIndexOf("."));
  const maxNameLength = maxLength - 3 - (extension ? extension.length + 1 : 0);
  const truncatedName = nameWithoutExt.substring(0, Math.max(0, maxNameLength));
  const truncated = `${truncatedName}${truncatedName.length < nameWithoutExt.length ? "..." : ""}${extension ? `.${extension}` : ""}`;
  return truncated;
};

/**
 * A component that renders a preview of an attachment file, supporting images and other file types with icons.
 * Displays uploading state and provides an option to remove the attachment.
 *
 * @param {Object} props - The component props.
 * @param {Attachment} props.attachment - The attachment to preview.
 * @param {boolean} [props.isUploading=false] - Indicates if the attachment is being uploaded.
 * @param {() => void} [props.onRemove] - Optional callback invoked when the remove button is clicked.
 * @returns {JSX.Element} The rendered attachment preview.
 */
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
          data-testid="attachment-image"
          height={96}
          src={url}
          width={96}
        />
      ) : (
        <div className="flex size-full items-center justify-center gap-2 p-3" data-testid="file-info">
          {getFileIcon(contentType)}
          <div className="w-full truncate text-center font-medium text-sm">
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="truncate" data-testid="attachment-name">{truncateFileName(name)}</span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{name}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      )}

      {isUploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50" data-testid="uploading-overlay">
          <Loader size={20} data-testid="uploading-loader" />
        </div>
      )}

      {onRemove && !isUploading && (
        <Button
          className="absolute top-0.5 right-0.5 size-3 rounded-full p-0 opacity-0 transition-opacity group-hover:opacity-100"
          data-testid="remove-button"
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
