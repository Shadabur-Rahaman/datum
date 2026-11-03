export type Question = {
  id: string;
  kind: string;
  skill: string;
  objective: string;
  difficulty: string;
  prompt: string;
  options: { id: string; label: string }[];
};
export const questions: Question[] = [
  {
    id: "rows",
    kind: "single",
    skill: "Data literacy",
    objective: "Identify the observation unit.",
    difficulty: "Foundation",
    prompt: "In the delivery dataset, what does one row describe?",
    options: [
      {
        id: "delivery",
        label: "One delivery",
      },
      {
        id: "weather",
        label: "One weather category",
      },
      {
        id: "variable",
        label: "One variable",
      },
    ],
  },
  {
    id: "types",
    kind: "multi",
    skill: "Data literacy",
    objective: "Distinguish categorical and numeric variables.",
    difficulty: "Foundation",
    prompt: "Select the two categorical variables.",
    options: [
      {
        id: "weather",
        label: "Weather",
      },
      {
        id: "rush",
        label: "Rush-hour flag",
      },
      {
        id: "distance",
        label: "Distance in km",
      },
      {
        id: "duration",
        label: "Duration in minutes",
      },
    ],
  },
  {
    id: "causal",
    kind: "boolean",
    skill: "Causal reasoning",
    objective: "Distinguish association from causation.",
    difficulty: "Foundation",
    prompt:
      "Rainy deliveries have a higher mean. This alone proves rain causes delays.",
    options: [
      {
        id: "true",
        label: "True",
      },
      {
        id: "false",
        label: "False",
      },
    ],
  },
  {
    id: "mean",
    kind: "numeric",
    skill: "Statistical reasoning",
    objective: "Calculate an arithmetic mean.",
    difficulty: "Foundation",
    prompt: "What is the mean of 10, 20 and 60 minutes?",
    options: [],
  },
  {
    id: "median",
    kind: "numeric",
    skill: "Statistical reasoning",
    objective: "Calculate an even-sample median.",
    difficulty: "Foundation",
    prompt: "What is the median of 10, 20, 30 and 100?",
    options: [],
  },
  {
    id: "output",
    kind: "output",
    skill: "Python foundations",
    objective: "Predict list indexing.",
    difficulty: "Foundation",
    prompt: "What does print([10, 20, 30][-1]) print?",
    options: [
      {
        id: "10",
        label: "10",
      },
      {
        id: "30",
        label: "30",
      },
      {
        id: "error",
        label: "IndexError",
      },
    ],
  },
  {
    id: "missing",
    kind: "scenario",
    skill: "Data cleaning",
    objective: "Avoid invalid missing-value assumptions.",
    difficulty: "Applied",
    prompt: "Duration is missing more often in rain. What should you do first?",
    options: [
      {
        id: "inspect",
        label: "Inspect missingness by weather and report limitations",
      },
      {
        id: "zero",
        label: "Replace every missing duration with zero",
      },
      {
        id: "ignore",
        label: "Drop rows without mentioning it",
      },
    ],
  },
  {
    id: "outliers",
    kind: "single",
    skill: "Statistical reasoning",
    objective: "Choose a robust center.",
    difficulty: "Applied",
    prompt: "Which measure is less affected by one extremely long delivery?",
    options: [
      {
        id: "median",
        label: "Median",
      },
      {
        id: "mean",
        label: "Mean",
      },
      {
        id: "maximum",
        label: "Maximum",
      },
    ],
  },
  {
    id: "split",
    kind: "scenario",
    skill: "Evaluation",
    objective: "Prevent evaluation leakage.",
    difficulty: "Applied",
    prompt: "When should a learned imputation value be calculated?",
    options: [
      {
        id: "train",
        label: "On training data, then applied to test data",
      },
      {
        id: "all",
        label: "On all data before splitting",
      },
      {
        id: "test",
        label: "On test data only",
      },
    ],
  },
  {
    id: "sample",
    kind: "boolean",
    skill: "Uncertainty",
    objective: "Interpret reproducibility.",
    difficulty: "Applied",
    prompt:
      "Using a fixed random seed makes a sample representative of every population.",
    options: [
      {
        id: "true",
        label: "True",
      },
      {
        id: "false",
        label: "False",
      },
    ],
  },
  {
    id: "spread",
    kind: "numeric",
    skill: "Statistical reasoning",
    objective: "Interpret zero variation.",
    difficulty: "Applied",
    prompt: "What is the population standard deviation of 7, 7 and 7?",
    options: [],
  },
  {
    id: "evidence",
    kind: "multi",
    skill: "Evidence reasoning",
    objective: "Recognize a reproducible conclusion.",
    difficulty: "Applied",
    prompt: "Which two items are essential when saving a finding?",
    options: [
      {
        id: "source",
        label: "Dataset version and transformations",
      },
      {
        id: "limits",
        label: "Limitations of the claim",
      },
      {
        id: "color",
        label: "A favorite chart color",
      },
      {
        id: "certainty",
        label: "A claim of absolute certainty",
      },
    ],
  },
];
