import * as React from "react";
import { tv } from "../../utils/tv";
import { useId } from "../../utils/use-id";
import { useCenngeDefaults } from "../../provider";
import type { CenngeRadius } from "../../types";
import { input } from "../input/input.styles";
import {
  checkFile,
  extensionOf,
  formatBytes,
  isSameFile,
  normaliseAccept,
  type FileErrorCode,
  type FileRejection,
} from "./file-validation";
import { useFormField } from "../form/form";

export interface FileUploadMessages {
  /** Dropzone text before the browse word. @default "Drag files here or" */
  prompt: string;
  /** @default "browse" */
  browse: string;
  /** Shown while files are dragged over. @default "Drop to add" */
  dropping: string;
  /** Label of the compact button variant. @default "Choose files" */
  button: string;
  /** Accessible name of the file list. @default "Selected files" */
  fileList: string;
  remove: (fileName: string) => string;
  error: (code: FileErrorCode, file: File) => string;
}

type FileUploadSlots =
  | "base"
  | "label"
  | "dropzone"
  | "icon"
  | "fileList"
  | "file"
  | "removeButton"
  | "description"
  | "errorMessage";

const fileUpload = tv({
  slots: {
    dropzone: [
      "flex w-full cursor-pointer flex-col items-center justify-center gap-2 text-sm text-muted",
      "transition-[border-color,background-color,transform] duration-(--cennge-duration) ease-tactile motion-reduce:transition-none",
      "outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ring",
      "group-data-[dragging]:border-primary group-data-[dragging]:bg-primary-bg group-data-[invalid]:border-danger",
      "disabled:cursor-not-allowed",
    ],
    icon: [
      "flex items-center justify-center text-muted [&_svg]:size-5",
      "transition-colors group-data-[dragging]:text-primary-text",
    ],
    fileList: "m-0 flex list-none flex-col gap-2 p-0",
    file: "flex items-center gap-3 rounded-medium border border-border bg-surface-3 p-2 pr-2.5",
    thumbnail: [
      "flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-small bg-surface-4",
      "text-[10px] font-bold tracking-wide text-muted",
    ],
    removeButton: [
      "flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted",
      "transition-colors hover:bg-default-bg hover:text-foreground",
      "outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ring",
      "disabled:pointer-events-none disabled:opacity-(--cennge-disabled-opacity)",
    ],
    errors: "m-0 flex list-none flex-col gap-0.5 p-0 text-xs text-danger-text",
  },
  variants: {
    variant: {
      dropzone: {
        dropzone: [
          "border-2 border-dashed border-border bg-surface-2 px-6 py-8 text-center",
          "hover:border-default-400 hover:bg-default-bg group-data-[dragging]:scale-[1.01]",
          "disabled:hover:border-border disabled:hover:bg-surface-2",
        ],
        icon: "size-11 rounded-large bg-surface-3 inset-shadow-tactile shadow-raised",
      },
      button: {
        dropzone: [
          "h-10 w-auto flex-row self-start border-2 border-border bg-surface-2 px-4 font-semibold text-foreground",
          "inset-shadow-tactile hover:bg-default-bg active:scale-[0.97]",
        ],
        icon: "text-foreground [&_svg]:size-4",
      },
    },
    radius: {
      none: { dropzone: "rounded-none" },
      sm: { dropzone: "rounded-small" },
      md: { dropzone: "rounded-medium" },
      lg: { dropzone: "rounded-large" },
      full: { dropzone: "rounded-[1.5rem]" },
    },
  },
});

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RemoveIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
    </svg>
  );
}

