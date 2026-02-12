import React from 'react';
import { styled } from '@mui/material/styles';
import Radio, { RadioProps } from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import { Controller, useFormContext } from 'react-hook-form';

const BpIcon = styled('span')((_) => ({
    borderRadius: '50%',
    width: 16,
    height: 16,
    boxShadow: 'inset 0 0 0 1px rgba(16,22,26,.2), inset 0 -1px 0 rgba(16,22,26,.1)',
    backgroundColor: '#f5f8fa',
    backgroundImage: 'linear-gradient(180deg,hsla(0,0%,100%,.8),hsla(0,0%,100%,0))',
    '.Mui-focusVisible &': {
        outline: '2px auto rgba(19,124,189,.6)',
        outlineOffset: 2,
    },
    'input:hover ~ &': {
        backgroundColor: '#ebf1f5',
    },
    'input:disabled ~ &': {
        boxShadow: 'none',
        background: 'rgba(206,217,224,.5)',
    },
}));

const BpCheckedIcon = styled(BpIcon)({
    backgroundColor: '#137cbd',
    backgroundImage: 'linear-gradient(180deg,hsla(0,0%,100%,.1),hsla(0,0%,100%,0))',
    '&::before': {
        display: 'block',
        width: 16,
        height: 16,
        backgroundImage: 'radial-gradient(#fff,#fff 28%,transparent 32%)',
        content: '""',
    },
    'input:hover ~ &': {
        backgroundColor: '#106ba3',
    },
});

// Rádio personalizado
function BpRadio(props: RadioProps) {
    return (
        <Radio
            disableRipple
            color="default"
            checkedIcon={<BpCheckedIcon />}
            icon={<BpIcon />}
            {...props}
        />
    );
}

// Componente integrado com React Hook Form
type TVRadioGroupProps = {
    name: string;
    options: { value: string | number; label: string }[];
    label?: string;
    row?: boolean;
    labelPosition?: 'top' | 'bottom' | 'end' | 'start';
};

export const VRadioGroup: React.FC<TVRadioGroupProps> = ({ labelPosition = 'bottom', row = true, name, options, label }) => {
    const { control } = useFormContext();

    return (
        <FormControl component="fieldset">
            {label && <FormLabel>{label}</FormLabel>}
           
                <Controller


                    name={name}
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                        <>
                            <RadioGroup row={row}  {...field} value={field.value ?? ''}>
                                {options.map((option) => (
                                    <FormControlLabel
                                        labelPlacement={labelPosition}
                                        
                                        key={option.value}
                                        value={option.value}
                                        control={<BpRadio />}
                                        label={option.label}
                                    />
                                ))}
                            </RadioGroup>
                            {error && <span style={{ color: 'red' }}>{error.message}</span>}
                        </>
                    )}
                />
            
        </FormControl>
    );
};
