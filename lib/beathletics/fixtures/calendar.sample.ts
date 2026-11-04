// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
// MOCK / SAMPLE DATA. Synthetic, modelled on the observed calendar response shape. Not real competitions.

const cat = (abbr: string, requiredGender: string) => ({
  abbr,
  nationalCode: abbr,
  requiredGender,
  name: abbr,
});

export const MOCK_CALENDAR_RESPONSE = {
  competitions: [
    {
      id: "mock-0001",
      eventNumber: 9001,
      name: "[MOCK] Meeting indoor de test",
      startDate: "2026-11-07T23:00:00.000Z",
      endDate: "2026-11-07T23:00:00.000Z",
      competitionStatus: "Published",
      type: "Meeting ouvert",
      club: { abbr: "RESC", name: "Royal Excelsior Sports Club" },
      federation: null,
      venue: {
        name: "Salle de test",
        city: "Bruxelles",
        zipCode: "1000",
        address: "Rue de l'Exemple",
        number: "1",
        venueType: "Indoor",
      },
      disciplines: [
        {
          id: 1,
          name: "60m ",
          disciplineGroup: "Sprint",
          categories: [cat("MIN", "Male"), cat("MIN", "Male"), cat("CAD", "Male")],
          eventType: { abbr: "60", name_fr: "60m", discipline_group: "Sprint", venue: "I" },
        },
        {
          id: 2,
          name: "Saut en longueur",
          disciplineGroup: "Jumps",
          categories: [cat("MIN", "Female")],
          eventType: { abbr: "LJ", name_fr: "Saut en longueur", discipline_group: "Jumps", venue: "I" },
        },
        "not-an-object",
      ],
      registrationDetail: {
        startDate: "2026-10-01T22:00:00.000Z",
        endDate: "2026-11-03T23:00:00.000Z",
        externalPdf: null,
        onSiteAllowed: false,
        publicMsg: "Inscriptions en ligne",
        active: true,
        finished: false,
      },
    },
    {
      id: "mock-0002",
      eventNumber: 9002,
      name: "[MOCK] Cross de test",
      startDate: "2026-12-05T23:00:00.000Z",
      endDate: null,
      competitionStatus: "Published",
      type: "Championnat provincial",
      club: { abbr: "ACBB", name: "Club test" },
      federation: null,
      venue: { name: "Parc", city: "Bruxelles", zipCode: 1000, address: null, number: null },
      disciplines: [],
      registrationDetail: null,
    },
    {
      id: "mock-0003",
      eventNumber: 9003,
      name: "[MOCK] Meeting outdoor de test",
      startDate: "2027-04-17T22:00:00.000Z",
      endDate: "2027-04-17T22:00:00.000Z",
      type: "Meeting provincial",
      club: { abbr: "RESC", name: "Royal Excelsior Sports Club" },
      venue: { name: "Stade test", city: "Uccle" },
      disciplines: [
        {
          id: 3,
          name: "600m",
          disciplineGroup: "Middle distance",
          categories: [cat("PUP", "Male"), cat("MIN", "Male")],
          eventType: { abbr: "600", name_fr: "600m", venue: "N" },
        },
      ],
      registrationDetail: null,
    },
    { id: "mock-bad-1", name: "[MOCK] Malformed: no startDate" },
    { id: "mock-bad-2", name: "[MOCK] Malformed: bad date", startDate: "not-a-date" },
  ],
  allCategories: [],
  allDisciplines: [],
};
