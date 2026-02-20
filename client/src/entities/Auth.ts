export interface IAuthResult {
  username: string;
  groupId: number;
  companyId: number;
  name: string;
}

export interface IValidateRequest {
  usuario: string;
  grupo: number;
  empresa: number;
}
