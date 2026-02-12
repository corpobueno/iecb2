import * as yup from 'yup';
import { AppError } from '../../../utils/AppError';

const validStatuses = ['Agendado', 'Confirmado', 'Atendido', 'Finalizado', 'Cancelado', 'Ausente'];

const createSchema = yup.object().shape({
  date: yup.string().required('Data é obrigatória'),
  startTime: yup.string().required('Horário de início é obrigatório'),
  endTime: yup.string().nullable(),
  status: yup.string().oneOf(validStatuses, 'Status inválido').nullable(),
  sessionCost: yup.number().min(0, 'Valor não pode ser negativo').nullable(),
  paid: yup.boolean().nullable(),
  patientId: yup.number().required('Paciente é obrigatório').positive('Paciente inválido'),
  professional: yup.string().nullable(),
  description: yup.string().nullable(),
});

const updateSchema = yup.object().shape({
  date: yup.string(),
  startTime: yup.string(),
  endTime: yup.string().nullable(),
  status: yup.string().oneOf(validStatuses, 'Status inválido').nullable(),
  sessionCost: yup.number().min(0, 'Valor não pode ser negativo').nullable(),
  paid: yup.boolean().nullable(),
  patientId: yup.number().positive('Paciente inválido'),
  professional: yup.string().nullable(),
  description: yup.string().nullable(),
});

export const psiSessionValidation = {
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
