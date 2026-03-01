'use client';

// Base dialog component - DRY Principle
// Reusable dialog for various operations

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ReactNode } from 'react';

interface BaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triggerLabel: string;
  triggerIcon?: ReactNode;
  title: string;
  children: ReactNode;
  triggerClassName?: string;
  contentClassName?: string;
}

export function BaseDialog({
  open,
  onOpenChange,
  triggerLabel,
  triggerIcon,
  title,
  children,
  triggerClassName = 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-6',
  contentClassName = 'bg-slate-800 border-slate-700',
}: BaseDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className={triggerClassName}>
          {triggerIcon && <span className="mr-2">{triggerIcon}</span>}
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent
        className={`w-[90vw] sm:w-full max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-lg ${contentClassName}`}
      >
        <DialogHeader>
          <DialogTitle className="text-cyan-400">{title}</DialogTitle>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}

// Message display component
interface MessageProps {
  type: 'error' | 'success' | 'info';
  message: string;
  onDismiss?: () => void;
}

export function Message({ type, message }: MessageProps) {
  if (!message) return null;

  const styles = {
    error: 'bg-red-500/10 border border-red-500/30 text-red-400',
    success: 'bg-green-500/10 border border-green-500/30 text-green-400',
    info: 'bg-blue-500/10 border border-blue-500/30 text-blue-400',
  };

  return <p className={`p-3 rounded-lg text-sm ${styles[type]}`}>{message}</p>;
}

// Loading indicator
interface LoadingProps {
  isLoading: boolean;
  children: ReactNode;
  loadingText?: string;
}

export function ConditionalLoading({
  isLoading,
  children,
  loadingText = 'Loading...',
}: LoadingProps) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-gray-400">{loadingText}</div>
    );
  }

  return <>{children}</>;
}
