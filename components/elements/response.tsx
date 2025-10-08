"use client";

import { type ComponentProps, memo } from "react";
import { Streamdown } from "streamdown";
import { cn } from "@/lib/utils";

type ResponseProps = ComponentProps<typeof Streamdown>;

export const Response = memo(
  ({ className, ...props }: ResponseProps) => (
    <Streamdown
      className={cn(
        "size-full text-base leading-loose [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&>ol]:my-3 [&>p]:my-3 [&>ul]:my-3 [&_code]:whitespace-pre-wrap [&_code]:break-words [&_pre]:max-w-full [&_pre]:overflow-x-auto",
        "[&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6",
        "[&_li]:mb-1 [&_li]:ml-0 [&_li]:pl-1",
        "[&_ol_ol]:pl-6 [&_ul_ul]:list-[circle] [&_ul_ul]:pl-6",
        "[&_table]:!bg-transparent [&_table]:border-collapse [&_table]:border-0",
        "[&_thead]:!bg-transparent [&_thead_th]:!bg-transparent [&_thead_th]:border-border/80 [&_thead_th]:border-b [&_thead_th]:px-4 [&_thead_th]:py-2 [&_thead_th]:font-bold",
        "[&_tbody]:!bg-transparent [&_tbody_td]:!bg-transparent [&_tbody_td]:border-border/80 [&_tbody_td]:border-b [&_tbody_td]:px-4 [&_tbody_td]:py-4",
        "[&_tbody_tr:nth-child(2n)]:!bg-transparent [&_tbody_tr]:!bg-transparent [&_tbody_tr:last-child_td]:border-b-0 [&_tbody_tr]:border-0",
        className
      )}
      {...props}
    />
  ),
  (prevProps, nextProps) => prevProps.children === nextProps.children
);

Response.displayName = "Response";
