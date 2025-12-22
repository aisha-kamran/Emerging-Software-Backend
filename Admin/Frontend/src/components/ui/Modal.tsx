import { ReactNode } from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal-content max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
        {children}
      </div>
    </>
  );
};

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  type?: 'danger' | 'warning';
}

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  type = 'danger',
}: ConfirmModalProps) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal-content max-w-sm w-full mx-4 text-center">
        <div className={`
          mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4
          ${type === 'danger' ? 'bg-destructive/20' : 'bg-warning/20'}
        `}>
          <AlertTriangle className={`w-6 h-6 ${type === 'danger' ? 'text-destructive' : 'text-warning'}`} />
        </div>
        
        <h2 className="text-lg font-semibold text-foreground mb-2">{title}</h2>
        <p className="text-muted-foreground text-sm mb-6">{message}</p>
        
        <div className="flex gap-3">
          <button onClick={onClose} className="btn btn-secondary flex-1">
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`btn flex-1 ${type === 'danger' ? 'btn-destructive' : 'bg-warning text-warning-foreground hover:bg-warning/90'}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </>
  );
};
