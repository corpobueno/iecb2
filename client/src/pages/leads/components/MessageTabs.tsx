import { ILeadsPrincipal } from "../../../entities/Iecb";

import { ComentariosLeads } from "./ComentariosLeads";
import { DetalheLead } from "../principal/DetalheLead";
import { TabsNavigator } from "../../../components/containers/TabsNavigator";

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
    <TabsNavigator defaultActiveStep={0} steps={[...steps, ...stepPrincipal]} />
  );

}
