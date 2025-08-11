import { Autocomplete, TextField, InputAdornment, IconButton, Avatar, Box, CircularProgress } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import React, { useState } from 'react';
import { AuthService } from '../../../services/api/auth/AuthService';
import { Close } from '@mui/icons-material';

export interface GamertagOption {
    xuid: string;
    uniqueModernGamertag: string;
    modernGamertag: string;
    displayPicRaw: string;
}

interface CampoGamertagProps {
    value: string;
    onChange: (gamertag: string, xuid: string | null, displayPicRaw?: string | null) => void;
    disabled?: boolean;
    error?: boolean;
    helperText?: string;
}

export const CampoGamertag: React.FC<CampoGamertagProps> = ({ value, onChange, disabled, error, helperText }) => {
    const [options, setOptions] = useState<GamertagOption[]>([]);
    const [inputValue, setInputValue] = useState(value || '');
    const [loading, setLoading] = useState(false);
    const [searchClicked, setSearchClicked] = useState(false);
    const [locked, setLocked] = useState(!!value && value.trim() !== '');

    React.useEffect(() => {
        setLocked(!!value && value.trim() !== '');
    }, [value]);

    const [lastSearched, setLastSearched] = useState<string | null>(null);

    const handleSearch = async () => {
        if (!inputValue) return;
        if (lastSearched === inputValue) return; // Não busca se não mudou
        setLoading(true);
        setSearchClicked(true);
        setLastSearched(inputValue);
        try {
            const res = await AuthService.getGamertag(inputValue);
            if (res && Array.isArray(res.people)) {
                setOptions(res.people.map((p: any) => ({
                    xuid: p.xuid,
                    uniqueModernGamertag: p.uniqueModernGamertag,
                    modernGamertag: p.modernGamertag,
                    displayPicRaw: p.displayPicRaw,
                })));
            } else {
                setOptions([]);
            }
        } catch {
            setOptions([]);
        }
        setLoading(false);
    };

    const handleChange = (_: any, option: any) => {
        if (typeof option === 'string') {
            onChange(option, null, null);
            setLocked(false);
        } else if (option) {
            onChange(option.modernGamertag, option.xuid, option.displayPicRaw);
            setLocked(true);
        } else {
            onChange('', null, null);
            setLocked(false);
        }
    };

    const handleUnlock = () => {
        setLocked(false);
        setInputValue('');
        setOptions([]);
        setLastSearched(null);
        onChange('', null, null);
    };

    return (
        <Autocomplete
            freeSolo
            options={options}
            getOptionLabel={(option) => typeof option === 'string' ? option : option.uniqueModernGamertag}
            filterOptions={(opts) => opts}
            value={options.find(o => o.modernGamertag === value) || value}
            inputValue={inputValue}
            onInputChange={(_, newValue) => setInputValue(newValue)}
            onChange={handleChange}
            disabled={disabled || locked}
            loading={loading}
            renderOption={(props, option) => (
                <Box component="li" {...props} key={option.xuid} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar src={option.displayPicRaw} sx={{ width: 32, height: 32 }} />
                    <Box>
                        <Box fontWeight="bold">{option.uniqueModernGamertag}</Box>
                        <Box fontSize={12} color="text.secondary">{option.modernGamertag}</Box>
                    </Box>
                </Box>
            )}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="Gamertag"
                    error={error}
                    helperText={helperText}
                    disabled={disabled || locked}
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <InputAdornment position="end">
                                {loading ? <CircularProgress size={20} /> : null}
                                {locked ? (
                                    <IconButton onClick={handleUnlock} size="small" title="Alterar gamertag" edge="end">
                                        <Close fontSize="small" />
                                    </IconButton>
                                ) : (
                                    <IconButton onClick={handleSearch} disabled={loading || !inputValue || locked} edge="end">
                                        <SearchIcon />
                                    </IconButton>
                                )}
                            </InputAdornment>
                        ),
                    }}
                />
            )}
            noOptionsText={searchClicked ? 'Nenhum resultado encontrado' : 'Digite e clique na lupa para buscar'}
        />
    );
};
