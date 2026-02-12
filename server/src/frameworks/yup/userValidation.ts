// src/frameworks/yup/userValidation.ts
import * as Yup from 'yup';

interface AuthRequest {
  username: string;
  password: string;
}

export const userAuthValidation = (body: AuthRequest) => {
  const schema = Yup.object().shape({
    username: Yup.string().required('O campo username é obrigatório'),
    password: Yup.string().required('O campo password é obrigatório'),
  });
  return schema.validate(body, { abortEarly: false });
};

interface AuthTokenRequest {
    email: string;
    token: string;
  }
  
export const userAuthTokenValidation = (body: AuthTokenRequest) => {
  const schema = Yup.object().shape({
    email: Yup.string().required('O campo email é obrigatório').email("E-mail inválido"),
    token: Yup.string().required('Token obrigatório'),
  });
  return schema.validate(body, { abortEarly: false });
};

interface createRequest {
  username: string;
  password: string;
  name: string;
  groupId: number;

}

export const createValidation = (body: createRequest) => {
  const schema = Yup.object().shape({
    username: Yup.string().required('O campo username é obrigatório').min(3, 'O username precisa ter no mínimo 3 dígitos'),
    password: Yup.string().required('O campo password é obrigatório').min(4, 'A senha precisa ter no mínimo 4 dígitos'),
    name: Yup.string().required('O campo name é obrigatório').min(3, 'O nome precisa ter no mínimo 3 dígitos'),
    groupId: Yup.number().required('O campo groupId é obrigatório'),
  });
  return schema.validate(body, { abortEarly: false });
};

export const updateValidation = (body: createRequest) => {
  const schema = Yup.object().shape({
    username: Yup.string().required('O campo username é obrigatório').min(3, 'O username precisa ter no mínimo 3 dígitos'),
    password: Yup.string().optional(),
    name: Yup.string().required('O campo name é obrigatório').min(3, 'O nome precisa ter no mínimo 3 dígitos'),
    groupId: Yup.number().required('O campo groupId é obrigatório'),
  });
  return schema.validate(body, { abortEarly: false });
};