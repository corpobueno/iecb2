import { useNavigate, useParams } from 'react-router-dom';
import { PageContainer } from '../../components/containers/PageContainer';
import { LeadsForm } from './LeadsForm';
import { ILeadsForm } from '../../entities/Iecb';
import { useVForm } from '../../components/forms';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { LeadsService } from '../../api/services/LeadsService';
import { useEffect, useState } from 'react';
import { SaveToolbar } from '../../components/contents/SaveToolBar';
import { useSnackbar } from '../../contexts/SnackBarProvider';

const formValidationSchema = yup.object().shape({
  nome: yup.string().required('Nome é obrigatório').min(3, 'Mínimo 3 caracteres'),
  telefone: yup.string().optional().nullable(),
  email: yup.string().email('Email inválido').optional().nullable(),
  interesse: yup.string().optional().nullable(),
  tentativas: yup.number().optional().nullable(),
  nota: yup.string().optional().nullable(),
});

const LeadsRegister: React.FC = () => {
  const { id = false } = useParams();
  const navigate = useNavigate();
  const { showSnackbarMessage } = useSnackbar();
  const { save, ...methods } = useVForm<ILeadsForm>({
    resolver: yupResolver(formValidationSchema),
  });
  const [isLoading, setIsLoading] = useState(false);

  const initialValues: ILeadsForm = {
    nome: '',
    telefone: '',
    email: '',
    interesse: '',
    tentativas: 0,
    nota: '',
  };
  const [project, setProject] = useState<ILeadsForm>(initialValues);

  useEffect(() => {
    if (!id) {
      setProject(initialValues);
      return;
    }

    const fetchData = async () => {
      try {
        const resp = await LeadsService.getById(Number(id));
        setProject(resp);
      } catch (error) {
        showSnackbarMessage((error as Error).message, 'error');
      }
    };

    fetchData();
  }, [id]);

  const handleSave = async (data: ILeadsForm) => {
    setIsLoading(true);

    try {
      if (!id) {
        await LeadsService.create(data);
        showSnackbarMessage('Cadastrado com sucesso');
        navigate('/leads');
      } else {
        await LeadsService.update(Number(id), data);
        showSnackbarMessage('Atualizado com sucesso');
      }
    } catch (error) {
      showSnackbarMessage((error as Error).message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Tem certeza que deseja excluir?')) return;

    try {
      await LeadsService.deleteById(Number(id));
      showSnackbarMessage('Excluído com sucesso');
      navigate('/leads');
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
          onClickNew={() => navigate('/leads/cadastrar')}
          onClickBack={() => navigate('/leads')}
          onClickDelete={handleDelete}
        />
      }
    >
      <LeadsForm handleSave={handleSave} methods={methods} project={project} isLoading={isLoading} />
    </PageContainer>
  );
};

export default LeadsRegister;
