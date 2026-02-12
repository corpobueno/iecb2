import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { PageContainer } from '../../components/containers/PageContainer';
import { AgendaForm, IAgendaCompleteForm } from './AgendaForm';
import { useVForm } from '../../components/forms';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { AgendaService } from '../../api/services/AgendaService';
import { AulaService } from '../../api/services/AulaService';
import { useEffect, useState } from 'react';
import { SaveToolbar } from '../../components/contents/SaveToolBar';
import { useSnackbar } from '../../contexts/SnackBarProvider';

const formValidationSchema = yup.object().shape({
  idCurso: yup.number().required('Curso é obrigatório').min(1, 'Selecione um curso'),
  docente: yup.string().required('Professora é obrigatória'),
  valor: yup.number().required('Valor é obrigatório').min(0),
  data: yup.string().required('Data é obrigatória'),
  hora: yup.string().required('Hora é obrigatória'),
  horaFim: yup.string().required('Hora fim é obrigatória'),
  nota: yup.string().optional(),
});

const AgendaRegister: React.FC = () => {
  const { id = false } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showSnackbarMessage } = useSnackbar();
  const { save, ...methods } = useVForm<IAgendaCompleteForm>({
    resolver: yupResolver(formValidationSchema),
  });
  const [isLoading, setIsLoading] = useState(false);

  const defaultData = searchParams.get('data') || new Date().toISOString().split('T')[0];
  const initialValues: IAgendaCompleteForm = {
    idCurso: 0,
    docente: '',
    valor: 0,
    data: defaultData,
    hora: '08:00',
    horaFim: '09:00',
    nota: '',
  };
  const [project, setProject] = useState<IAgendaCompleteForm>(initialValues);
  //const [agendaId, setAgendaId] = useState<number | null>(null);
  const [aulaId, setAulaId] = useState<number | null>(null);

  useEffect(() => {
    if (!id) {
      setProject(initialValues);
      return;
    }

    const fetchData = async () => {
      try {
        // Carregar agenda
        const agendaResp = await AgendaService.getById(Number(id));
        //setAgendaId(agendaResp.id);
        setAulaId(agendaResp.idAula);

        // Carregar aula para pegar curso, docente e valor
        const aulaResp = await AulaService.getById(agendaResp.idAula);

        setProject({
          idCurso: aulaResp.idCurso,
          docente: aulaResp.docente,
          valor: aulaResp.valor,
          data: agendaResp.data,
          hora: agendaResp.hora,
          horaFim: agendaResp.horaFim,
          nota: agendaResp.nota || '',
        });
      } catch (error) {
        showSnackbarMessage((error as Error).message, 'error');
      }
    };

    fetchData();
  }, [id]);

  const handleSave = async (data: IAgendaCompleteForm) => {
    setIsLoading(true);

    try {
      if (!id) {
        // Criar nova aula primeiro
        const newAulaId = await AulaService.create({
          idCurso: data.idCurso,
          docente: data.docente,
          valor: data.valor,
        });

        // Criar agenda com o id da aula criada
        await AgendaService.create({
          idAula: newAulaId,
          data: data.data,
          hora: data.hora,
          horaFim: data.horaFim,
          nota: data.nota,
        });

        showSnackbarMessage('Agendamento criado com sucesso');
        navigate('/agenda');
      } else {
        // Atualizar aula existente
        if (aulaId) {
          await AulaService.update(aulaId, {
            idCurso: data.idCurso,
            docente: data.docente,
            valor: data.valor,
          });
        }

        // Atualizar agenda existente
        await AgendaService.update(Number(id), {
          data: data.data,
          hora: data.hora,
          horaFim: data.horaFim,
          nota: data.nota,
        });

        showSnackbarMessage('Agendamento atualizado com sucesso');
      }
    } catch (error) {
      showSnackbarMessage((error as Error).message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Tem certeza que deseja excluir este agendamento?')) return;

    try {
      await AgendaService.deleteById(Number(id));
      showSnackbarMessage('Agendamento excluido com sucesso');
      navigate('/agenda');
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
          onClickNew={() => navigate('/agenda/cadastrar')}
          onClickBack={() => navigate('/agenda')}
          onClickDelete={handleDelete}
        />
      }
    >
      <AgendaForm handleSave={handleSave} methods={methods} project={project} isLoading={isLoading} defaultData={defaultData} />
    </PageContainer>
  );
};

export default AgendaRegister;
