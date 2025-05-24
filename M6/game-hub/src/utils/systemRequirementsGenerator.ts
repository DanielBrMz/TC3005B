import type { GameDetail, Game } from "../types/game";

interface SystemRequirements {
  minimum: RequirementSet;
  recommended: RequirementSet;
}

interface RequirementSet {
  os: string;
  processor: string;
  memory: string;
  graphics: string;
  storage: string;
  directx?: string;
  network?: string;
  additional?: string;
}

/**
 * This class generates realistic system requirements based on game characteristics
 * It considers factors like release date, genres, and visual complexity
 */
export class SystemRequirementsGenerator {
  private requirementsCache: Map<number, SystemRequirements> = new Map();

  // Operating system requirements based on release year
  private readonly OS_REQUIREMENTS = {
    MODERN: { min: "Windows 10 64-bit", rec: "Windows 11 64-bit" },
    RECENT: { min: "Windows 8.1 64-bit", rec: "Windows 10 64-bit" },
    OLDER: { min: "Windows 7 64-bit", rec: "Windows 10 64-bit" },
    LEGACY: { min: "Windows XP SP3", rec: "Windows 7 64-bit" },
  };

  // Processor requirements based on game complexity and age
  private readonly PROCESSOR_REQUIREMENTS = {
    HIGH_END: {
      min: "Intel Core i5-8400 / AMD Ryzen 5 2600",
      rec: "Intel Core i7-10700K / AMD Ryzen 7 3700X",
    },
    MODERN: {
      min: "Intel Core i5-6600K / AMD Ryzen 5 1600",
      rec: "Intel Core i7-8700K / AMD Ryzen 5 3600",
    },
    STANDARD: {
      min: "Intel Core i5-3470 / AMD FX-6300",
      rec: "Intel Core i5-6600 / AMD Ryzen 5 2600",
    },
    LOW_END: {
      min: "Intel Core i3-4130 / AMD FX-4300",
      rec: "Intel Core i5-4590 / AMD FX-8320",
    },
    LEGACY: {
      min: "Intel Core 2 Duo E8400 / AMD Athlon 64 X2 6000+",
      rec: "Intel Core i3-2100 / AMD Phenom II X4 965",
    },
  };

  // Memory requirements based on game complexity
  private readonly MEMORY_REQUIREMENTS = {
    ULTRA: { min: "16 GB RAM", rec: "32 GB RAM" },
    HIGH: { min: "12 GB RAM", rec: "16 GB RAM" },
    STANDARD: { min: "8 GB RAM", rec: "16 GB RAM" },
    MODERATE: { min: "6 GB RAM", rec: "8 GB RAM" },
    LOW: { min: "4 GB RAM", rec: "6 GB RAM" },
    MINIMAL: { min: "2 GB RAM", rec: "4 GB RAM" },
  };

  // Graphics requirements based on visual complexity and age
  private readonly GRAPHICS_REQUIREMENTS = {
    CUTTING_EDGE: {
      min: "NVIDIA RTX 3060 / AMD RX 6600 XT",
      rec: "NVIDIA RTX 4070 / AMD RX 7700 XT",
    },
    HIGH_END: {
      min: "NVIDIA GTX 1070 / AMD RX 580",
      rec: "NVIDIA RTX 3070 / AMD RX 6700 XT",
    },
    MODERN: {
      min: "NVIDIA GTX 1060 / AMD RX 570",
      rec: "NVIDIA RTX 2070 / AMD RX 6600",
    },
    STANDARD: {
      min: "NVIDIA GTX 960 / AMD R9 280",
      rec: "NVIDIA GTX 1660 / AMD RX 580",
    },
    MODERATE: {
      min: "NVIDIA GTX 750 Ti / AMD R7 260X",
      rec: "NVIDIA GTX 1050 / AMD RX 560",
    },
    LOW: {
      min: "NVIDIA GTX 650 / AMD HD 7770",
      rec: "NVIDIA GTX 750 Ti / AMD R7 260X",
    },
    INTEGRATED: {
      min: "Intel HD Graphics 4000 / AMD APU",
      rec: "Intel UHD Graphics 630 / AMD Vega 8",
    },
  };

