import { toast } from 'sonner';

type ToastConfig = {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
};

export function useToast() {
  return {
    toast: (message: string | ToastConfig) => {
      if (typeof message === 'string') {
        toast(message);
      } else {
        toast(message.description || message.title || '', {
          description: message.description,
          className: message.variant === 'destructive' ? 'bg-destructive text-destructive-foreground' : undefined,
        });
      }
    },
    success: (message: string | ToastConfig) => {
      if (typeof message === 'string') {
        toast.success(message);
      } else {
        toast.success(message.description || message.title || '', {
          description: message.description,
        });
      }
    },
    error: (message: string | ToastConfig) => {
      if (typeof message === 'string') {
        toast.error(message);
      } else {
        toast.error(message.description || message.title || '', {
          description: message.description,
        });
      }
    },
    warning: (message: string | ToastConfig) => {
      if (typeof message === 'string') {
        toast.warning(message);
      } else {
        toast.warning(message.description || message.title || '', {
          description: message.description,
        });
      }
    },
    info: (message: string | ToastConfig) => {
      if (typeof message === 'string') {
        toast.info(message);
      } else {
        toast.info(message.description || message.title || '', {
          description: message.description,
        });
      }
    },
  };
} 