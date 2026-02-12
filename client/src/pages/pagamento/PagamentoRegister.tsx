import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { PageContainer } from '../../components/containers/PageContainer';
import { PagamentoForm } from './PagamentoForm';
import { IPagamentoForm } from '../../entities/Iecb';
import { useVForm } from '../../components/forms';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { PagamentoService } from '../../api/services/PagamentoService';
import { useEffect, useState } from 'react';
import { SaveToolbar } from '../../components/contents/SaveToolBar';
import { useSnackbar } from '../../contexts/SnackBarProvider';
import { useAuth } from '../../contexts/AuthContext';

const formValidationSchema = yup.object().shape({
  idCliente: yup.number().required('Cliente é obrigatório').min(1, 'Selecione um cliente'),
  idAula: yup.number().optional(),
  idAluno: yup.number().optional(),
  idLancamentos: yup.number().optional(),
  docente: yup.string().optional(),
  caixa: yup.string().required(),
  valor: yup.number().required('Valor é obrigatório'),
  qnt: yup.number().optional(),
  idPagamento: yup.number().optional(),
  valorMatricula: yup.number().optional(),
});

const PagamentoRegister: React.FC = () => {
  const { id = false } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showSnackbarMessage } = useSnackbar();
  const { user } = useAuth();
  const { save, ...methods } = useVForm<IPagamentoForm>({
    resolver: yupResolver(formValidationSchema),
  });
  const [isLoading, setIsLoading] = useState(false);

  const defaultIdCliente = Number(searchParams.get('idCliente')) || 0;

  const initialValues: IPagamentoForm = {
    idCliente: defaultIdCliente,
    idAula: 0,
    valor: 0,
    qnt: 1,
    idPagamento: 1,
    valorMatricula: 0,
    caixa: user?.login || '',
  };
  const [project, setProject] = useState<IPagamentoForm>(initialValues);

  useEffect(() => {
    if (!id) {
      setProject(initialValues);
      return;
    }

    const fetchData = async () => {
      try {
        const resp = await PagamentoService.getById(Number(id));
        setProject(resp);
      } catch (error) {
        showSnackbarMessage((error as Error).message, 'error');
      }
    };

    fetchData();
  }, [id]);

  const handleSave = async (data: IPagamentoForm) => {
    setIsLoading(true);

    try {
      const payload = { ...data, caixa: user?.login || '' };
      if (!id) {
        await PagamentoService.create(payload);
        showSnackbarMessage('Pagamento registrado com sucesso');
        navigate('/pagamentos');
      } else {
        await PagamentoService.update(Number(id), payload);
        showSnackbarMessage('Pagamento atualizado com sucesso');
      }
    } catch (error) {
      showSnackbarMessage((error as Error).message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Tem certeza que deseja excluir este pagamento?')) return;

    try {
      await PagamentoService.deleteById(Number(id));
      showSnackbarMessage('Pagamento excluído com sucesso');
      navigate('/pagamentos');
    } catch (error) {
      showSnackbarMessage((error as Error).message, 'error');
    }
  };

  return (
    <PageContainer
      toolbar={
        <SaveToolbar
          showMenuButton
          showNewButton={!!id}
          showSaveButton={!isLoading}
          showDeleteButton={!!id}
          onClickSave={() => save(handleSave)}
          onClickNew={() => navigate('/pagamentos/cadastrar')}
          onClickBack={() => navigate('/pagamentos')}
          onClickDelete={handleDelete}
        />
      }
    >
      <PagamentoForm
        handleSave={handleSave}
        methods={methods}
        project={project}
        isLoading={isLoading}
        defaultIdCliente={defaultIdCliente}
      />
    </PageContainer>
  );
};

export default PagamentoRegister;