  // Storage requirements based on game type and complexity
  private readonly STORAGE_REQUIREMENTS = {
    MASSIVE: { min: "150 GB", rec: "150 GB (SSD recommended)" },
    LARGE: { min: "100 GB", rec: "100 GB (SSD recommended)" },
    SUBSTANTIAL: { min: "75 GB", rec: "75 GB (SSD recommended)" },
    STANDARD: { min: "50 GB", rec: "50 GB (SSD recommended)" },
    MODERATE: { min: "25 GB", rec: "30 GB available space" },
    SMALL: { min: "15 GB", rec: "20 GB available space" },
    MINIMAL: { min: "5 GB", rec: "10 GB available space" },
  };

  /**
   * Generates realistic system requirements for a given game
   */
  generateRequirements(game: Game | GameDetail): SystemRequirements {
    // Check cache first for consistency
    if (this.requirementsCache.has(game.id)) {
      return this.requirementsCache.get(game.id)!;
    }

    const complexity = this.analyzeGameComplexity(game);
    const requirements = this.buildRequirements(game, complexity);

    // Cache the result
    this.requirementsCache.set(game.id, requirements);

    return requirements;
  }

  /**
   * Analyzes game complexity based on various factors
   */
  private analyzeGameComplexity(game: Game | GameDetail): string {
    let complexityScore = 0;

    // Age factor - newer games typically require more powerful hardware
    const ageScore = this.calculateAgeComplexity(game);
    complexityScore += ageScore;

    // Genre factor - some genres are more demanding than others
    const genreScore = this.calculateGenreComplexity(game);
    complexityScore += genreScore;

    // Platform factor - more platforms might indicate broader optimization
    const platformScore = this.calculatePlatformComplexity(game);
    complexityScore += platformScore;

    // Rating factor - higher-rated games might have better production values
    const ratingScore = this.calculateRatingComplexity(game);
    complexityScore += ratingScore;

    // Convert score to complexity tier
    return this.scoreToComplexityTier(complexityScore);
  }

  /**
   * Calculates complexity based on game age
   */
  private calculateAgeComplexity(game: Game | GameDetail): number {
    if (!game.released) return 2; // Default moderate score

    const releaseYear = new Date(game.released).getFullYear();
    const currentYear = new Date().getFullYear();
    const age = currentYear - releaseYear;

    if (age <= 1) return 5; // Very new games
    if (age <= 3) return 4; // Recent games
    if (age <= 5) return 3; // Moderately old games
    if (age <= 8) return 2; // Older games
    return 1; // Very old games
  }

  /**
   * Calculates complexity based on game genres
   */
  private calculateGenreComplexity(game: Game | GameDetail): number {
    if (!game.genres || game.genres.length === 0) return 2;

    const genreComplexityMap: { [key: string]: number } = {
      action: 4,
      shooter: 5,
      "role-playing-games-rpg": 4,
      simulation: 3,
      strategy: 3,
      racing: 4,
      sports: 3,
      adventure: 3,
      fighting: 3,
      platformer: 2,
      puzzle: 1,
      indie: 1,
      casual: 1,
    };

    const genreScores = game.genres.map(
      (genre) => genreComplexityMap[genre.slug] || 2
    );

    return Math.max(...genreScores); // Use the highest complexity genre
  }

  /**
   * Calculates complexity based on platform availability
   */
  private calculatePlatformComplexity(game: Game | GameDetail): number {
    const platformCount = game.platforms?.length || 1;

    // More platforms might indicate better optimization and broader appeal
    if (platformCount >= 6) return 1; // Well-optimized across many platforms
    if (platformCount >= 4) return 2; // Good optimization
    if (platformCount >= 2) return 3; // Moderate optimization
    return 4; // Single platform, might be more demanding
  }

