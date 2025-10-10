"use client";

import { useSession } from \"next-auth/react\";
import { startTransition, useCallback, useMemo, useOptimistic, useState } from \"react\";
import { saveChatModelAsCookie } from \"@/app/(chat)/actions\";
import { Button } from \"@/components/ui/button\";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from \"@/components/ui/dropdown-menu\";
import { entitlementsByUserType } from \"@/lib/ai/entitlements\";
import { isModelCompatibleWithAttachments } from \"@/lib/ai/file-compatibility\";
import { chatModels } from \"@/lib/ai/models\";
import type { Attachment } from \"@/lib/types\";
import { cn } from \"@/lib/utils\";
import { CheckCircleFillIcon, ChevronDownIcon } from \"./icons\";

/**
 * A dropdown component for selecting chat models based on user entitlements
 * and attachment compatibility. Displays available models filtered by user type
 * and disables models incompatible with current attachments.
 *
 * @param props - Component props
 * @param props.selectedModelId - The currently selected model ID
 * @param props.attachments - Array of attachments to check model compatibility (default: [])
 * @param props.className - Additional CSS classes for the trigger button (optional)
 * @returns JSX.Element - The rendered model selector dropdown
 */
export function ModelSelector({
  selectedModelId,
  className,
  attachments = [],
}: {
  selectedModelId: string;
  attachments?: Attachment[];
} & React.ComponentProps<typeof Button>) {
  const [open, setOpen] = useState(false);
  const [optimisticModelId, setOptimisticModelId] =
    useOptimistic(selectedModelId);

  const { data: session } = useSession();
  const userType = session?.user.type ?? \"free\";
  const { availableChatModelIds } = entitlementsByUserType[userType];

  const availableChatModels = chatModels.filter((chatModel) =>
    availableChatModelIds.includes(chatModel.id)
  );

  const selectedChatModel = useMemo(
    () =>
      availableChatModels.find(
        (chatModel) => chatModel.id === optimisticModelId
      ),
    [optimisticModelId, availableChatModels]
  );

  const handleModelSelect = useCallback(
    (modelId: string) => {
      const isCompatible = isModelCompatibleWithAttachments(modelId, attachments);
      if (!isCompatible) return;

      setOpen(false);

      startTransition(() => {
        setOptimisticModelId(modelId);
        saveChatModelAsCookie(modelId);
      });
    },
    [attachments]
  );

  interface ModelOptionProps {
    chatModel: typeof chatModels[number];
    isDisabled: boolean;
    isSelected: boolean;
  }

  function ModelOption({ chatModel, isDisabled, isSelected }: ModelOptionProps) {
    return (
      <button
        className={cn(
          \"group/item flex w-full flex-row items-center justify-between gap-2 sm:gap-4\",
          isDisabled && \"cursor-not-allowed opacity-50\"
        )}
        disabled={isDisabled}
        type=\"button\"
        data-testid={
          isDisabled
            ? `model-selector-disabled-item-${chatModel.id}`
            : `model-selector-item-${chatModel.id}`
        }
      >
        <div className=\"flex flex-col items-start gap-1\">
          <div className=\"text-sm sm:text-base\">
            {chatModel.name} {chatModel.model}
          </div>
          <div className=\"line-clamp-2 text-muted-foreground text-xs\">
            {isDisabled
              ? \"Not compatible with attached files\"
              : chatModel.description}
          </div>
        </div>

        <div
          className=\"shrink-0 text-foreground opacity-0 group-data-[active=true]/item:opacity-100 dark:text-foreground\"
          data-testid=\"model-selector-check-icon\"
        >
          <CheckCircleFillIcon />
        </div>
      </button>
    );
  }

  return (
    <DropdownMenu onOpenChange={setOpen} open={open}>
      <DropdownMenuTrigger
        asChild
        className={cn(
          \"w-fit rounded-lg data-[state=open]:bg-accent data-[state=open]:text-accent-foreground\",
          className
        )}
        data-testid=\"model-selector-trigger\"
      >
        <Button
          className=\"md:h-[34px] md:px-2\"
          data-testid=\"model-selector\"
          variant=\"outline\"
        >
          <span data-testid=\"selected-model\">
            {selectedChatModel
              ? `${selectedChatModel?.name} ${selectedChatModel?.model}`
              : \"Unavailable\"}
          </span>
          <ChevronDownIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align=\"start\"
        className=\"max-h-[400px] min-w-[280px] max-w-[90vw] overflow-y-auto rounded-xl sm:min-w-[300px]\"
        data-testid=\"model-selector-content\"
      >
        {availableChatModels.map((chatModel) => {
          const { id } = chatModel;
          const isCompatible = isModelCompatibleWithAttachments(id, attachments);
          const isDisabled = !isCompatible;
          const isSelected = id === optimisticModelId;

          return (
            <DropdownMenuItem
              asChild
              data-active={isSelected}
              key={id}
              disabled={isDisabled}
              onSelect={() => handleModelSelect(id)}
            >
              <ModelOption
                chatModel={chatModel}
                isDisabled={isDisabled}
                isSelected={isSelected}
              />
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
