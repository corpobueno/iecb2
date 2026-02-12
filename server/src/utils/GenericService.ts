import db from '../db';

export default {
  deleteById: async (tableName: string, id: number): Promise<void | false> => {
    try {
      const result = await db(tableName).where('id', id).del();
      
      // Se nenhuma linha for afetada, significa que o ID não existia
      if (result === 0) {
        return false; // ID não encontrado
      }
    } catch (error) {
      // Lidar com o erro, talvez logar ou rethrow
      throw error; // Repassa o erro para quem chamou
    }
  },
  deleteByIdAnyKey: async ({ table = '', key = '', value }: { table: string; key: string; value: string | number }): Promise<void | false> => {
    try {
      
      const result = await db(table).where(key, value).del();
      
      // Se nenhuma linha for afetada, significa que o ID não existia
      if (result === 0) {
        return false; // ID não encontrado
      }
    } catch (error) {
      // Lidar com o erro, talvez logar ou rethrow
      throw error; // Repassa o erro para quem chamou
    }
  },
};