  /**
   * Calculates complexity based on game rating
   */
  private calculateRatingComplexity(game: Game | GameDetail): number {
    const rating = game.rating;

    // Higher-rated games might have better production values and be more demanding
    if (rating >= 4.5) return 2; // Excellent games might be optimized well
    if (rating >= 4.0) return 1; // Great games with good optimization
    if (rating >= 3.5) return 0; // Good games, average requirements
    return -1; // Lower-rated games might be less demanding
  }

  /**
   * Converts complexity score to tier name
   */
  private scoreToComplexityTier(score: number): string {
    if (score >= 12) return "CUTTING_EDGE";
    if (score >= 10) return "HIGH_END";
    if (score >= 8) return "MODERN";
    if (score >= 6) return "STANDARD";
    if (score >= 4) return "MODERATE";
    if (score >= 2) return "LOW";
    return "INTEGRATED";
  }

  /**
   * Builds the complete requirements object
   */
  private buildRequirements(
    game: Game | GameDetail,
    complexity: string
  ): SystemRequirements {
    const osReq = this.getOSRequirements(game);
    const processorReq = this.getProcessorRequirements(complexity);
    const memoryReq = this.getMemoryRequirements(complexity);
    const graphicsReq = this.getGraphicsRequirements(complexity);
    const storageReq = this.getStorageRequirements(game, complexity);

    return {
      minimum: {
        os: osReq.min,
        processor: processorReq.min,
        memory: memoryReq.min,
        graphics: graphicsReq.min,
        storage: storageReq.min,
        directx: this.getDirectXRequirement(game),
        network: this.getNetworkRequirement(game),
        additional: this.getAdditionalRequirements(game),
      },
      recommended: {
        os: osReq.rec,
        processor: processorReq.rec,
        memory: memoryReq.rec,
        graphics: graphicsReq.rec,
        storage: storageReq.rec,
        directx: this.getDirectXRequirement(game, true),
        network: this.getNetworkRequirement(game),
        additional: this.getAdditionalRequirements(game, true),
      },
    };
  }

  /**
   * Gets OS requirements based on release date
   */
  private getOSRequirements(game: Game | GameDetail) {
    if (!game.released) return this.OS_REQUIREMENTS.MODERN;

    const releaseYear = new Date(game.released).getFullYear();
    const currentYear = new Date().getFullYear();
    const age = currentYear - releaseYear;

    if (age <= 2) return this.OS_REQUIREMENTS.MODERN;
    if (age <= 5) return this.OS_REQUIREMENTS.RECENT;
    if (age <= 10) return this.OS_REQUIREMENTS.OLDER;
    return this.OS_REQUIREMENTS.LEGACY;
  }

  /**
   * Gets processor requirements based on complexity
   */
  private getProcessorRequirements(complexity: string) {
    switch (complexity) {
      case "CUTTING_EDGE":
        return this.PROCESSOR_REQUIREMENTS.HIGH_END;
      case "HIGH_END":
        return this.PROCESSOR_REQUIREMENTS.MODERN;
      case "MODERN":
        return this.PROCESSOR_REQUIREMENTS.MODERN;
      case "STANDARD":
        return this.PROCESSOR_REQUIREMENTS.STANDARD;
      case "MODERATE":
        return this.PROCESSOR_REQUIREMENTS.LOW_END;
      case "LOW":
        return this.PROCESSOR_REQUIREMENTS.LOW_END;
      default:
        return this.PROCESSOR_REQUIREMENTS.LEGACY;
    }
  }

  /**
   * Gets memory requirements based on complexity
   */
  private getMemoryRequirements(complexity: string) {
    switch (complexity) {
      case "CUTTING_EDGE":
        return this.MEMORY_REQUIREMENTS.ULTRA;
      case "HIGH_END":
        return this.MEMORY_REQUIREMENTS.HIGH;
      case "MODERN":
        return this.MEMORY_REQUIREMENTS.STANDARD;
      case "STANDARD":
        return this.MEMORY_REQUIREMENTS.STANDARD;
      case "MODERATE":
        return this.MEMORY_REQUIREMENTS.MODERATE;
      case "LOW":
        return this.MEMORY_REQUIREMENTS.LOW;
      default:
        return this.MEMORY_REQUIREMENTS.MINIMAL;
    }
  }

