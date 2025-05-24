import type { GameDetail, Game } from '../types/game';

interface PriceFactors {
  basePrice: number;
  ageMultiplier: number;
  ratingMultiplier: number;
  genreMultiplier: number;
  platformMultiplier: number;
  popularityMultiplier: number;
}

// This class generates intelligent, consistent pricing based on game characteristics
export class IntelligentPriceGenerator {
  private priceCache: Map<number, number> = new Map();

  // Base price tiers based on game characteristics
  private readonly BASE_PRICES = {
    AAA: 59.99,          // Major studio releases
    INDIE: 19.99,        // Independent games
    RETRO: 9.99,         // Older or simple games
    PREMIUM: 69.99,      // Latest blockbusters
    BUDGET: 14.99        // Mid-tier games
  };

  // Genre-based price modifiers help determine game complexity and target market
  private readonly GENRE_MODIFIERS = {
    'action': 1.2,           // Action games often have higher production values
    'adventure': 1.1,        // Story-driven games with moderate complexity
    'role-playing-games-rpg': 1.3,  // RPGs typically offer extensive content
    'strategy': 1.15,        // Strategy games have niche but dedicated audiences
    'shooter': 1.25,         // Shooters often have high production costs
    'sports': 1.1,           // Sports games have consistent pricing
    'racing': 1.05,          // Racing games vary widely in scope
    'fighting': 1.0,         // Fighting games have moderate production costs
    'puzzle': 0.7,           // Puzzle games typically cost less
    'platformer': 0.85,      // Platform games often target broader audiences
    'simulation': 0.95,      // Simulation games have varying complexity
    'indie': 0.6,            // Indie games generally cost less
    'casual': 0.5            // Casual games have the lowest price points
  };

  // Age-based depreciation reflects how game prices typically decrease over time
  private readonly AGE_DEPRECIATION = {
    NEW: 1.0,        // Released within last year
    RECENT: 0.8,     // 1-3 years old
    MATURE: 0.6,     // 3-5 years old  
    OLD: 0.4,        // 5-10 years old
    VINTAGE: 0.2,    // Over 10 years old
    AVERAGE: 0.7     // For games with unknown release date
  };

  // Rating multipliers reflect market demand for higher-quality games
  private readonly RATING_MULTIPLIERS = {
    EXCELLENT: 1.2,  // 4.5+ rating
    GREAT: 1.1,      // 4.0-4.5 rating
    GOOD: 1.0,       // 3.5-4.0 rating
    AVERAGE: 0.9,    // 3.0-3.5 rating
    POOR: 0.7        // Below 3.0 rating
  };

  /**
   * Generates a realistic price for a game based on its characteristics
   * This method ensures the same game always gets the same price
   */
  generatePrice(game: Game | GameDetail): number {
    // Check cache first to ensure consistency
    if (this.priceCache.has(game.id)) {
      return this.priceCache.get(game.id)!;
    }

    const factors = this.calculatePriceFactors(game);
    const finalPrice = this.computeFinalPrice(factors);
    
    // Cache the result for consistency
    this.priceCache.set(game.id, finalPrice);
    
    return finalPrice;
  }

  /**
   * Calculates all pricing factors for a given game
   */
  private calculatePriceFactors(game: Game | GameDetail): PriceFactors {
    return {
      basePrice: this.determineBasePrice(game),
      ageMultiplier: this.calculateAgeMultiplier(game),
      ratingMultiplier: this.calculateRatingMultiplier(game),
      genreMultiplier: this.calculateGenreMultiplier(game),
      platformMultiplier: this.calculatePlatformMultiplier(game),
      popularityMultiplier: this.calculatePopularityMultiplier(game)
    };
  }

  /**
   * Determines the base price tier for a game based on its characteristics
   */
  private determineBasePrice(game: Game | GameDetail): number {
    // Check if it's likely an indie game (fewer platforms, specific genres)
    const isLikelyIndie = this.isLikelyIndieGame(game);
    if (isLikelyIndie) {
      return this.BASE_PRICES.INDIE;
    }

    // Check for premium indicators (recent release, high rating, AAA genres)
    const isPremium = this.isPremiumGame(game);
    if (isPremium) {
      return this.BASE_PRICES.PREMIUM;
    }

    // Check for AAA indicators (many platforms, popular genres, high ratings)
    const isAAA = this.isAAAGame(game);
    if (isAAA) {
      return this.BASE_PRICES.AAA;
    }

    // Default to budget tier
    return this.BASE_PRICES.BUDGET;
  }

  /**
   * Determines if a game is likely an indie production
   */
  private isLikelyIndieGame(game: Game | GameDetail): boolean {
    const hasIndieGenres = game.genres?.some(genre => 
      ['indie', 'puzzle', 'casual'].includes(genre.slug)
    ) || false;
    
    const hasLimitedPlatforms = (game.platforms?.length || 0) <= 3;
    
    return hasIndieGenres || hasLimitedPlatforms;
  }

  /**
   * Determines if a game is likely a premium/latest release
   */
  private isPremiumGame(game: Game | GameDetail): boolean {
    const currentYear = new Date().getFullYear();
    const releaseYear = game.released ? new Date(game.released).getFullYear() : 0;
    const isRecent = currentYear - releaseYear <= 1;
    const hasHighRating = game.rating >= 4.5;
    
    return isRecent && hasHighRating;
  }

