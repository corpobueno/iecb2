import { Api } from '../axios-config';
import { IDiarioFilters, IDiarioResponse } from '../../entities/Iecb';

export const DiarioService = {
  getDiario: async (filters: IDiarioFilters): Promise<IDiarioResponse | Error> => {
    try {
      const params = new URLSearchParams();
      params.append('data_inicio', filters.dataInicio);
      params.append('data_fim', filters.dataFim);

      if (filters.docente) {
        params.append('docente', filters.docente);
      }
      if (filters.usuario) {
        params.append('usuario', filters.usuario);
      }
      if (filters.status !== undefined) {
        params.append('status', String(filters.status));
      }
      if (filters.tipo !== undefined) {
        params.append('tipo', String(filters.tipo));
      }

      const { data } = await Api.get(`/diario?${params.toString()}`);

      if (data) {
        return data;
      }

      return new Error('Erro ao carregar diário.');
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        return error;
      }
      return new Error('Erro ao carregar diário.');
    }
  },
};
