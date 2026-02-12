import { useForm, UseFormReturn, FieldValues, UseFormProps } from 'react-hook-form';
import { useCallback, useState, useEffect } from 'react';

interface IUseVFormReturn<TFieldValues extends FieldValues = FieldValues, TContext = any> extends UseFormReturn<TFieldValues, TContext> {
  save: (onSubmit: (data: TFieldValues) => void) => void;
}

export const useVForm = <TFieldValues extends FieldValues = FieldValues, TContext = any>(
  props?: UseFormProps<TFieldValues, TContext>
): IUseVFormReturn<TFieldValues, TContext> => {
  const methods = useForm<TFieldValues, TContext>(props);
  const [onSubmitCallback, setOnSubmitCallback] = useState<((data: TFieldValues) => void) | null>(null);

  // Efeito para submeter o formulário após a mudança de estado
  useEffect(() => {
    if (onSubmitCallback) {
      methods.handleSubmit(onSubmitCallback)();
    }
  }, [onSubmitCallback, methods]);

  const handleSave = useCallback((onSubmit: (data: TFieldValues) => void) => {
    setOnSubmitCallback(() => onSubmit);
  }, []);

  return {
    ...methods,
    save: handleSave,
  };
};
