import * as yup from 'yup';
import { AppError } from '../../../utils/AppError';

const questionSchema = yup.object().shape({
  label: yup.string().required('Enunciado é obrigatório'),
  answerType: yup.string()
    .required('Tipo de resposta é obrigatório')
    .oneOf(['text', 'boolean', 'multiple_choice', 'scale', 'number', 'date'], 'Tipo de resposta inválido'),
  options: yup.mixed().nullable(),
  section: yup.string().nullable(),
  displayOrder: yup.number().min(0).nullable(),
  required: yup.boolean().nullable(),
});

const createSchema = yup.object().shape({
  name: yup.string().required('Nome é obrigatório').min(2, 'Nome deve ter no mínimo 2 caracteres'),
  description: yup.string().nullable(),
  type: yup.string()
    .required('Tipo é obrigatório')
    .oneOf(['anamnesis', 'evolution'], 'Tipo inválido'),
  version: yup.string().nullable(),
  questions: yup.array().of(questionSchema).nullable(),
});

const updateSchema = yup.object().shape({
  name: yup.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  description: yup.string().nullable(),
  version: yup.string().nullable(),
  active: yup.boolean().nullable(),
});

const createQuestionSchema = yup.object().shape({
  label: yup.string().required('Enunciado é obrigatório'),
  answerType: yup.string()
    .required('Tipo de resposta é obrigatório')
    .oneOf(['text', 'boolean', 'multiple_choice', 'scale', 'number', 'date'], 'Tipo de resposta inválido'),
  options: yup.mixed().nullable(),
  section: yup.string().nullable(),
  displayOrder: yup.number().min(0).nullable(),
  required: yup.boolean().nullable(),
});

const updateQuestionSchema = yup.object().shape({
  label: yup.string(),
  answerType: yup.string()
    .oneOf(['text', 'boolean', 'multiple_choice', 'scale', 'number', 'date'], 'Tipo de resposta inválido'),
  options: yup.mixed().nullable(),
  section: yup.string().nullable(),
  displayOrder: yup.number().min(0).nullable(),
  required: yup.boolean().nullable(),
  active: yup.boolean().nullable(),
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

export const psiFormTemplateValidation = {
  async create(data: any): Promise<void> {
    await validate(createSchema, data);
  },

  async update(data: any): Promise<void> {
    await validate(updateSchema, data);
  },

  async createQuestion(data: any): Promise<void> {
    await validate(createQuestionSchema, data);
  },

  async updateQuestion(data: any): Promise<void> {
    await validate(updateQuestionSchema, data);
  },
};
