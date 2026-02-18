import { useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    FormControl,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Radio,
    Box,
    Typography
} from "@mui/material";
import * as XLSX from 'xlsx';
import { LeadsService, ILeadsFiltros } from "../../../api/services/LeadsService";

type ExportFormat = 'csv' | 'xlsx';

const exportToCSV = (data: Array<{ nome: string; telefone: string }>, filename: string) => {
    // Usa ; como separador
    const csvContent =
        "data:text/csv;charset=utf-8," +
        data.map(e => Object.values(e).join(";")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename + ".csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const exportToXLSX = (data: Array<{ nome: string; telefone: string }>, filename: string) => {
    // Cria uma planilha a partir dos dados
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Cria um workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");

    // Gera o arquivo e faz o download
    XLSX.writeFile(workbook, filename + ".xlsx");
};

export const executeExport = (params: ILeadsFiltros, format: ExportFormat = 'csv') => {
    LeadsService.getPrincipal({ ...params, limit: 10000 })
        .then((resp) => {
            if (resp instanceof Error) {
                alert(resp.message);
            } else {
                const list = resp.data.map((item) => ({
                    nome: item.nome || '',
                    telefone: item.telefone || '',
                }));

                const filename = 'leads_iecb_export';
                if (format === 'csv') {
                    exportToCSV(list, filename);
                } else {
                    exportToXLSX(list, filename);
                }
            }
        });
};

interface IExportDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (selecao: string, format: ExportFormat) => void;
    statusList: Array<{ id: string | number; label: string; color: string }>;
}

export const ExportDialog: React.FC<IExportDialogProps> = ({ open, onClose, onConfirm, statusList }) => {
    const [selectedStatus, setSelectedStatus] = useState<string>('');
    const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('csv');

    const handleConfirm = () => {
        onConfirm(selectedStatus, selectedFormat);
        onClose();
        setSelectedStatus(''); // Reset após confirmar
        setSelectedFormat('csv'); // Reset formato
    };

    const handleClose = () => {
        setSelectedStatus(''); // Reset ao cancelar
        setSelectedFormat('csv'); // Reset formato
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>Configurar Exportação</DialogTitle>
            <DialogContent>
                {/* Seleção de Formato */}
                 <FormControl component="fieldset" sx={{ width: '100%' }}>
                    <FormLabel component="legend">Formato do Arquivo</FormLabel>
                    <RadioGroup
                        value={selectedFormat}
                        onChange={(e) => setSelectedFormat(e.target.value as ExportFormat)}
                        row
                    >
                        <FormControlLabel
                            value="csv"
                            control={<Radio />}
                            label={
                                <Box>
                                    <Typography variant="body2" fontWeight="bold">CSV</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Arquivo de texto separado por vírgula
                                    </Typography>
                                </Box>
                            }
                        />
                        <FormControlLabel
                            value="xlsx"
                            control={<Radio />}
                            label={
                                <Box>
                                    <Typography variant="body2" fontWeight="bold">Excel (.xlsx)</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Planilha do Microsoft Excel
                                    </Typography>
                                </Box>
                            }
                        />
                    </RadioGroup>
                </FormControl>
                {/* Seleção de Status */}
                <FormControl component="fieldset" sx={{ mt: 2, width: '100%', mb: 3 }}>
                    <FormLabel component="legend">Seleção dos Leads</FormLabel>
                    <RadioGroup
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                    >
                        <FormControlLabel
                            value=""
                            control={<Radio />}
                            label="Todos"
                        />
                        {statusList.map((status) => (
                            <FormControlLabel
                                key={status.id}
                                value={status.id}
                                control={<Radio sx={{ color: status.color, '&.Mui-checked': { color: status.color } }} />}
                                label={status.label}
                            />
                        ))}
                    </RadioGroup>
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="inherit">
                    Cancelar
                </Button>
                <Button onClick={handleConfirm} variant="contained" color="success">
                    Exportar
                </Button>
            </DialogActions>
        </Dialog>
    );
};

// Função legada mantida para compatibilidade (não deve ser mais usada)
export const loadExport = (params: ILeadsFiltros) => {
    executeExport(params, 'csv');
};
