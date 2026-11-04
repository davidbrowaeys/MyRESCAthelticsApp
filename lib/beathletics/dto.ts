// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
// Raw BeAthletics DTO schemas (observed shape, deliberately permissive). Must not be imported outside lib/beathletics.
import { z } from "zod";

const nullableString = z.string().nullish();
// BeAthletics is inconsistent: some fields arrive as numbers on some events (e.g. price: 4).
const looseText = z.union([z.string(), z.number()]).nullish();

export const categoryDtoSchema = z.object({
  abbr: z.string(),
  nationalCode: nullableString,
  requiredGender: nullableString,
  name: nullableString,
});

export const eventTypeDtoSchema = z
  .object({
    abbr: nullableString,
    name_fr: nullableString,
    discipline_group: nullableString,
    venue: nullableString,
  })
  .passthrough();

export const disciplineDtoSchema = z.object({
  id: z.union([z.string(), z.number()]),
  name: nullableString,
  disciplineGroup: nullableString,
  categories: z.array(categoryDtoSchema).nullish(),
  eventType: eventTypeDtoSchema.nullish(),
});

export const registrationDtoSchema = z
  .object({
    startDate: nullableString,
    endDate: nullableString,
    externalPdf: nullableString,
    onSiteAllowed: z.boolean().nullish(),
    publicMsg: nullableString,
    active: z.boolean().nullish(),
    finished: z.boolean().nullish(),
  })
  .passthrough();

export const competitionDtoSchema = z.object({
  id: z.string().min(1),
  eventNumber: z.union([z.string(), z.number()]).nullish(),
  name: z.string().min(1),
  startDate: z.string(),
  endDate: z.string().nullish(),
  competitionStatus: nullableString,
  type: nullableString,
  club: z.object({ abbr: nullableString, name: nullableString }).passthrough().nullish(),
  venue: z
    .object({
      name: nullableString,
      city: nullableString,
      zipCode: z.union([z.string(), z.number()]).nullish(),
      address: nullableString,
      number: z.union([z.string(), z.number()]).nullish(),
      venueType: nullableString,
      geoLat: looseText,
      geoLon: looseText,
    })
    .passthrough()
    .nullish(),
  metadata: z
    .object({ startTime: looseText, website: looseText, price: looseText })
    .passthrough()
    .nullish(),
  disciplines: z.array(z.unknown()).nullish(),
  registrationDetail: registrationDtoSchema.nullish(),
});

export const calendarResponseSchema = z.object({
  competitions: z.array(z.unknown()),
});

export const competitionDetailResponseSchema = z.object({ competition: z.unknown() });

export const trialDtoSchema = z
  .object({
    trialJson: z
      .object({
        perf: z.number().nullish(),
        perfType: nullableString,
        valid: z.boolean().nullish(),
        best: z.boolean().nullish(),
      })
      .passthrough()
      .nullish(),
    windSpeed: z.union([z.number(), z.string()]).nullish(),
  })
  .passthrough();

export const athleteResultEntryDtoSchema = z
  .object({
    resultId: z.string().min(1),
    personalRecord: z.boolean().nullish(),
    venueType: nullableString,
    category: z.object({ abbr: nullableString }).passthrough().nullish(),
    result: z
      .object({
        rank: z.number().nullish(),
        roundName: nullableString,
        newTrials: z.array(z.unknown()).nullish(),
        discipline: z
          .object({
            name: nullableString,
            eventType: z
              .object({
                name_fr: nullableString,
                result_type: nullableString,
                low2high: z.number().nullish(),
              })
              .passthrough()
              .nullish(),
            competition: z
              .object({
                eventNumber: z.union([z.string(), z.number()]).nullish(),
                name: nullableString,
                startDate: nullableString,
              })
              .passthrough()
              .nullish(),
          })
          .passthrough(),
      })
      .passthrough(),
  })
  .passthrough();

export const athleteResponseSchema = z.object({ results: z.array(z.unknown()) }).passthrough();

export const athleteSearchEntrySchema = z
  .object({
    liveId: z.union([z.string(), z.number()]),
    person: z
      .object({
        firstName: z.string(),
        lastName: z.string(),
        birthYear: z.number().nullish(),
        gender: nullableString,
        currentCategory: nullableString,
      })
      .passthrough(),
    club: z.object({ abbr: nullableString }).passthrough().nullish(),
  })
  .passthrough();

export const athleteSearchResponseSchema = z.object({ athletes: z.array(z.unknown()) }).passthrough();

export type CompetitionDto = z.infer<typeof competitionDtoSchema>;
export type DisciplineDto = z.infer<typeof disciplineDtoSchema>;
