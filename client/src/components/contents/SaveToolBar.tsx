import { Button, Divider, Icon, Paper, Skeleton, Theme, Typography, useMediaQuery, useTheme } from '@mui/material';


interface IFerramentasDeDetalheProps {
    showMenuButton?: boolean;

    showNewButton?: boolean;
    showBackButton?: boolean;
    showDeleteButton?: boolean;
    showSaveButton?: boolean;

    disabledSave?: boolean;

    SaveButtonText?: string;
    NewButtonText?: string;
    DeleteButtonText?: string;
    BackButtonText?: string;

    showNewLoadingButton?: boolean;
    showBackLoadingButton?: boolean;
    showDeleteLoadingButton?: boolean;
    showSaveLoadingButton?: boolean;

    onClickNew?: () => void;
    onClickBack?: () => void;
    onClickDelete?: () => void;
    onClickSave?: () => void;

    children?: React.ReactNode;
    gap?: number;
}
export const SaveToolbar: React.FC<IFerramentasDeDetalheProps> = ({

    showNewButton = false,
    showBackButton = true,
    showDeleteButton = false,
    showSaveButton = true,

    disabledSave = false,

    NewButtonText = 'Novo',
    DeleteButtonText = 'Excluir',
    SaveButtonText = 'Salvar',
    BackButtonText = 'Voltar',

    showNewLoadingButton = false,
    showBackLoadingButton = false,
    showDeleteLoadingButton = false,
    showSaveLoadingButton = false,


    onClickNew,
    onClickBack,
    onClickDelete,
    onClickSave,


    children,
    gap = 1
}) => {
    //const smDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));
    const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
    const theme = useTheme();
    return (
        <Paper
            variant='outlined'
            sx={{
                gap,
                marginX: 1,
                marginBottom: 1,
                padding: 1,
                display: "flex",
                alignItems: "center",
                height: theme.spacing(5),
            }}
        >
           

            {children}
            {(showSaveButton && !showSaveLoadingButton) && (
                <Button
                    color='primary'
                    disabled={disabledSave}
                    disableElevation
                    variant='contained'
                    onClick={onClickSave}
                    startIcon={<Icon>save</Icon>}
                >
                    <Typography variant='button' whiteSpace="nowrap" textOverflow="ellipsis" overflow="hidden">
                        {SaveButtonText}
                    </Typography>
                </Button>
            )}

            {showSaveLoadingButton && (
                <Skeleton width={110} height={60} />
            )}


            {(showDeleteButton && !showDeleteLoadingButton) && (
                <Button
                    color='primary'
                    disableElevation
                    disabled={disabledSave}
                    variant='outlined'
                    onClick={onClickDelete}
                    startIcon={<Icon>delete</Icon>}
                >
                    <Typography variant='button' whiteSpace="nowrap" textOverflow="ellipsis" overflow="hidden">
                        {DeleteButtonText}
                    </Typography>
                </Button>
            )}

            {showDeleteLoadingButton && (
                <Skeleton width={110} height={60} />
            )}

            {(showNewButton && !showNewLoadingButton && !mdDown) && (
                <Button
                    color='primary'
                    disableElevation
                    disabled={disabledSave}
                    variant='outlined'
                    onClick={onClickNew}
                    startIcon={<Icon>add</Icon>}
                >
                    <Typography variant='button' whiteSpace="nowrap" textOverflow="ellipsis" overflow="hidden">
                        {NewButtonText}
                    </Typography>
                </Button>
            )}

            {(showNewLoadingButton && !mdDown) && (
                <Skeleton width={110} height={60} />
            )}

            {
                (
                    showBackButton &&
                    (showNewButton || showDeleteButton || showSaveButton)
                ) && (
                    <Divider variant='middle' orientation='vertical' />
                )
            }

            {(showBackButton && !showBackLoadingButton) && (
                <Button
                    color='primary'
                    disableElevation
                    variant='outlined'
                    onClick={onClickBack}
                    startIcon={<Icon>arrow_back</Icon>}
                >
                    <Typography variant='button' whiteSpace="nowrap" textOverflow="ellipsis" overflow="hidden">
                        {BackButtonText}
                    </Typography>
                </Button>
            )}

            {showBackLoadingButton && (
                <Skeleton width={110} height={60} />
            )}
        </Paper >
    );
};
