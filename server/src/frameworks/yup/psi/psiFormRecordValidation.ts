import * as yup from 'yup';
import { AppError } from '../../../utils/AppError';

const answerSchema = yup.object().shape({
  questionId: yup.number().required('ID da pergunta é obrigatório'),
  answerText: yup.string().nullable(),
  answerOption: yup.string().nullable(),
  answerBoolean: yup.boolean().nullable(),
  professionalNote: yup.string().nullable(),
});

const createSchema = yup.object().shape({
  templateId: yup.number().required('Template é obrigatório'),
  patientId: yup.number().nullable(),
  sessionId: yup.number().nullable(),
  notes: yup.string().nullable(),
});

const updateSchema = yup.object().shape({
  notes: yup.string().nullable(),
  status: yup.string()
    .oneOf(['draft', 'completed', 'archived'], 'Status inválido')
    .nullable(),
});

const saveAnswersSchema = yup.object().shape({
  answers: yup.array().of(answerSchema).required('Respostas são obrigatórias'),
});

async function validate(schema: yup.AnySchema, data: any): Promise<void> {
  try {
    await schema.validate(data, { abortEarly: false });
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      const errors = error.inner.map((err) => err.message);
      throw new AppError(errors.join(', '), 400);
    }
    throw error;
  }
}

export const psiFormRecordValidation = {
  async create(data: any): Promise<void> {
    await validate(createSchema, data);
  },

  async update(data: any): Promise<void> {
    await validate(updateSchema, data);
  },

  async saveAnswers(data: any): Promise<void> {
    await validate(saveAnswersSchema, data);
  },
};
