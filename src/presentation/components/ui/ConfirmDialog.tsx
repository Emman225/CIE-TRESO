import React from 'react';
import { Modal } from '@/presentation/components/ui/Modal';
import { Button } from '@/presentation/components/ui/Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: 'danger' | 'primary';
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirmer',
  variant = 'primary',
  isLoading = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <div className="flex items-center gap-3 w-full">
          <Button
            variant="outline"
            size="md"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            Annuler
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            size="md"
            onClick={onConfirm}
            isLoading={isLoading}
            icon={variant === 'danger' ? 'warning' : 'check_circle'}
            className="flex-1"
          >
            {confirmLabel}
          </Button>
        </div>
      }
    >
      <div className="flex items-start gap-4 py-2">
        <div
          className={`size-12 rounded-2xl flex items-center justify-center shrink-0 ${
            variant === 'danger'
              ? 'bg-red-100 dark:bg-red-900/30 text-red-600'
              : 'bg-primary/10 text-primary'
          }`}
        >
          <span className="material-symbols-outlined text-2xl">
            {variant === 'danger' ? 'warning' : 'help'}
          </span>
        </div>
        <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 leading-relaxed">
          {message}
        </p>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
