import { useState } from 'react';

type RatingStarsProps = {
    rating: number;
    interactive?: boolean;
    onChange?: (rating: number) => void;
};

export const RatingStars = ({
                                rating,
                                interactive = false,
                                onChange
                            }: RatingStarsProps) => {
    const [hoverRating, setHoverRating] = useState(0);

    return (
        <div className="rating-stars">
            {[1, 2, 3, 4, 5].map((star) => (
                <span
                    key={star}
                    className={`star ${star <= (hoverRating || rating) ? 'filled' : ''}`}
                    onMouseEnter={interactive ? () => setHoverRating(star) : undefined}
                    onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
                    onClick={interactive ? () => onChange?.(star) : undefined}
                >
          {star <= (hoverRating || rating) ? '★' : '☆'}
        </span>
            ))}
        </div>
    );
};