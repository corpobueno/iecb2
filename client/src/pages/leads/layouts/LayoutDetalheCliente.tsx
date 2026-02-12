import React, { useState } from 'react';
import { Avatar, Box, Card, CircularProgress, Dialog, DialogContent, Typography, useTheme } from '@mui/material';
import { IClienteDetalhe } from '../../../api/services/AtendentesService';
import { toCash } from '../../../utils/functions';

export const LayoutDetalheCliente: React.FC<{ cliente: IClienteDetalhe | undefined, isLoading: boolean, count: number }> = ({ cliente, isLoading, count }) => {
    const theme = useTheme();
    const [openDialog, setOpenDialog] = useState(false);
    const handleOpenDialog = () => setOpenDialog(true);
    const handleCloseDialog = () => setOpenDialog(false);

    return (
        <Card
            variant='outlined'
            sx={{
                gap: 1,
                mx: 1,
                boxSizing: 'border-box',
                padding: 1,
                display: "flex-box",
                alignItems: "center",
            }}
        >

            {isLoading ? (
                <Box display={'flex'} justifyContent={'center'} alignItems={'center'} height={'100%'}>
                    <CircularProgress />
                </Box>
            ) : !cliente ?
                (
                    <Box display={'flex'} justifyContent={'center'} alignItems={'center'} width={'100%'}>
                        <Typography variant='body1'>
                            Erro ao processar informação &#128560;
                        </Typography>
                    </Box>
                ) :
                (
                    <>
                        <Box display={'flex'} justifyContent='space-between' width={'100%'}>

                            <Box display={'flex'} alignItems={'center'}>
                                <Avatar
                                    alt=''
                                    src={cliente.foto || '/broken-image.jpg'}
                                    sx={{ width: 90, height: 90, cursor: 'pointer' }}
                                    onClick={handleOpenDialog} // Abre o modal ao clicar
                                />

                                <Box mx={2}>
                                    <Typography variant='subtitle1'>
                                        {cliente.nome_cliente}
                                    </Typography>
                                    <Typography variant='body1'
                                        whiteSpace="nowrap"
                                        overflow="hidden"
                                        textOverflow="ellipsis"
                                        color='textSecondary'>
                                        {cliente.nome_procedimento}
                                    </Typography>
                                    <LabelDetalheCliente
                                        label="Região" value={cliente.regiao}
                                    />


                                    <Box sx={{ display: 'flex', w: '100%', gap: 2 }}>
                                        <LabelDetalheCliente
                                            label="Sessão" value={`${count} / ${cliente.qnt_sessao}`}
                                        />
                                        <LabelDetalheCliente
                                            label='RP' value={toCash(cliente.rp)}
                                        />
                                    </Box>
                                    {/*cliente.nota &&
                                        <Typography variant='subtitle1' fontWeight={600} color='primary.main'>
                                           * {cliente.nota}
                                        </Typography>
                                    */}
                                </Box>
                            </Box>

                        </Box>

                        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md">
                            <DialogContent
                                onClick={handleCloseDialog}
                                sx={{

                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    padding: theme.spacing(1),
                                }}
                            >
                                <img
                                    src={cliente.foto || '/broken-image.jpg'}
                                    alt={cliente.nome_cliente}
                                    style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: theme.shape.borderRadius }}
                                />
                            </DialogContent>
                        </Dialog>
                    </>
                )}
        </Card>
    );
};

const LabelDetalheCliente: React.FC<{ label: string, value: string }> = ({ label, value }) => {

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant='body1'>{label}:</Typography>
            <Typography variant='body2'
                whiteSpace="nowrap"
                overflow="hidden"
                textOverflow="ellipsis"
                color='textSecondary'>
                {value || '-'}
            </Typography>
        </Box>
    );
};
