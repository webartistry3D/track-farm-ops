-- Fix weather forecast enum
ALTER TABLE weather_data ALTER COLUMN forecast TYPE "public"."WeatherForecast" USING forecast::"public"."WeatherForecast";
