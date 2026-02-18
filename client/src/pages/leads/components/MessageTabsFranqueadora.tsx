import { ILeadsFranqueadora } from "../../../entities/Iecb";
import { ComentariosLeadsFranqueadora } from "./ComentariosLeadsFranqueadora";
import { DetalheLeadFranqueadora } from "../franqueadora/DetalheLeadFranqueadora";
import { TabsNavigator } from "../../../components/containers/TabsNavigator";
import { Paper } from "@mui/material";

interface IMessageTabsFranqueadoraProps {
  leads: string;
  lead: ILeadsFranqueadora | null;
  reloadList: () => void;
}

export const MessageTabsFranqueadora: React.FC<IMessageTabsFranqueadoraProps> = ({
  leads,
  lead,
  reloadList,
}) => {
  const steps = [
    {
      label: 'Comentários',
      content:
        <ComentariosLeadsFranqueadora
          leads={leads}
          lead={lead}
          reloadList={reloadList}
        />
    },
  ];

  const stepPrincipal = [
    {
      label: 'Detalhe',
      content:
        <DetalheLeadFranqueadora
          id={lead?.id ?? 0}
        />
    },
  ];

  return (
    <Paper sx={{ minHeight: 'calc(100dvh - 20px - env(safe-area-inset-bottom))', width: '500px' }}>
      <TabsNavigator defaultActiveStep={0} steps={[...steps, ...stepPrincipal]} />
    </Paper>
  );
}
