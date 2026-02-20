import { useNavigate, useParams } from 'react-router-dom';
import { PageContainer } from '../../../components/containers/PageContainer';
import { ProductForm } from './ProductForm';
import { ILancamentoForm } from '../../../entities/Iecb';
import { useVForm } from '../../../components/forms';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { ProdutoService } from '../../../api/services/ProdutoService';
import { useState, useMemo } from 'react';
import { SaveToolbar } from '../../../components/contents/SaveToolBar';
import { useSnackbar } from '../../../contexts/SnackBarProvider';
import { useAuth } from '../../../contexts/AuthContext';

const formValidationSchema = yup.object().shape({
  idCliente: yup.number().required('Cliente é obrigatório').min(1, 'Selecione um cliente'),
  produto: yup.number().required('Produto é obrigatório').min(1, 'Selecione um produto'),
  valor: yup.number().required('Valor é obrigatório').min(0.01, 'Valor deve ser maior que zero'),
  qnt: yup.number().required('Quantidade é obrigatória').min(1, 'Quantidade mínima é 1'),
  idPagamento: yup.number().required('Forma de pagamento é obrigatória'),
  usuario: yup.string().required('Vendedor é obrigatório'),
});

const ProductRegister: React.FC = () => {
  const { id = false } = useParams();
  const navigate = useNavigate();
  const { showSnackbarMessage } = useSnackbar();
  const { user } = useAuth();

  const initialValues: ILancamentoForm = useMemo(() => ({
    idCliente: 0,
    produto: 0,
    valor: 0,
    qnt: 1,
    idPagamento: 2,
    usuario: user?.login || '',
  }), [user?.login]);

  const { save, ...methods } = useVForm<ILancamentoForm>({
    resolver: yupResolver(formValidationSchema),
    defaultValues: initialValues,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [project] = useState<ILancamentoForm>(initialValues);

  const handleSave = async (data: ILancamentoForm) => {
    setIsLoading(true);

    try {
      const payload = {
        idCliente: data.idCliente,
        idProduto: data.produto,
        usuario: data.usuario,
        pagamentos: [{
          idPagamento: data.idPagamento,
          valor: data.valor,
          qnt: data.qnt,
        }],
      };

      const result = await ProdutoService.processarVenda(payload);
      if (result instanceof Error) {
        throw result;
      }
      showSnackbarMessage('Venda registrada com sucesso');
      navigate('/pagamentos/produto');
    } catch (error) {
      showSnackbarMessage((error as Error).message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageContainer
      toolbar={
        <SaveToolbar
          showMenuButton
          showNewButton={false}
          showSaveButton={!isLoading}
          showDeleteButton={false}
          onClickSave={() => save(handleSave)}
          onClickNew={() => navigate('/pagamentos/produto/cadastrar')}
          onClickBack={() => navigate('/pagamentos/produto')}
        />
      }
    >
      <ProductForm
        handleSave={handleSave}
        methods={methods}
        project={project}
        isLoading={isLoading}
      />
    </PageContainer>
  );
};

export default ProductRegister;
