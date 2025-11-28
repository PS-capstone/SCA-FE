"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog@1.1.6";
import { XIcon } from "lucide-react@0.487.0";

import { cn } from "./utils";

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className,
      )}
      {...props}
    />
  );
}

function DialogContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content>) {
  // children에서 DialogTitle 찾기
  let titleText = 'Dialog';

  // 텍스트 추출 헬퍼 함수 (재귀적) - ReactNode에서 텍스트만 뽑아냄
  const extractText = (node: React.ReactNode): string => {
    if (typeof node === 'string' || typeof node === 'number') return String(node);
    if (!node) return '';
    if (Array.isArray(node)) return node.map(extractText).join('');
    if (React.isValidElement(node)) {
      const element = node as React.ReactElement<{ children?: React.ReactNode }>;
      if (element.props && element.props.children) {
        return extractText(element.props.children);
      }
    }
    return '';
  };

  // DialogTitle 컴포넌트 찾기 헬퍼 함수 (재귀적)
  const findTitle = (node: React.ReactNode): string | null => {
    if (!node) return null;

    if (Array.isArray(node)) {
      for (const child of node) {
        const title = findTitle(child);
        if (title) return title;
      }
      return null;
    }

    if (React.isValidElement(node)) {
      const element = node as React.ReactElement<{ children?: React.ReactNode }>;
      // displayName 체크를 위해 any로 캐스팅 (커스텀 컴포넌트 식별용)
      const type = element.type as any;

      if (type?.displayName === 'DialogTitle') {
        // DialogTitle을 찾았으면 내부 텍스트 추출
        const text = extractText(element.props.children);
        return text || 'Dialog';
      }

      // 자식 요소가 있으면 계속 탐색
      if (element.props && element.props.children) {
        return findTitle(element.props.children);
      }
    }

    return null;
  };

  const foundTitle = findTitle(children);
  if (foundTitle) {
    titleText = foundTitle;
  }

  return (
    <DialogPortal>
      <DialogOverlay />
      <div className="window fixed top-[50%] left-[50%] z-50 translate-x-[-50%] translate-y-[-50%] max-w-[calc(100%-2rem)] sm:max-w-lg" style={{ 
          margin: 0,
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 50,
          backgroundColor: 'white', // 배경색 강제
          display: 'flex',          // 98.css 스타일 보정
          flexDirection: 'column',
          minWidth: '300px'
        }}>
        <div className="title-bar">
          <div className="title-bar-text">{titleText}</div>
          <div className="title-bar-controls">
            <DialogPrimitive.Close asChild>
              <button aria-label="Close"></button>
            </DialogPrimitive.Close>
          </div>
        </div>
        <DialogPrimitive.Content
          data-slot="dialog-content"
          className={cn(
            "window-body bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 gap-4 duration-200 p-6",
            className,
          )}
          style={{ writingMode: 'horizontal-tb', ...props.style }}
          {...props}
        >
          {children}
        </DialogPrimitive.Content>
      </div>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  );
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-lg leading-none font-semibold", className)}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
