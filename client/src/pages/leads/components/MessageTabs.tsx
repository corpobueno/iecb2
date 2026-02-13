import { ILeadsPrincipal } from "../../../entities/Iecb";

import { ComentariosLeads } from "./ComentariosLeads";
import { DetalheLead } from "../principal/DetalheLead";
import { TabsNavigator } from "../../../components/containers/TabsNavigator";
import { Paper } from "@mui/material";

interface IMessageTabsProps {
  leads: string;
  lead: ILeadsPrincipal | null;
  reloadList: () => void;
}

export const MessageTabs: React.FC<IMessageTabsProps> = ({
  leads,
  lead,
  reloadList,
}) => {
  const steps = [
    {
      label: 'Comentários',
      content:
        <ComentariosLeads
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
        <DetalheLead
          id={lead?.id ?? 0}
        />
    },
  ];

  return (
    <Paper sx={{ minHeight: 'calc(100dvh - 20px - env(safe-area-inset-bottom))', width: '500px' }}
    >
      <TabsNavigator defaultActiveStep={0} steps={[...steps, ...stepPrincipal]} />
    </Paper>

  );

}
