import * as Minio from 'minio';

// Configuração do MinIO (mesmas configurações do Corpo Bueno)
const minioConfig = {
  endPoint: process.env.MINIO_ENDPOINT || '162.214.73.78',
  port: parseInt(process.env.MINIO_PORT || '9100'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'admin',
  secretKey: process.env.MINIO_SECRET_KEY || ''
};

// Configuração de URL pública
const publicConfig = {
  endpoint: process.env.MINIO_PUBLIC_ENDPOINT || 'file.corpobueno.com.br',
  port: parseInt(process.env.MINIO_PUBLIC_PORT || '443'),
  useSSL: process.env.MINIO_PUBLIC_SSL === 'true'
};

const bucket = process.env.MINIO_BUCKET || 'corpobueno';

// Cliente MinIO
const minioClient = new Minio.Client(minioConfig);

/**
 * Converte base64 para Buffer
 */
const base64ToBuffer = (base64: string): Buffer => {
  // Remove o prefixo data:image/xxx;base64, se existir
  const base64Data = base64.replace(/^data:.*?;base64,/, '');
  return Buffer.from(base64Data, 'base64');
};

/**
 * Gera um nome de arquivo único
 */
const generateFileName = (formato: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `${timestamp}_${random}.${formato}`;
};

/**
 * Obtém o Content-Type baseado no formato
 */
const getContentType = (formato: string): string => {
  const contentTypes: Record<string, string> = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'pdf': 'application/pdf',
    'svg': 'image/svg+xml',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  };
  return contentTypes[formato.toLowerCase()] || 'application/octet-stream';
};

/**
 * Monta a URL pública do arquivo
 */
const getPublicUrl = (fileName: string): string => {
  const protocol = publicConfig.useSSL ? 'https' : 'http';
  const portPart = (publicConfig.useSSL && publicConfig.port === 443) ||
                   (!publicConfig.useSSL && publicConfig.port === 80)
                   ? '' : `:${publicConfig.port}`;
  return `${protocol}://${publicConfig.endpoint}${portPart}/${bucket}/${fileName}`;
};

/**
 * Faz upload de arquivo base64 para o MinIO
 */
export const uploadBase64ToMinio = async (
  base64: string,
  formato: string = 'jpg'
): Promise<string> => {
  const buffer = base64ToBuffer(base64);
  const fileName = generateFileName(formato);
  const contentType = getContentType(formato);

  // Verifica se o bucket existe, se não, cria
  const bucketExists = await minioClient.bucketExists(bucket);
  if (!bucketExists) {
    await minioClient.makeBucket(bucket);
  }

  // Faz o upload
  await minioClient.putObject(
    bucket,
    fileName,
    buffer,
    buffer.length,
    {
      'Content-Type': contentType
    }
  );

  return getPublicUrl(fileName);
};

/**
 * Deleta um arquivo do MinIO
 */
export const deleteFromMinio = async (fileUrl: string): Promise<void> => {
  // Extrai o nome do arquivo da URL
  const urlParts = fileUrl.split('/');
  const fileName = urlParts[urlParts.length - 1];

  if (fileName) {
    await minioClient.removeObject(bucket, fileName);
  }
};

export default minioClient;
