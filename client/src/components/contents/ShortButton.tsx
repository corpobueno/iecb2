import { IconButton, IconButtonProps } from "@mui/material"

interface Props extends IconButtonProps {
    variant?: 'contained' | "outlined";
    icon: any;
}

export const ShortButton = ({ variant = 'outlined', icon, ...rest }: Props) => {
    if (variant === 'contained') {
        return (
            <IconButton
                size="small"
                sx={{
                    bgcolor: rest.color ? `${rest.color}.main` : 'primary.main',
                    color: 'white',
                    borderRadius: 1,
                    '&:hover': {
                        bgcolor: rest.color ? `${rest.color}.dark` : 'primary.dark',
                    }
                }}
                {...rest}
            >
                {icon}
            </IconButton>
        )
    }
    return (
        <IconButton
            size="small"
            sx={{
                border: '1px solid',
                borderColor: rest.color ? `${rest.color}.light` : 'primary.light',
                color: rest.color ? `${rest.color}.main` : 'primary.main',
                borderRadius: 1,
                
            }}
            {...rest}
        >
            {icon}
        </IconButton>
    )
}