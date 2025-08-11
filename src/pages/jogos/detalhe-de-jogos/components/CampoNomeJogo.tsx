import { Autocomplete, TextField } from '@mui/material';
import { useEffect, useRef, useState } from 'react';

export interface CampoNomeJogoProps {
  field: {
    value: string;
    onChange: (value: string) => void;
  };
  isLoading: boolean;
  error?: boolean;
  helperText?: string;
  onSelectNome?: (nome: string, titleId: string | null) => void;
}

export function CampoNomeJogo({ field, isLoading, error, helperText, onSelectNome }: CampoNomeJogoProps) {
  const [options, setOptions] = useState<{ name: string; titleId: string | null }[]>([]);
  const inputValue = field.value || "";
  const showOptions = inputValue.length >= 2;
  const filteredOptions = showOptions
    ? options.filter(n => n.name.toLowerCase().includes(inputValue.toLowerCase())).slice(0, 10)
    : [];
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Tenta buscar do localStorage (titleHistory)
    try {
      const userStr = localStorage.getItem('APP_USER') || localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      if (user?.Xuid) {
        const titleHistoryStr = localStorage.getItem(`titleHistory_${user.Xuid}`);
        if (titleHistoryStr) {
          const titleHistory = JSON.parse(titleHistoryStr);
          if (Array.isArray(titleHistory.titles)) {
            const titlesArr = titleHistory.titles as Array<{ name: string; titleId?: string }>;
            const nomes = titlesArr.map(t => ({ name: t.name, titleId: t.titleId || null })).filter(t => !!t.name);
            nomes.sort((a, b) => a.name.localeCompare(b.name));
            setOptions(nomes);
            return;
          }
        }
      }
    } catch { }
    // Se não achou no localStorage, busca do jogos.json
    fetch('/imagens/jogos.json')
      .then((res) => res.json())
      .then((arquivos: string[]) => {
        const nomes = arquivos.map(a => ({ name: a.replace(/\.jpg$/i, ""), titleId: null }));
        nomes.sort((a, b) => a.name.localeCompare(b.name));
        setOptions(nomes);
      })
      .catch(() => setOptions([]));
  }, []);

  const handleInputChange = (_: any, newValue: string) => {
    field.onChange(newValue);
    setOpen(newValue.length >= 2 && filteredOptions.length > 0);
  };
  const handleChange = (_: any, value: string | { name: string; titleId: string | null } | null) => {
    let nome = "";
    let titleId: string | null = null;
    if (typeof value === 'string') {
      nome = value;
    } else if (value && typeof value === 'object') {
      nome = value.name;
      titleId = value.titleId;
    }
    field.onChange(nome);
    setOpen(false);
    if (inputRef.current) inputRef.current.blur();
    if (nome && typeof onSelectNome === 'function') {
      onSelectNome(nome, titleId);
    }
  };
  const handleBlur = () => {
    setOpen(false);
  };

  return (
    <Autocomplete
      freeSolo
      options={options}
      getOptionLabel={(option) => typeof option === 'string' ? option : option.name}
      inputValue={inputValue}
      open={open}
      filterOptions={(opts, state) => {
        const val = state.inputValue.toLowerCase();
        if (val.length < 3) return [];
        return opts.filter(n => n.name.toLowerCase().includes(val)).slice(0, 10);
      }}
      onInputChange={handleInputChange}
      onChange={handleChange}
      onBlur={handleBlur}
      renderInput={(params) => (
        <TextField
          {...params}
          inputRef={inputRef}
          label="Nome do Jogo"
          disabled={isLoading}
          error={error}
          helperText={helperText}
          fullWidth
        />
      )}
    />
  );
}