import { useNavigate, useParams } from 'react-router-dom';
import { PageContainer } from '../../components/containers/PageContainer';
import { AulaForm } from './AulaForm';
import { IAulaForm } from '../../entities/Iecb';
import { useVForm } from '../../components/forms';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { AulaService } from '../../api/services/AulaService';
import { useEffect, useState } from 'react';
import { SaveToolbar } from '../../components/contents/SaveToolBar';
import { useSnackbar } from '../../contexts/SnackBarProvider';
import { useAuth } from '../../contexts/AuthContext';

const formValidationSchema = yup.object().shape({
  idCurso: yup.number().required('Curso e obrigatorio'),
  docente: yup.string().required('Docente e obrigatorio'),
  valor: yup.number().required('Valor e obrigatorio'),
  qnt: yup.number().optional(),
  nota: yup.string().optional(),
});

const AulaRegister: React.FC = () => {
  const { id = false } = useParams();
  const navigate = useNavigate();
  const { showSnackbarMessage } = useSnackbar();
  const { user } = useAuth();
  const { save, ...methods } = useVForm<IAulaForm>({
    resolver: yupResolver(formValidationSchema),
  });
  const [isLoading, setIsLoading] = useState(false);

  const initialValues: IAulaForm = {
    idCurso: 0,
    docente: '',
    valor: 0,
    qnt: 1,
    nota: '',
    usuario: user?.login || '',
  };
  const [project, setProject] = useState<IAulaForm>(initialValues);

  useEffect(() => {
    if (!id) {
      setProject(initialValues);
      return;
    }

    const fetchData = async () => {
      try {
        const resp = await AulaService.getById(Number(id));
        setProject(resp);
        Object.keys(resp).forEach((key) => {
          methods.setValue(key as keyof IAulaForm, resp[key as keyof IAulaForm]);
        });
      } catch (error) {
        showSnackbarMessage((error as Error).message, 'error');
      }
    };

    fetchData();
  }, [id]);

  const handleSave = async (data: IAulaForm) => {
    setIsLoading(true);

    try {
      const payload = { ...data, usuario: user?.login || '' };
      if (!id) {
        await AulaService.create(payload);
        showSnackbarMessage('Aula cadastrada com sucesso');
        navigate('/aulas');
      } else {
        await AulaService.update(Number(id), payload);
        showSnackbarMessage('Aula atualizada com sucesso');
      }
    } catch (error) {
      showSnackbarMessage((error as Error).message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Tem certeza que deseja excluir esta aula?')) return;

    try {
      await AulaService.deleteById(Number(id));
      showSnackbarMessage('Aula excluida com sucesso');
      navigate('/aulas');
    } catch (error) {
      showSnackbarMessage((error as Error).message, 'error');
    }
  };

  return (
    <PageContainer
      toolbar={
        <SaveToolbar
          showMenuButton={true}
          showNewButton={!!id}
          showSaveButton={!isLoading}
          showDeleteButton={!!id}
          onClickSave={() => save(handleSave)}
          onClickNew={() => navigate('/aulas/cadastrar')}
          onClickBack={() => navigate('/aulas')}
          onClickDelete={handleDelete}
        />
      }
    >
      <AulaForm handleSave={handleSave} methods={methods} project={project} isLoading={isLoading} />
    </PageContainer>
  );
};

export default AulaRegister;
