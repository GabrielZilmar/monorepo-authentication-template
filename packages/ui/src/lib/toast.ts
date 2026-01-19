import { addToast, ToastProps } from '@heroui/react';

type ToastColor =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger';

const useToast = () => {
  const createToast = (color: ToastColor) => (params: ToastProps) =>
    addToast({ ...params, color });

  return {
    addDefault: createToast('default'),
    addPrimary: createToast('primary'),
    addSecondary: createToast('secondary'),
    addSuccess: createToast('success'),
    addWarning: createToast('warning'),
    addError: createToast('danger'),
  };
};

export default useToast;
