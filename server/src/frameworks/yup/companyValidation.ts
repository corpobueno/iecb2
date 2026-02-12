// src/frameworks/yup/companyValidation.ts
import * as Yup from 'yup';
import { ICompany } from '../../entities/ICompany';

export const createValidation = (body: Omit<ICompany, 'id'>) => {
  const schema = Yup.object().shape({
    name: Yup.string()
      .required('O campo nome é obrigatório')
      .min(3, 'O nome precisa ter no mínimo 3 caracteres')
      .max(32, 'O nome precisa ter no máximo 32 caracteres'),
    photo: Yup.string()
      .nullable()
      .notRequired()
      .max(32, 'O campo photo precisa ter no máximo 32 caracteres'),
    instagram: Yup.string()
      .nullable()
      .notRequired()
      .max(32, 'O campo instagram precisa ter no máximo 32 caracteres'),
    phone: Yup.string()
      .nullable()
      .notRequired()
      .max(13, 'O campo phone precisa ter no máximo 13 caracteres')
      .test('phone', 'Telefone inválido', (value) =>
        !value || /^\d{10,13}$/.test(value.replace(/\D/g, ''))),
    email: Yup.string()
      .nullable()
      .notRequired()
      .email('E-mail inválido')
      .max(100, 'O e-mail precisa ter no máximo 100 caracteres'),
    cnpj: Yup.string()
      .nullable()
      .notRequired()
      .max(20, 'O CNPJ precisa ter no máximo 20 caracteres')
      .test('cnpj', 'CNPJ inválido (deve conter 14 dígitos)', (value) =>
        !value || value.replace(/\D/g, '').length === 14),
    address: Yup.string()
      .nullable()
      .notRequired()
      .max(255, 'O endereço precisa ter no máximo 255 caracteres'),
  });

  return schema.validate(body, { abortEarly: false });
};

export const updateValidation = (body: Partial<Omit<ICompany, 'id'>>) => {
  const schema = Yup.object().shape({
    name: Yup.string()
      .notRequired()
      .min(3, 'O nome precisa ter no mínimo 3 caracteres')
      .max(32, 'O nome precisa ter no máximo 32 caracteres'),
    photo: Yup.string()
      .nullable()
      .notRequired()
      .max(32, 'O campo photo precisa ter no máximo 32 caracteres'),
    instagram: Yup.string()
      .nullable()
      .notRequired()
      .max(32, 'O campo instagram precisa ter no máximo 32 caracteres'),
    phone: Yup.string()
      .nullable()
      .notRequired()
      .max(13, 'O campo phone precisa ter no máximo 13 caracteres')
      .test('phone', 'Telefone inválido', (value) =>
        !value || /^\d{10,13}$/.test(value.replace(/\D/g, ''))),
    email: Yup.string()
      .nullable()
      .notRequired()
      .email('E-mail inválido')
      .max(100, 'O e-mail precisa ter no máximo 100 caracteres'),
    cnpj: Yup.string()
      .nullable()
      .notRequired()
      .max(20, 'O CNPJ precisa ter no máximo 20 caracteres')
      .test('cnpj', 'CNPJ inválido (deve conter 14 dígitos)', (value) =>
        !value || value.replace(/\D/g, '').length === 14),
    address: Yup.string()
      .nullable()
      .notRequired()
      .max(255, 'O endereço precisa ter no máximo 255 caracteres'),
  });

  return schema.validate(body, { abortEarly: false });
};
