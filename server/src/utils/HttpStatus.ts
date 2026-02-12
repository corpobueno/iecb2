// src/utils/httpStatus.ts
import { StatusCodes } from 'http-status-codes';

export class HttpStatus {
  static OK = StatusCodes.OK;
  static CREATED = StatusCodes.CREATED;
  static BAD_REQUEST = StatusCodes.BAD_REQUEST;
  static UNAUTHORIZED = StatusCodes.UNAUTHORIZED;
  static INTERNAL_SERVER_ERROR = StatusCodes.INTERNAL_SERVER_ERROR;
  static NOT_FOUND = StatusCodes.NOT_FOUND;

  static getMessage(status: number): string {
    switch (status) {
      case this.OK:
        return 'Operação realizada com sucesso';
      case this.CREATED:
        return 'Registro criado com sucesso';
      case this.BAD_REQUEST:
        return 'Requisição inválida';
      case this.UNAUTHORIZED:
        return 'Não autorizado';
      case this.INTERNAL_SERVER_ERROR:
        return 'Erro interno no servidor';
        case this.INTERNAL_SERVER_ERROR:
            return 'Não encontrado';
      default:
        return 'Erro desconhecido';
    }
  }
}