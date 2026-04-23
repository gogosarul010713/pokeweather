/**
 * Main sync logic (used by both scheduled and manual triggers)
 */
export declare function syncWeatherLogic(): Promise<{
    success: boolean;
    citiesUpdated: number;
    failedCities: string[];
}>;
//# sourceMappingURL=syncWeatherLogic.d.ts.map