import { ValidationError } from "yup";

export const handleValidationError = (error: ValidationError) => {
    const errors = error.inner.map((err) => ({
      message: err.message, // Mensagem de erro
    }));
  
    return ({
      message: 'Erro de validação',
      errors, // Lista de erros detalhados
    });
  };