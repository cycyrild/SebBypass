import { useState, useEffect, useImperativeHandle, forwardRef } from 'react';

interface JsonInputProps {
    defaultValue: string[];
    currentValue : string[] | undefined;
}

export interface JsonInputRef {
    setValidInput: (input: string[]) => void;
    getValidInput: () => string[];
}

export const JsonInput = forwardRef<JsonInputRef, JsonInputProps>(({ defaultValue, currentValue }, ref) => {
    const [input, setInput] = useState<string>(JSON.stringify(currentValue ? currentValue : defaultValue, null, 2));
    const [validInput, setValidInput] = useState<string[]>(currentValue ? currentValue : defaultValue);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        try {
            const parsedInput = JSON.parse(input);
            if (Array.isArray(parsedInput) && parsedInput.every(item => typeof item === 'string')) {
                setValidInput(parsedInput);
                setError(null);
            } else {
                setError('Invalid JSON array of strings');
            }
        } catch {
            setError('Invalid JSON format');
        }
    }, [input]);

    useImperativeHandle(ref, () => ({
        setValidInput: (newValidInput: string[]) => {
            setInput(JSON.stringify(newValidInput, null, 2));
            setValidInput(newValidInput);
        },
        getValidInput: () => validInput,
    }));

    return (
        <>
            <textarea
                className='request-filter-urls'
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={10}
                cols={50}
            />
            {error && <div style={{ color: 'red' }}>{error}</div>}
        </>

    );
});
