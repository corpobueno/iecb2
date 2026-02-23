import { Button, Divider, Icon, Paper, Skeleton, Typography, useTheme } from '@mui/material';

interface IBaseToolbarProps {
    showBackButton?: boolean;
    BackButtonText?: string;
    showBackLoadingButton?: boolean;
    onClickBack?: () => void;
    children?: React.ReactNode;
    gap?: number;
}

export const BaseToolbar: React.FC<IBaseToolbarProps> = ({
    showBackButton = true,
    BackButtonText = 'Voltar',
    showBackLoadingButton = false,
    onClickBack,
    children,
    gap = 1
}) => {
    const theme = useTheme();

    const hasChildren = !!children;

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

            {(showBackButton && hasChildren) && (
                <Divider variant='middle' orientation='vertical' />
            )}

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
        </Paper>
    );
};
