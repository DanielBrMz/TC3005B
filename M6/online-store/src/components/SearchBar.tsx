import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface SearchBarProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    initialValue?: string;
}

export const SearchBar = ({ value, onChange, placeholder = "Search products...", initialValue = "" }: SearchBarProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const navigate = useNavigate();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (value.trim()) {
            navigate(`/products?q=${encodeURIComponent(value)}`);
        }
    };

    // Auto-collapse search on mobile when query is empty
    useEffect(() => {
        if (!value && window.innerWidth < 768) {
            setIsExpanded(false);
        }
    }, [value]);

    useEffect(() => {
        if (initialValue) {
            onChange({ target: { value: initialValue } } as React.ChangeEvent<HTMLInputElement>);
        }
    }, [initialValue, onChange]);

    return (
        <form
            className={`search-bar ${isExpanded ? 'expanded' : ''}`}
            onSubmit={handleSearch}
        >
            {isExpanded && (
                <input
                    type="text"
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    autoFocus
                    className="search-input"
                />
            )}

            <button
                type={isExpanded ? 'submit' : 'button'}
                className="search-button"
                onClick={() => !isExpanded && setIsExpanded(true)}
                aria-label={isExpanded ? 'Submit search' : 'Open search'}
            >
                🔍
            </button>
        </form>
    );
};