  /**
   * Determines if a game is likely a AAA production
   */
  private isAAAGame(game: Game | GameDetail): boolean {
    const hasManyPlatforms = (game.platforms?.length || 0) >= 4;
    const hasAAAGenres = game.genres?.some(genre => 
      ['action', 'shooter', 'role-playing-games-rpg'].includes(genre.slug)
    ) || false;
    const hasGoodRating = game.rating >= 4.0;
    
    return hasManyPlatforms && hasAAAGenres && hasGoodRating;
  }

  /**
   * Calculates age-based price depreciation
   */
  private calculateAgeMultiplier(game: Game | GameDetail): number {
    if (!game.released) return this.AGE_DEPRECIATION.AVERAGE;
    
    const releaseDate = new Date(game.released);
    const currentDate = new Date();
    const ageInYears = (currentDate.getTime() - releaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
    
    if (ageInYears <= 1) return this.AGE_DEPRECIATION.NEW;
    if (ageInYears <= 3) return this.AGE_DEPRECIATION.RECENT;
    if (ageInYears <= 5) return this.AGE_DEPRECIATION.MATURE;
    if (ageInYears <= 10) return this.AGE_DEPRECIATION.OLD;
    return this.AGE_DEPRECIATION.VINTAGE;
  }

  /**
   * Calculates rating-based price multiplier
   */
  private calculateRatingMultiplier(game: Game | GameDetail): number {
    const rating = game.rating;
    
    if (rating >= 4.5) return this.RATING_MULTIPLIERS.EXCELLENT;
    if (rating >= 4.0) return this.RATING_MULTIPLIERS.GREAT;
    if (rating >= 3.5) return this.RATING_MULTIPLIERS.GOOD;
    if (rating >= 3.0) return this.RATING_MULTIPLIERS.AVERAGE;
    return this.RATING_MULTIPLIERS.POOR;
  }

  /**
   * Calculates genre-based price multiplier
   */
  private calculateGenreMultiplier(game: Game | GameDetail): number {
    if (!game.genres || game.genres.length === 0) return 1.0;
    
    // Use the highest multiplier from all genres
    const multipliers = game.genres.map(genre => 
      this.GENRE_MODIFIERS[genre.slug as keyof typeof this.GENRE_MODIFIERS] || 1.0
    );
    
    return Math.max(...multipliers);
  }

  /**
   * Calculates platform availability multiplier
   */
  private calculatePlatformMultiplier(game: Game | GameDetail): number {
    const platformCount = game.platforms?.length || 1;
    
    // More platforms generally indicate broader appeal and higher value
    if (platformCount >= 6) return 1.1;
    if (platformCount >= 4) return 1.05;
    if (platformCount >= 2) return 1.0;
    return 0.95; // Single platform games might be more niche
  }

  /**
   * Calculates popularity-based multiplier using rating as a proxy
   */
  private calculatePopularityMultiplier(game: Game | GameDetail): number {
    // In a real application, you might use review counts, sales data, etc.
    // Here we use rating and platform count as popularity indicators
    const rating = game.rating;
    const platformCount = game.platforms?.length || 1;
    
    const popularityScore = (rating / 5) * 0.7 + (Math.min(platformCount, 8) / 8) * 0.3;
    
    return 0.8 + (popularityScore * 0.4); // Range from 0.8 to 1.2
  }

  /**
   * Computes the final price using all calculated factors
   */
  private computeFinalPrice(factors: PriceFactors): number {
    let price = factors.basePrice;
    
    // Apply all multipliers
    price *= factors.ageMultiplier;
    price *= factors.ratingMultiplier;
    price *= factors.genreMultiplier;
    price *= factors.platformMultiplier;
    price *= factors.popularityMultiplier;
    
    // Round to common price points (.99, .49, .95)
    return this.roundToCommonPricePoint(price);
  }

  /**
   * Rounds prices to common retail price points
   */
  private roundToCommonPricePoint(price: number): number {
    // Define common price points
    const pricePoints = [
      4.99, 9.99, 14.99, 19.99, 24.99, 29.99, 34.99, 39.99, 
      44.99, 49.99, 54.99, 59.99, 64.99, 69.99, 74.99, 79.99
    ];
    
    // Find the closest price point
    const closest = pricePoints.reduce((prev, curr) => 
      Math.abs(curr - price) < Math.abs(prev - price) ? curr : prev
    );
    
    return closest;
  }

  /**
   * Generates a discounted price for sales/promotions
   */
  generateDiscountedPrice(game: Game | GameDetail, discountPercent: number): { original: number; discounted: number; savings: number } {
    const originalPrice = this.generatePrice(game);
    const discountAmount = originalPrice * (discountPercent / 100);
    const discountedPrice = this.roundToCommonPricePoint(originalPrice - discountAmount);
    
    return {
      original: originalPrice,
      discounted: discountedPrice,
      savings: originalPrice - discountedPrice
    };
  }
}

// Create a singleton instance for consistent pricing across the application
export const priceGenerator = new IntelligentPriceGenerator();