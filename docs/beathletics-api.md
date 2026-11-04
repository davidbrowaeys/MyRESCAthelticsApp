# BeAthletics public read integration (Phase 0 findings)

Status: calendar endpoint confirmed from a user-supplied browser capture. Everything else is unconfirmed.
No credentials, cookies or personal data are stored in this repository.

## 1. Calendar (CONFIRMED from browser capture)

`GET https://www.beathletics.be/api/new-competition/calendar`

| Param | Notes |
|---|---|
| from, to | epoch milliseconds |
| championship, wpa, worldAthletic | booleans |
| types | repeated: Championnat LBFA, Championnat de Belgique, Championnat provincial, Interclubs, Kids Athletics, Meeting interne, Meeting ouvert, Meeting provincial, Meeting sur sélection |
| clubs | repeated club abbreviation (e.g. RESC) |
| loaded | 50 observed (page size?). Behaviour beyond 50 unconfirmed |
| order | asc |

Response: `{ competitions: [...], allCategories: [], allDisciplines: [] }`.

Competition: id (uuid), eventNumber, name, startDate/endDate (ISO UTC), competitionStatus, type, comment, waHomologation, club{abbr,name,areaServed}, federation (nullable), venue{name,city,zipCode,address,number,venueType}, disciplines[], registrationDetail (nullable: startDate,endDate,externalPdf,onSiteAllowed,publicMsg,validated,active,finished,restricted), registeredAthleteCount (optional).

Discipline: id, name (FR, may have trailing spaces/odd suffixes), disciplineGroup, categories[]{abbr,nationalCode,requiredGender,name}, eventType{abbr,name_fr/en/nl,discipline_group,national_code,type_id,venue (I/N),calendarAbbreviationId}.

Category codes seen: BEN, PUP, MIN, CAD, SCO, JUN, SEN, U23, KAN, TC (all), masters M35..; gender via requiredGender (Male/Female).

### Mapping decisions
- Dates are local midnight stored as UTC (23:00Z/22:00Z previous day): convert to Europe/Brussels date.
- `disciplines: []` (crosses, championships): eligibility is **unknown**, shown as such, never hidden.
- Indoor/outdoor derived from `eventType.venue` when all disciplines agree; otherwise `unknown`. Cross/road not inferable yet.
- No coordinates, no start/end times, no confirmed per-competition URL: `sourceUrl` is the public calendar page.
- Malformed items are skipped individually with a structured warning.

## 2. Further endpoints (URLs CONFIRMED from user's DevTools capture; shapes probed with one plain GET each, no cookies)

### 2.1 Competition detail: `GET /api/new-competition/full/{eventNumber}` (e.g. F4984)
Top level: `{ competition, logs[], results[], previousSb[] }`.
`competition`: `id`, `eventNumber`, `name`, `startDate`/`endDate` (UTC, 23:00Z = previous Brussels day), `competitionStatus`, `type`, `description`, `environment` (e.g. "Cross-Country & Trail"), `metadata{director, secretary, contact, website, price, startTime "HH:mm"}`, `club{abbr,name,province}`, `venue{name,address,city,zipCode,geoLat,geoLon}` (strings), `disciplines[]` (each with `name`, `startTime`, `endTime`, `disciplineGroup`, `venueType`, `categories[]`, `children[]`, `rounds[]`, `eventType`), `registrationDetail`, `registrationPricing[]`.
Gain over the calendar endpoint: coordinates, start time, organiser contact/website, price.
Detail is large (~150 kB for one event): fetch on demand only, never in bulk.

### 2.2 Athlete + results: `GET /api/athlete/new/{liveId}` (e.g. 5143736)
Top level: `id`, `liveId`, `bib`, `person{firstName,lastName,birthDate,gender}`, `club{abbr,name}`, `results[]` (one probe: 155 entries).
Each result: `personalRecord` (bool), `venueType` (Indoor/Outdoor), `category{abbr,name}`, `result{rank, validationStatus, discipline{name, eventType{name_fr, distance, field_type, result_type, low2high, venue, wind_mode}, competition{name,startDate,eventNumber}}, newTrials[]}`.
`newTrials[]`: `trialJson{perf (number), perfType, valid, best, certifiable}`, `perfLegacy` (display string), `rankingPerf`, `windSpeed`. Legacy `metadata.oldResult.result.bestData` carries `personal_best`, `seasonal_best`, `indoor_best`, `outdoor_best`.
`eventType.low2high` appears to flag lower-is-better vs higher-is-better: UNVERIFIED, check before PB logic relies on it.
Privacy: the payload includes birth date and name. Never put real payloads in fixtures or logs; fixtures must be synthetic.

Mapping (implemented, `mapAthleteResults`): times `perf` are integer milliseconds (inferred from 2 samples: 9050 => 9.05 s, distance 3.48 => metres), normalised to seconds/metres; `low2high` 1 => lower is better (consistent with both samples; only time and distance types seen). Entries with no valid numeric `perf` are skipped. `getCompetition(id)` takes the event number, `getAthleteResults(id)` takes the liveId.

### 2.3 Athlete search: `GET /api/search/public/{url-encoded name}`
URL confirmed; response shape NOT yet probed. The athlete page URL is `/athlete/{liveId}`.

### 2.4 Still unknown
Pagination of the calendar beyond `loaded=50`; rate limits; stability guarantees. `BeAthleticsProvider` still throws `NOT_AVAILABLE` for detail/search/results until mappers are written.

## 3. Access behaviour
- The site sits behind Cloudflare; the user's capture used a browser `cf_clearance` cookie. The app sends **no cookies** and does not attempt to bypass bot protection.
- Plain server-side requests with Node `fetch` (no cookie, descriptive User-Agent) returned HTTP 200 JSON for the detail and athlete endpoints from the dev machine. The earlier curl failure (exit 35) was a local Windows certificate-revocation check problem (`CRYPT_E_NO_REVOCATION_CHECK`), not Cloudflare. Still to re-test from Vercel.
- Client behaviour: 8 s timeout, 2 retries with exponential backoff on 5xx/429/timeouts, honours Retry-After (capped 30 s), no retry on 4xx, 403 -> `BLOCKED`, non-JSON -> `INVALID_RESPONSE`.
- Rate limits and auth requirements: not observed.

## 4. Fixtures
`lib/beathletics/fixtures/calendar.sample.ts` is synthetic, labelled `[MOCK]`, and mapped with `dataOrigin: "mock"`.

## 5. Risks
- Undocumented API may change without notice; the mapper/DTO layer isolates this.
- Possible bot protection blocks server-side calls (blocker if confirmed).
- Pagination beyond `loaded=50` unknown: may silently truncate large windows.
- Pasted `cf_clearance` cookie is a credential: do not commit; consider clearing the browser session.
