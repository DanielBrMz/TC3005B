import { useState } from 'react';
import NEIGHBORHOODS from '../assets/mexico-cp.json';

interface PostalCodeData {
  estado: string;
  municipio: string;
  ciudad: string;
  colonia: string;
  codigo: string; // Adding postal code to the data
}

interface PostalCodeLookupProps {
  onSelect: (data: {
    city: string;
    postalCode: string | undefined;
    municipality: string;
    state: string;
    neighborhood: string
  }) => void;
  initialValue?: string;
}

export const PostalCodeLookup = ({ onSelect, initialValue = '' }: PostalCodeLookupProps) => {
  const [postalCode, setPostalCode] = useState(initialValue);
  const [results, setResults] = useState<PostalCodeData[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = () => {
    setResults([]);
    setError(null);
    if (!/^\d{5}$/.test(postalCode as string)) {
      setError('Invalid ZIP Code (must be 5 digits)');
      return;
    }
    const neighborhoods = NEIGHBORHOODS[postalCode as keyof typeof NEIGHBORHOODS] as PostalCodeData[] | undefined;
    if (!neighborhoods || neighborhoods.length === 0) {
      setError('ZIP Code not found');
      return;
    }
    const sortedneighborhoods = [...neighborhoods].sort((a, b) =>
      a.colonia.localeCompare(b.colonia)
    );
    setResults(sortedneighborhoods);
  };

  const handleSelect = (result: PostalCodeData) => {
    onSelect({
      postalCode: result.codigo || postalCode,
      state: result.estado,
      municipality: result.municipio,
      city: result.ciudad,
      neighborhood: result.colonia
    });
    // Clear results after selection
    setResults([]);
    // Keep the postal code displayed
    setPostalCode(result.codigo || postalCode);
  };

  return (
    <div className="postal-code-lookup">
      <div className="search-container">
        <input
          type="text"
          value={postalCode!}
          onChange={(e) => setPostalCode(e.target.value)}
          placeholder="Código Postal (5 dígitos)"
          maxLength={5}
        />
        <button
          type="button"
          onClick={handleSearch}
          disabled={postalCode!.length !== 5}
        >
          Search
        </button>
      </div>
      {error && <div className="error-message">{error}</div>}
      {results.length > 0 && (
        <div className="results">
          {results.map((result, index) => (
            <div
              key={`${result.codigo}-${index}`}
              className="result-item"
              onClick={() => handleSelect(result)}
            >
              <strong>{result.colonia}</strong>
              <div>
                {result.ciudad}, {result.municipio}, {result.estado}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};