  /**
   * Gets graphics requirements based on complexity
   */
  private getGraphicsRequirements(complexity: string) {
    switch (complexity) {
      case "CUTTING_EDGE":
        return this.GRAPHICS_REQUIREMENTS.CUTTING_EDGE;
      case "HIGH_END":
        return this.GRAPHICS_REQUIREMENTS.HIGH_END;
      case "MODERN":
        return this.GRAPHICS_REQUIREMENTS.MODERN;
      case "STANDARD":
        return this.GRAPHICS_REQUIREMENTS.STANDARD;
      case "MODERATE":
        return this.GRAPHICS_REQUIREMENTS.MODERATE;
      case "LOW":
        return this.GRAPHICS_REQUIREMENTS.LOW;
      default:
        return this.GRAPHICS_REQUIREMENTS.INTEGRATED;
    }
  }

  /**
   * Gets storage requirements based on game characteristics
   */
  private getStorageRequirements(game: Game | GameDetail, complexity: string) {
    // Determine storage needs based on genre and complexity
    const hasLargeAssets =
      game.genres?.some((genre) =>
        ["action", "shooter", "role-playing-games-rpg", "racing"].includes(
          genre.slug
        )
      ) || false;

    const isModern =
      game.released && new Date(game.released).getFullYear() >= 2020;

    if (complexity === "CUTTING_EDGE" && hasLargeAssets)
      return this.STORAGE_REQUIREMENTS.MASSIVE;
    if (
      (complexity === "HIGH_END" || complexity === "MODERN") &&
      hasLargeAssets
    )
      return this.STORAGE_REQUIREMENTS.LARGE;
    if (hasLargeAssets || isModern)
      return this.STORAGE_REQUIREMENTS.SUBSTANTIAL;
    if (complexity === "STANDARD") return this.STORAGE_REQUIREMENTS.STANDARD;
    if (complexity === "MODERATE") return this.STORAGE_REQUIREMENTS.MODERATE;
    if (complexity === "LOW") return this.STORAGE_REQUIREMENTS.SMALL;
    return this.STORAGE_REQUIREMENTS.MINIMAL;
  }

  /**
   * Gets DirectX requirements
   */
  private getDirectXRequirement(
    game: Game | GameDetail,
    recommended: boolean = false
  ): string {
    if (!game.released) return "DirectX 11";

    const releaseYear = new Date(game.released).getFullYear();

    if (releaseYear >= 2020) return recommended ? "DirectX 12" : "DirectX 11";
    if (releaseYear >= 2015) return "DirectX 11";
    if (releaseYear >= 2010) return "DirectX 10";
    return "DirectX 9.0c";
  }

  /**
   * Gets network requirements for multiplayer games
   */
  private getNetworkRequirement(game: Game | GameDetail): string | undefined {
    const hasMultiplayerGenres =
      game.genres?.some((genre) =>
        ["shooter", "sports", "racing", "fighting"].includes(genre.slug)
      ) || false;

    if (hasMultiplayerGenres) {
      return "Broadband Internet connection required for online play";
    }

    return undefined;
  }

  /**
   * Gets additional requirements
   */
  private getAdditionalRequirements(
    game: Game | GameDetail,
    recommended: boolean = false
  ): string | undefined {
    const requirements: string[] = [];

    // Add specific requirements based on genres
    if (game.genres?.some((genre) => genre.slug === "racing")) {
      requirements.push("Controller support recommended");
    }

    if (
      game.genres?.some((genre) => ["shooter", "action"].includes(genre.slug))
    ) {
      if (recommended) {
        requirements.push(
          "Dedicated graphics card recommended for optimal performance"
        );
      }
    }

    if (game.released && new Date(game.released).getFullYear() >= 2022) {
      requirements.push("Latest graphics drivers recommended");
    }

    return requirements.length > 0 ? requirements.join("; ") : undefined;
  }
}

// Create a singleton instance
export const systemRequirementsGenerator = new SystemRequirementsGenerator();
