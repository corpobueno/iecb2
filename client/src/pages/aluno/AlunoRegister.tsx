import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { PageContainer } from '../../components/containers/PageContainer';
import { AlunoForm } from './AlunoForm';
import { IAlunoForm } from '../../entities/Iecb';
import { useVForm } from '../../components/forms';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { AlunoService } from '../../api/services/AlunoService';
import { useEffect, useState } from 'react';
import { SaveToolbar } from '../../components/contents/SaveToolBar';
import { useSnackbar } from '../../contexts/SnackBarProvider';
import { useAuth } from '../../contexts/AuthContext';

const formValidationSchema = yup.object().shape({
  idAluno: yup.number().required('Cliente é obrigatório').min(1, 'Selecione um cliente'),
  idAula: yup.number().required('Aula é obrigatória').min(1, 'Selecione uma aula'),
  tipo: yup.number().optional(),
  status: yup.number().optional(),
  valor: yup.number().optional(),
  valorMatricula: yup.number().optional(),
  data: yup.string().optional().nullable(),
});

const AlunoRegister: React.FC = () => {
  const { id = false } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showSnackbarMessage } = useSnackbar();
  const { user } = useAuth();
  const { save, ...methods } = useVForm<IAlunoForm>({
    resolver: yupResolver(formValidationSchema),
  });
  const [isLoading, setIsLoading] = useState(false);

  const defaultIdAula = Number(searchParams.get('idAula')) || 0;
  const today = new Date().toISOString().split('T')[0];

  const initialValues: IAlunoForm = {
    idAluno: 0,
    idAula: defaultIdAula,
    tipo: 0,
    status: 0,
    valor: 0,
    valorMatricula: 0,
    data: today,
    usuario: user?.login || '',
  };
  const [project, setProject] = useState<IAlunoForm>(initialValues);

  useEffect(() => {
    if (!id) {
      setProject(initialValues);
      return;
    }

    const fetchData = async () => {
      try {
        const resp = await AlunoService.getById(Number(id));
        setProject(resp);
      } catch (error) {
        showSnackbarMessage((error as Error).message, 'error');
      }
    };

    fetchData();
  }, [id]);

  const handleSave = async (data: IAlunoForm) => {
    setIsLoading(true);

    try {
      const payload = { ...data, usuario: user?.login || '' };
      if (!id) {
        await AlunoService.create(payload);
        showSnackbarMessage('Matrícula realizada com sucesso');
        navigate('/alunos');
      } else {
        await AlunoService.update(Number(id), payload);
        showSnackbarMessage('Matrícula atualizada com sucesso');
      }
    } catch (error) {
      showSnackbarMessage((error as Error).message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Tem certeza que deseja remover esta matrícula?')) return;

    try {
      await AlunoService.deleteById(Number(id));
      showSnackbarMessage('Matrícula removida com sucesso');
      navigate('/alunos');
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
          onClickNew={() => navigate('/alunos/cadastrar')}
          onClickBack={() => navigate('/alunos')}
          onClickDelete={handleDelete}
        />
      }
    >
      <AlunoForm
        handleSave={handleSave}
        methods={methods}
        project={project}
        isLoading={isLoading}
        defaultIdAula={defaultIdAula}
      />
    </PageContainer>
  );
};

export default AlunoRegister;