/* An object URL for an image preview, revoked when the file goes away (no memory leak). */
function useObjectUrl(file: File | null): string | undefined {
  const [url, setUrl] = React.useState<string>();
  React.useEffect(() => {
    if (!file || typeof URL.createObjectURL !== "function") return;
    const next = URL.createObjectURL(file);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [file]);
  return url;
}

interface FileRowProps {
  file: File;
  locale: string;
  removeLabel: string;
  isDisabled: boolean;
  onRemove: (event: React.MouseEvent<HTMLButtonElement>) => void;
  buttonRef: (node: HTMLButtonElement | null) => void;
  slots: ReturnType<typeof fileUpload>;
  className?: string;
  removeButtonClassName?: string;
}

function FileRow({ file, locale, removeLabel, isDisabled, onRemove, buttonRef, slots, className, removeButtonClassName }: FileRowProps) {
  const isImage = file.type.startsWith("image/");
  const preview = useObjectUrl(isImage ? file : null);
  return (
    <li data-slot="file" className={slots.file({ class: className })}>
      <span className={slots.thumbnail()} aria-hidden="true">
        {preview ? <img src={preview} alt="" className="size-full object-cover" /> : extensionOf(file.name)}
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-medium text-foreground" title={file.name}>
          {file.name}
        </span>
        <span className="text-xs text-muted tabular-nums">{formatBytes(file.size, locale)}</span>
      </span>
      <button
        ref={buttonRef}
        type="button"
        aria-label={removeLabel}
        disabled={isDisabled}
        onClick={onRemove}
        className={slots.removeButton({ class: removeButtonClassName })}
      >
        <RemoveIcon />
      </button>
    </li>
  );
}

export interface FileUploadProps {
  label?: React.ReactNode;
  /** Hint such as "PNG or JPG, up to 5 MB". Shown inside the dropzone. */
  description?: React.ReactNode;
  /** Shown while isInvalid. */
  errorMessage?: React.ReactNode;
  value?: File[];
  defaultValue?: File[];
  onValueChange?: (files: File[]) => void;
  /** MIME types, wildcards or extensions, like the native attribute: "image/*,.pdf" or ["image/*", ".pdf"]. */
  accept?: string | string[];
  /** Bytes. */
  maxSize?: number;
  /** Bytes. */
  minSize?: number;
  /** Total files kept. @default unlimited, or 1 when multiple is false */
  maxFiles?: number;
  /** Several files at once. Off: a new file replaces the current one. @default true */
  multiple?: boolean;
  /** Files that were refused, with the reasons. */
  onReject?: (rejections: FileRejection[]) => void;
  /** "dropzone": a large area. "button": compact, still accepts drops. @default "dropzone" */
  variant?: "dropzone" | "button";
  /** @default "lg" */
  radius?: CenngeRadius;
  /** Replaces the upload icon. */
  icon?: React.ReactNode;
  /** @default true */
  showFileList?: boolean;
  /** Form field name: the files are set on a real file input, so a plain form submit sends them. */
  name?: string;
  isDisabled?: boolean;
  isInvalid?: boolean;
  isRequired?: boolean;
  /** Text overrides for translation. */
  messages?: Partial<FileUploadMessages>;
  id?: string;
  className?: string;
  classNames?: Partial<Record<FileUploadSlots, string>>;
}

export function FileUpload({
  label,
  description,
  errorMessage: errorMessageProp,
  value: valueProp,
  defaultValue,
  onValueChange,
  accept,
  maxSize,
  minSize,
  maxFiles,
  multiple = true,
  onReject,
  variant = "dropzone",
  radius = "lg",
  icon,
  showFileList = true,
  name,
  isDisabled = false,
  isInvalid: isInvalidProp = false,
  isRequired = false,
  messages,
  id: idProp,
  className,
  classNames,
}: FileUploadProps) {
  const defaults = useCenngeDefaults();
  const locale = defaults.locale ?? "en-US";
  const id = useId(idProp);
  // Errors from a surrounding <Form>: server ones by name, and the browser's own checks.
  const field = useFormField(name, { isInvalid: isInvalidProp, errorMessage: errorMessageProp });
  const isInvalid = field.isInvalid;
  const errorMessage = field.errorMessage;
  const promptId = id ? `${id}-prompt` : undefined;
  const helperId = id ? `${id}-helper` : undefined;
  const errorsId = id ? `${id}-errors` : undefined;
  const acceptList = React.useMemo(() => normaliseAccept(accept), [Array.isArray(accept) ? accept.join(",") : accept]);
  const limit = multiple ? maxFiles : 1;

  const text: FileUploadMessages = {
    prompt: "Drag files here or",
    browse: "browse",
    dropping: "Drop to add",
    button: multiple ? "Choose files" : "Choose a file",
    fileList: "Selected files",
    remove: (fileName) => `Remove ${fileName}`,
    error: (code, file) => {
      switch (code) {
        case "file-invalid-type":
          return `${file.name}: this file type is not accepted`;
        case "file-too-large":
          return `${file.name} is larger than ${formatBytes(maxSize ?? 0, locale)}`;
        case "file-too-small":
          return `${file.name} is smaller than ${formatBytes(minSize ?? 0, locale)}`;
        case "too-many-files":
          return `${file.name} was not added: ${limit === 1 ? "only one file" : `up to ${limit} files`}`;
      }
    },
    ...messages,
  };

  /* ------------------------------------------------------------- state */
  const isControlled = valueProp !== undefined;
  const [innerFiles, setInnerFiles] = React.useState<File[]>(defaultValue ?? []);
  const files = isControlled ? valueProp : innerFiles;
  const latest = React.useRef(files);
  latest.current = files;
  const [errors, setErrors] = React.useState<string[]>([]);
  const [isDragging, setIsDragging] = React.useState(false);
  const dragDepth = React.useRef(0);
  const [pendingFocus, setPendingFocus] = React.useState<number | "dropzone" | null>(null);

  const inputRef = React.useRef<HTMLInputElement>(null);
  const dropzoneRef = React.useRef<HTMLButtonElement>(null);
  const removeButtons = React.useRef<(HTMLButtonElement | null)[]>([]);

  const commit = (next: File[]) => {
    latest.current = next;
    if (!isControlled) setInnerFiles(next);
    onValueChange?.(next);
    field.markEdited();
  };

  const addFiles = (incoming: File[]) => {
    if (incoming.length === 0) return;
    const base = multiple ? latest.current : [];
    const accepted: File[] = [];
    const rejections: FileRejection[] = [];
    for (const file of incoming) {
      // Picking a file that is already in the list is not an error, just a no-op.
      if ([...base, ...accepted].some((f) => isSameFile(f, file))) continue;
      const reasons = checkFile(file, { accept: acceptList, maxSize, minSize });
      if (reasons.length > 0) {
        rejections.push({ file, errors: reasons });
      } else if (limit !== undefined && base.length + accepted.length >= limit) {
        rejections.push({ file, errors: ["too-many-files"] });
      } else {
        accepted.push(file);
      }
    }
    if (accepted.length > 0) commit([...base, ...accepted]);
    setErrors(rejections.flatMap((r) => r.errors.map((code) => text.error(code, r.file))));
    if (rejections.length > 0) onReject?.(rejections);
  };

  const removeAt = (index: number, focus: number | "dropzone") => {
    commit(latest.current.filter((_, i) => i !== index));
    setErrors([]);
    setPendingFocus(focus);
  };

  React.useEffect(() => {
    if (pendingFocus === null) return;
    const target = pendingFocus === "dropzone" ? dropzoneRef.current : (removeButtons.current[pendingFocus] ?? dropzoneRef.current);
    target?.focus();
    setPendingFocus(null);
  }, [pendingFocus, files]);

  // Keep the real file input in sync so native form submission sends exactly the listed files.
  React.useEffect(() => {
    const node = inputRef.current;
    if (!node || !name || typeof DataTransfer !== "function") return;
    try {
      const transfer = new DataTransfer();
      for (const file of files) transfer.items.add(file);
      node.files = transfer.files;
    } catch {
      // Browsers without a DataTransfer constructor: the files stay available through onValueChange.
    }
  }, [files, name]);

  /* -------------------------------------------------------- drag & drop */
  const carriesFiles = (event: React.DragEvent) => Array.from(event.dataTransfer.types).includes("Files");
  const dragHandlers = {
    onDragEnter: (event: React.DragEvent) => {
      if (isDisabled || !carriesFiles(event)) return;
      event.preventDefault();
      dragDepth.current += 1; // nested elements fire their own enter/leave; count them
      setIsDragging(true);
    },
    onDragOver: (event: React.DragEvent) => {
      if (isDisabled || !carriesFiles(event)) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = "copy";
    },
    onDragLeave: (event: React.DragEvent) => {
      if (isDisabled || !carriesFiles(event)) return;
      dragDepth.current = Math.max(0, dragDepth.current - 1);
      if (dragDepth.current === 0) setIsDragging(false);
    },
    onDrop: (event: React.DragEvent) => {
      if (isDisabled || !carriesFiles(event)) return;
      event.preventDefault();
      dragDepth.current = 0;
      setIsDragging(false);
      addFiles(Array.from(event.dataTransfer.files));
    },
  };

  /* ------------------------------------------------------------ render */
  const fieldSlots = input({ isInvalid });
  const slots = fileUpload({ variant, radius });
  const helper = isInvalid && errorMessage ? errorMessage : variant === "button" ? description : null;
  // With a label, the label names the button and the prompt and hint describe it.
  // Without one, the prompt and hint already form the name, so they are not repeated here.
  const describedBy =
    [
      label ? promptId : null,
      label && variant === "dropzone" && description ? `${id}-hint` : null,
      helper ? helperId : null,
      errors.length ? errorsId : null,
    ]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div
      className={fieldSlots.base({ class: [classNames?.base, className] })}
      data-disabled={isDisabled || undefined}
      data-required={isRequired || undefined}
      data-field-name={name}
      data-invalid={isInvalid || errors.length > 0 || undefined}
      data-dragging={isDragging || undefined}
      {...dragHandlers}
    >
      {label ? (
        <label htmlFor={id} className={fieldSlots.label({ class: classNames?.label })}>
          {label}
        </label>
      ) : null}

      <button
        ref={dropzoneRef}
        id={id}
        type="button"
        disabled={isDisabled}
        aria-describedby={describedBy}
        onClick={() => inputRef.current?.click()}
        className={slots.dropzone({ class: classNames?.dropzone })}
      >
        <span aria-hidden="true" className={slots.icon({ class: classNames?.icon })}>
          {icon ?? <UploadIcon />}
        </span>
        {variant === "button" ? (
          <span id={promptId}>{isDragging ? text.dropping : text.button}</span>
        ) : (
          <>
            <span id={promptId} className="text-foreground">
              {isDragging ? (
                text.dropping
              ) : (
                <>
                  {text.prompt} <span className="font-semibold text-primary-text underline-offset-2 hover:underline">{text.browse}</span>
                </>
              )}
            </span>
            {description ? (
              <span id={`${id}-hint`} className="text-xs text-muted">
                {description}
              </span>
            ) : null}
          </>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        hidden
        tabIndex={-1}
        name={name}
        multiple={multiple}
        accept={acceptList?.join(",")}
        disabled={isDisabled}
        onChange={(event) => {
          addFiles(Array.from(event.target.files ?? []));
          // Without a name nothing reads the input later: reset it so the same file can be picked again.
          if (!name) event.target.value = "";
        }}
      />

      {/* Always mounted, so a new message is announced when it appears. */}
      <div id={errorsId} role="alert">
        {errors.length > 0 ? (
          <ul className={slots.errors()}>
            {errors.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        ) : null}
      </div>

      {helper ? (
        <div
          id={helperId}
          className={
            isInvalid && errorMessage
              ? fieldSlots.errorMessage({ class: classNames?.errorMessage })
              : fieldSlots.description({ class: classNames?.description })
          }
        >
          {helper}
        </div>
      ) : null}

      {showFileList && files.length > 0 ? (
        <ul aria-label={text.fileList} className={slots.fileList({ class: classNames?.fileList })}>
          {files.map((file, index) => (
            <FileRow
              key={`${file.name}-${file.size}-${file.lastModified}`}
              file={file}
              locale={locale}
              removeLabel={text.remove(file.name)}
              isDisabled={isDisabled}
              slots={slots}
              className={classNames?.file}
              removeButtonClassName={classNames?.removeButton}
              buttonRef={(node) => {
                removeButtons.current[index] = node;
              }}
              // Focus the row that takes this one's place, or the dropzone when the list empties.
              onRemove={() => removeAt(index, files.length === 1 ? "dropzone" : Math.min(index, files.length - 2))}
            />
          ))}
        </ul>
      ) : null}
    </div>
  );
}
