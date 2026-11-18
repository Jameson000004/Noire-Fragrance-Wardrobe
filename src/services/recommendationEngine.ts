import {
  Fragrance,
  Occasion,
  RecommendationFactor,
  RecommendationReasonCode,
  RecommendationResult,
  TimeOfDay,
  WearLog,
  WeatherContext,
} from '../types/fragrance';

/**
 * Classifies current hour into TimeOfDay:
 * Morning: 05:00 - 11:59
 * Afternoon: 12:00 - 16:59
 * Evening: 17:00 - 21:59
 * Late Night: 22:00 - 04:59
 */
export function getTimeOfDay(date: Date = new Date()): TimeOfDay {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return 'Morning';
  if (hour >= 12 && hour < 17) return 'Afternoon';
  if (hour >= 17 && hour < 22) return 'Evening';
  return 'Late Night';
}

export interface RecommendationContextInput {
  fragrances: Fragrance[];
  occasion: Occasion;
  weather?: WeatherContext;
  timeOfDay: TimeOfDay;
  wearLogs: WearLog[];
  preferredSeasons?: string[];
}

export function computeRecommendation(ctx: RecommendationContextInput): RecommendationResult | null {
  const activeFragrances = ctx.fragrances.filter((f) => !f.isArchived);

  if (activeFragrances.length === 0) {
    return null;
  }

  // Find recent wear logs (last 7 days)
  const recentWornIds = new Set(
    ctx.wearLogs
      .filter((log) => {
        const diff = Date.now() - new Date(log.wornAt).getTime();
        return diff < 48 * 60 * 60 * 1000; // last 48 hours gets penalty for diversity
      })
      .map((log) => log.fragranceId)
  );

  const scoredCandidates = activeFragrances.map((fragrance) => {
    const factors: RecommendationFactor[] = [];
    const reasonCodes: RecommendationReasonCode[] = [];
    const reasons: string[] = [];

    // Factor 1: Occasion (Weight 35)
    let occasionScore = 0.5; // neutral
    if (fragrance.tags.occasions && fragrance.tags.occasions.length > 0) {
      if (fragrance.tags.occasions.includes(ctx.occasion)) {
        occasionScore = 1.0;
        reasonCodes.push('occasionMatch');
        reasons.push(`Tailored for ${ctx.occasion.toLowerCase()}`);
      } else {
        occasionScore = 0.25;
      }
    }
    factors.push({
      factor: 'occasion',
      weight: 35,
      score: occasionScore,
      label: `Occasion: ${ctx.occasion}`,
    });

    // Factor 2: Weather / Temperature Suitability (Weight 30)
    let weatherScore = 0.5; // neutral
    if (ctx.weather) {
      const tempC = ctx.weather.temperatureC;
      const suit = fragrance.tags.temperatureSuitability;

      if (suit === 'Below 15°C') {
        if (tempC <= 16) {
          weatherScore = 1.0;
          reasonCodes.push('temperatureMatch');
          reasons.push(`Ideal for cooler temperatures (${Math.round(tempC)}°C)`);
        } else if (tempC <= 22) {
          weatherScore = 0.5;
        } else {
          weatherScore = 0.2;
        }
      } else if (suit === 'Above 24°C') {
        if (tempC >= 23) {
          weatherScore = 1.0;
          reasonCodes.push('temperatureMatch');
          reasons.push(`Refreshes in warm weather (${Math.round(tempC)}°C)`);
        } else if (tempC >= 18) {
          weatherScore = 0.6;
        } else {
          weatherScore = 0.3;
        }
      } else if (suit === '15°C - 24°C') {
        if (tempC >= 14 && tempC <= 25) {
          weatherScore = 1.0;
          reasonCodes.push('temperatureMatch');
          reasons.push(`Perfect for mild weather (${Math.round(tempC)}°C)`);
        } else {
          weatherScore = 0.6;
        }
      } else {
        // All temps
        weatherScore = 0.85;
      }

      // Check season alignment if applicable
      const isColdMonth = [9, 10, 11, 0, 1, 2].includes(new Date().getMonth());
      const currentSeason = isColdMonth ? 'Fall / Winter' : 'Spring / Summer';
      if (fragrance.tags.seasons.includes(currentSeason) || fragrance.tags.seasons.includes('All Seasons')) {
        weatherScore = Math.min(1.0, weatherScore + 0.1);
        reasonCodes.push('weatherSuitabilityMatch');
      }
    }
    factors.push({
      factor: 'weather',
      weight: 30,
      score: weatherScore,
      label: ctx.weather ? `${Math.round(ctx.weather.temperatureC)}°C · ${ctx.weather.condition}` : 'Neutral Weather',
    });

    // Factor 3: Time of Day Suitability (Weight 20)
    let timeScore = 0.5;
    if (fragrance.tags.timeOfDay && fragrance.tags.timeOfDay.length > 0) {
      if (fragrance.tags.timeOfDay.includes(ctx.timeOfDay)) {
        timeScore = 1.0;
        reasonCodes.push('timeOfDayMatch');
        reasons.push(`Complements the ${ctx.timeOfDay.toLowerCase()} mood`);
      } else {
        timeScore = 0.35;
      }
    }
    factors.push({
      factor: 'time',
      weight: 20,
      score: timeScore,
      label: `Time: ${ctx.timeOfDay}`,
    });

    // Factor 4: Wear-history diversity (Weight 15)
    let diversityScore = 1.0;
    if (recentWornIds.has(fragrance.id)) {
      diversityScore = 0.3; // Gentle rotation nudge
    } else {
      diversityScore = 1.0;
      if (fragrance.lastWornAt) {
        reasonCodes.push('rotationPreference');
        reasons.push('Refreshes your wearing rotation');
      }
    }
    factors.push({
      factor: 'diversity',
      weight: 15,
      score: diversityScore,
      label: recentWornIds.has(fragrance.id) ? 'Recently Worn' : 'Rotation Candidate',
    });

    // Total Normalized Score (0 to 100)
    const totalWeight = factors.reduce((acc, f) => acc + f.weight, 0);
    const weightedSum = factors.reduce((acc, f) => acc + f.weight * f.score, 0);
    const normalizedScore = Math.round((weightedSum / totalWeight) * 100);

    // Compute coverage
    const hasOccasions = Boolean(fragrance.tags.occasions?.length);
    const hasTime = Boolean(fragrance.tags.timeOfDay?.length);
    const hasNotes = Boolean(fragrance.notes.top.length || fragrance.notes.heart.length || fragrance.notes.base.length);
    const coverage = [hasOccasions, hasTime, hasNotes, Boolean(ctx.weather)].filter(Boolean).length / 4;

    return {
      fragrance,
      normalizedScore,
      factors,
      reasons: reasons.slice(0, 3),
      reasonCodes,
      coverage,
    };
  });

  // Sort deterministically:
  // 1. Highest normalized score
  // 2. Least recently worn (or never worn first)
  // 3. Alphabetical / stable ID
  scoredCandidates.sort((a, b) => {
    if (b.normalizedScore !== a.normalizedScore) {
      return b.normalizedScore - a.normalizedScore;
    }
    const aLastWorn = a.fragrance.lastWornAt ? new Date(a.fragrance.lastWornAt).getTime() : 0;
    const bLastWorn = b.fragrance.lastWornAt ? new Date(b.fragrance.lastWornAt).getTime() : 0;
    if (aLastWorn !== bLastWorn) {
      return aLastWorn - bLastWorn; // least recently worn first
    }
    return a.fragrance.name.localeCompare(b.fragrance.name);
  });

  const best = scoredCandidates[0];
  const isBestMatch = best.normalizedScore >= 70 && best.coverage >= 0.5;

  return {
    fragrance: best.fragrance,
    normalizedScore: best.normalizedScore,
    isBestMatch,
    reasons:
      best.reasons.length > 0
        ? best.reasons
        : ['A signature selection from your fragrance wardrobe'],
    reasonCodes: best.reasonCodes,
    factors: best.factors,
    coverage: best.coverage,
    timestamp: new Date().toISOString(),
    alternatives: scoredCandidates.slice(1, 4).map((c) => c.fragrance),
  };
}
