import React from 'react';
import { FormProvider, UseFormReturn, FieldValues } from 'react-hook-form';

interface IVFormProps<TFieldValues extends FieldValues = FieldValues, TContext = any> extends Omit<React.FormHTMLAttributes<HTMLFormElement>, 'onSubmit'> {
  methods: UseFormReturn<TFieldValues, TContext>;
  onSubmit?: (data: TFieldValues) => void;
  children: React.ReactNode;
}

export const VForm = <TFieldValues extends FieldValues = FieldValues, TContext = any>({ 
  methods, 
  onSubmit, 
  children, 
  ...rest 
}: IVFormProps<TFieldValues, TContext>): React.ReactElement => {
  return (
    <FormProvider {...methods}>
      <form onSubmit={onSubmit ? methods.handleSubmit(onSubmit) : undefined} {...rest}>
        {children}
      </form>
    </FormProvider>
  );
};