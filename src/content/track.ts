import { z } from "zod";
const chapterSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  lessons: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        minutes: z.number(),
        question: z.string(),
        concept: z.string(),
        prompt: z.string(),
      }),
    )
    .length(2),
});
export const track = z
  .object({
    version: z.literal(1),
    title: z.string(),
    chapters: z.array(chapterSchema).length(6),
  })
  .parse({
    version: 1,
    title: "Data Detective",
    chapters: [
      {
        id: 1,
        title: "Thinking like a data scientist",
        description:
          "Turn everyday observations into questions you can investigate.",
        lessons: [
          {
            id: "observations",
            title: "The anatomy of a dataset",
            minutes: 12,
            question: "What can one delivery tell us?",
            concept:
              "A row describes one observation. A column describes a variable measured across observations. A delivery duration is numerical; weather is categorical. An order ID identifies a delivery but is not a meaningful quantity to average.",
            prompt:
              "Which variables would you collect to investigate a late delivery, and why?",
          },
          {
            id: "hypotheses",
            title: "From hunch to hypothesis",
            minutes: 15,
            question: "Does rain cause delivery delays?",
            concept:
              "A testable hypothesis predicts an observable relationship. Rainy deliveries may take longer, but distance and rush-hour traffic could also explain the difference. Association alone does not establish causation.",
            prompt: "Write a prediction and name one alternative explanation.",
          },
        ],
      },
      {
        id: 2,
        title: "Python foundations",
        description: "Use small, readable programs to ask bigger questions.",
        lessons: [
          {
            id: "python-basics",
            title: "A language for investigation",
            minutes: 18,
            question: "How can we describe many deliveries at once?",
            concept:
              "Variables name values. Lists collect values. Conditions select cases and loops repeat a task. Functions give a reusable name to a procedure with clear inputs and outputs.",
            prompt:
              "Describe the steps a function would take to count deliveries longer than 40 minutes.",
          },
          {
            id: "processing",
            title: "Your first data pipeline",
            minutes: 20,
            question: "Which orders need attention?",
            concept:
              "A data-processing pipeline reads records, validates their types, filters them with a rule, and summarizes the remaining values. State how missing values are handled before computing an average.",
            prompt: "What should happen when a delivery duration is missing?",
          },
        ],
      },
      {
        id: 3,
        title: "Data cleaning",
        description: "Make the quality of your evidence visible.",
        lessons: [
          {
            id: "dataframes",
            title: "Meet the DataFrame",
            minutes: 16,
            question: "How do we organize messy records?",
            concept:
              "A pandas DataFrame organizes named columns and indexed rows. Inspect shape, data types and a sample before transforming it. A numeric-looking string is not necessarily a numeric measurement.",
            prompt:
              "Which checks would you perform before calculating delivery times?",
          },
          {
            id: "missing",
            title: "Missing is a signal",
            minutes: 18,
            question: "Can cleaning change the story?",
            concept:
              "Dropping missing records changes the analyzed sample. Imputation introduces assumptions. Duplicates can double-count events, while outliers may represent real events rather than errors.",
            prompt:
              "When might removing a very slow delivery hide important evidence?",
          },
        ],
      },
      {
        id: 4,
        title: "Exploratory data analysis",
        description: "Find patterns, then challenge what you see.",
        lessons: [
          {
            id: "distributions",
            title: "Look beyond the average",
            minutes: 15,
            question: "Do similar averages hide different experiences?",
            concept:
              "A distribution shows how values vary. Two groups can have the same mean but different spreads and tails. A histogram summarizes counts within intervals; its bin width affects the picture.",
            prompt: "Why might the slowest ten percent of deliveries matter?",
          },
          {
            id: "charts",
            title: "Choose an honest chart",
            minutes: 15,
            question: "What does this chart leave out?",
            concept:
              "Use a scatterplot for two numerical variables and a bar chart for category comparisons. Label units and report sample sizes. Truncated bar-chart axes can exaggerate differences.",
            prompt:
              "Which chart would you choose for distance versus duration?",
          },
        ],
      },
      {
        id: 5,
        title: "Statistics in context",
        description: "Reason with variation, samples and uncertainty.",
        lessons: [
          {
            id: "summary",
            title: "The typical delivery",
            minutes: 18,
            question: "What does typical actually mean?",
            concept:
              "The mean uses every value and is sensitive to extremes. The median is the middle ordered value. Neither describes spread on its own. Always connect a summary to the decision it informs.",
            prompt:
              "Would one unusually late delivery change the mean or median more?",
          },
          {
            id: "uncertainty",
            title: "A sample is not the whole story",
            minutes: 20,
            question: "Can today’s orders speak for the whole month?",
            concept:
              "A large sample can still be biased. Sampling only at lunchtime may miss evening conditions. Correlation measures association, and its value alone cannot explain causality or uncertainty.",
            prompt: "How would you sample deliveries across a week fairly?",
          },
        ],
      },
      {
        id: 6,
        title: "First steps in machine learning",
        description: "Make predictions you can evaluate honestly.",
        lessons: [
          {
            id: "features",
            title: "From evidence to prediction",
            minutes: 20,
            question: "Can we estimate arrival time before dispatch?",
            concept:
              "Features are information available when predicting. The target is the outcome to predict. Actual arrival time cannot be an input to a model that predicts arrival time before dispatch.",
            prompt: "Name two useful features available before dispatch.",
          },
          {
            id: "evaluation",
            title: "Put your model to the test",
            minutes: 22,
            question: "Will a model work on deliveries it has never seen?",
            concept:
              "Reserve a test set before fitting transformations or models. Mean absolute error reports average absolute prediction error in the target’s units. Leakage makes evaluation look better than real performance.",
            prompt:
              "Why should the test data stay out of preprocessing decisions?",
          },
        ],
      },
    ],
  });
export const lessons = track.chapters.flatMap((c) =>
  c.lessons.map((l) => ({ ...l, chapter: c.id, chapterTitle: c.title })),
);
export const missionStages = [
  "Brief",
  "Hypothesis",
  "Explore",
  "Experiment",
  "Explain",
  "Reflect",
  "Complete",
];
export const demoRows = [
  { id: "DL-1001", distance: 2.4, weather: "Clear", rush: "No", minutes: 22 },
  { id: "DL-1002", distance: 6.8, weather: "Rain", rush: "Yes", minutes: 51 },
  { id: "DL-1003", distance: 3.1, weather: "Clear", rush: "Yes", minutes: 34 },
  { id: "DL-1004", distance: 8.2, weather: "Rain", rush: "No", minutes: 48 },
  {
    id: "DL-1005",
    distance: 4.5,
    weather: "Cloudy",
    rush: "Yes",
    minutes: null,
  },
  { id: "DL-1006", distance: 1.9, weather: "Clear", rush: "No", minutes: 19 },
];
