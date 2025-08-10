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
  onSelectNome?: (nome: string) => void;
}

export function CampoNomeJogo({ field, isLoading, error, helperText, onSelectNome }: CampoNomeJogoProps) {
  const [nomesJogos, setNomesJogos] = useState<string[]>([]);
  const inputValue = field.value || "";
  const showOptions = inputValue.length >= 2;
  const options = showOptions
    ? nomesJogos.filter(n => n.toLowerCase().includes(inputValue.toLowerCase())).slice(0, 10)
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
            const nomes = titleHistory.titles.map((t: any) => t.name).filter(Boolean);
            nomes.sort((a: string, b: string) => a.localeCompare(b));
            setNomesJogos(nomes);
            return;
          }
        }
      }
    } catch { }
    // Se não achou no localStorage, busca do jogos.json
    fetch('/imagens/jogos.json')
      .then((res) => res.json())
      .then((arquivos: string[]) => {
        const nomes = arquivos.map(a => a.replace(/\.jpg$/i, ""));
        nomes.sort((a, b) => a.localeCompare(b));
        setNomesJogos(nomes);
      })
      .catch(() => setNomesJogos([]));
  }, []);

  const handleInputChange = (_: any, newValue: string) => {
    field.onChange(newValue);
    setOpen(newValue.length >= 2 && options.length > 0);
  };
  const handleChange = (_: any, value: string | null) => {
    field.onChange(value ?? "");
    setOpen(false);
    if (inputRef.current) inputRef.current.blur();
    if (value && typeof value === 'string' && value.length > 0 && typeof onSelectNome === 'function') {
      onSelectNome(value);
    }
  };
  const handleBlur = () => {
    setOpen(false);
  };

  return (
    <Autocomplete
      freeSolo
      options={nomesJogos}
      inputValue={inputValue}
      open={open}
      filterOptions={(opts, state) => {
        const val = state.inputValue.toLowerCase();
        if (val.length < 3) return [];
        return opts.filter(n => n.toLowerCase().includes(val)).slice(0, 10);
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