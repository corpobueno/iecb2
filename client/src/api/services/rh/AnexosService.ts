import { Api } from '../../axios-config';

export interface IAnexo {
  id: number;
  nome: string;
  tipo: string;
  tabela: string;
  idRef: number | null;
  empresa: number | null;
  url: string | null;
  formato: string | null;
  createdAt?: string;
  usuario?: string | null;
}

export interface IAnexoCreate {
  nome: string;
  tipo: string;
  tabela: string;
  idRef: number | null;
  base64: string;
  formato: string;
}

// Tipos de documentos para RH
export const TIPOS_DOCUMENTO_RH = [
  { value: 'RG', label: 'RG' },
  { value: 'CPF', label: 'CPF' },
  { value: 'CTPS', label: 'Carteira de Trabalho' },
  { value: 'TITULO_ELEITOR', label: 'Título de Eleitor' },
  { value: 'RESERVISTA', label: 'Certificado de Reservista' },
  { value: 'CNH', label: 'CNH' },
  { value: 'COMPROVANTE_RESIDENCIA', label: 'Comprovante de Residência' },
  { value: 'COMPROVANTE_ESCOLARIDADE', label: 'Comprovante de Escolaridade' },
  { value: 'CERTIDAO_NASCIMENTO', label: 'Certidão de Nascimento' },
  { value: 'CERTIDAO_CASAMENTO', label: 'Certidão de Casamento' },
  { value: 'CURRICULO', label: 'Currículo' },
  { value: 'CONTRATO', label: 'Contrato' },
  { value: 'ATESTADO', label: 'Atestado' },
  { value: 'EXAME_ADMISSIONAL', label: 'Exame Admissional' },
  { value: 'OUTRO', label: 'Outro' },
];

/**
 * Converte arquivo para base64
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove o prefixo "data:*/*;base64,"
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Extrai extensão do arquivo
 */
export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || 'pdf';
};

/**
 * Service para API de Anexos (IECB Backend)
 */
export const AnexosRhService = {
  /**
   * Busca anexos por referência (tabela + id_ref)
   */
  getByReferencia: async (tabela: string, idRef: number): Promise<IAnexo[] | Error> => {
    try {
      const { data } = await Api.get(`/anexos/referencia/${tabela}/${idRef}`);

      if (data?.data) {
        return data.data;
      }

      if (Array.isArray(data)) {
        return data;
      }

      return [];
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        return error;
      }
      return new Error('Erro ao buscar anexos.');
    }
  },

  /**
   * Cria um novo anexo
   */
  create: async (anexo: IAnexoCreate): Promise<number | Error> => {
    try {
      const { data } = await Api.post('/anexos', {
        nome: anexo.nome,
        tipo: anexo.tipo,
        tabela: anexo.tabela,
        id_ref: anexo.idRef,
        base64: anexo.base64,
        formato: anexo.formato,
      });

      if (data?.data?.id) {
        return data.data.id;
      }

      if (data?.id) {
        return data.id;
      }

      return new Error('Erro ao criar anexo.');
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        return error;
      }
      return new Error('Erro ao criar anexo.');
    }
  },

  /**
   * Deleta um anexo
   */
  delete: async (id: number): Promise<void | Error> => {
    try {
      await Api.delete(`/anexos/${id}`);
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        return error;
      }
      return new Error('Erro ao deletar anexo.');
    }
  },

  /**
   * Upload de múltiplos arquivos
   */
  uploadMultiple: async (
    files: File[],
    tabela: string,
    idRef: number,
    tipo: string
  ): Promise<{ success: number; failed: number; errors: string[] }> => {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const file of files) {
      try {
        const base64 = await fileToBase64(file);
        const formato = getFileExtension(file.name);

        const result = await AnexosRhService.create({
          nome: file.name,
          tipo,
          tabela,
          idRef,
          base64,
          formato,
        });

        if (result instanceof Error) {
          results.failed++;
          results.errors.push(`${file.name}: ${result.message}`);
        } else {
          results.success++;
        }
      } catch (error) {
        results.failed++;
        results.errors.push(`${file.name}: Erro desconhecido`);
      }
    }

    return results;
  },
};
