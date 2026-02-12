import * as yup from 'yup';
import { AppError } from '../../../utils/AppError';

const createSchema = yup.object().shape({
  name: yup.string().required('Nome é obrigatório').min(2, 'Nome deve ter no mínimo 2 caracteres'),
  cpf: yup.string().nullable(),
  address: yup.string().nullable(),
  phone: yup.string().nullable(),
  email: yup.string().email('Email inválido').nullable(),
  gender: yup.string().oneOf(['Masculino', 'Feminino', 'Outro'], 'Gênero inválido').nullable(),
  birth: yup.string().nullable(),
  sonsQuantity: yup.number().min(0, 'Quantidade de filhos não pode ser negativa').nullable(),
  maritalStatus: yup.string().oneOf(['Solteiro', 'Casado', 'Divorciado', 'Viúvo'], 'Estado civil inválido').nullable(),
  relativeName: yup.string().nullable(),
  relativePhone: yup.string().nullable(),
  profession: yup.string().nullable(),
});

const updateSchema = yup.object().shape({
  name: yup.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  cpf: yup.string().nullable(),
  address: yup.string().nullable(),
  phone: yup.string().nullable(),
  email: yup.string().email('Email inválido').nullable(),
  gender: yup.string().oneOf(['Masculino', 'Feminino', 'Outro'], 'Gênero inválido').nullable(),
  birth: yup.string().nullable(),
  sonsQuantity: yup.number().min(0, 'Quantidade de filhos não pode ser negativa').nullable(),
  maritalStatus: yup.string().oneOf(['Solteiro', 'Casado', 'Divorciado', 'Viúvo'], 'Estado civil inválido').nullable(),
  relativeName: yup.string().nullable(),
  relativePhone: yup.string().nullable(),
  profession: yup.string().nullable(),
});

export const psiPatientValidation = {
  async create(data: any): Promise<void> {
    try {
      await createSchema.validate(data, { abortEarly: false });
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        const errors = error.inner.map((err) => err.message);
        throw new AppError(errors.join(', '), 400);
      }
      throw error;
    }
  },

  async update(data: any): Promise<void> {
    try {
      await updateSchema.validate(data, { abortEarly: false });
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        const errors = error.inner.map((err) => err.message);
        throw new AppError(errors.join(', '), 400);
      }
      throw error;
    }
  },
};
