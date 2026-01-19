import { addToast, ToastProps } from '@heroui/react';

type ToastColor =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger';

export const useToastActions = () => {
  const createToast = (color: ToastColor, params: ToastProps) =>
    addToast({ ...params, color });

  return {
    addDefaultToast: (params: ToastProps) =>
      createToast('default', { ...params }),
    addPrimaryToast: (params: ToastProps) =>
      createToast('primary', { ...params }),
    addSecondaryToast: (params: ToastProps) =>
      createToast('secondary', { ...params }),
    addSuccessToast: (params: ToastProps) =>
      createToast('success', { ...params }),
    addWarningToast: (params: ToastProps) =>
      createToast('warning', { ...params }),
    addErrorToast: (params: ToastProps) => createToast('danger', { ...params }),

    showDefaultToast: (title: string) =>
      createToast('default', { title } as ToastProps),
    showPrimaryToast: (title: string) =>
      createToast('primary', { title } as ToastProps),
    showSecondaryToast: (title: string) =>
      createToast('secondary', { title } as ToastProps),
    showSuccessToast: (title: string) =>
      createToast('success', { title } as ToastProps),
    showWarningToast: (title: string) =>
      createToast('warning', { title } as ToastProps),
    showErrorToast: (title: string) =>
      createToast('danger', { title } as ToastProps),
  };
};
