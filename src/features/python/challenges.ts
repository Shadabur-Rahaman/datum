export type Check = { name: string; input: unknown; expected: unknown };
export const challenges = [
  {
    id: "count",
    title: "Count observed deliveries",
    skill: "Python foundations",
    objective: "Count values without mistaking zero for missing data.",
    starter:
      "def solve(values):\n    # Count values that are not None\n    return 0",
    hint: "Use value is not None. A zero-minute observation is still an observation.",
    tests: [
      { name: "Missing and zero", input: [10, null, 0, 20], expected: 3 },
      { name: "All missing", input: [null, null], expected: 0 },
    ],
  },
  {
    id: "average",
    title: "An honest average",
    skill: "Statistical reasoning",
    objective: "Return the mean of observed values, or None when none remain.",
    starter:
      "def solve(values):\n    observed = [v for v in values if v is not None]\n    return None",
    hint: "Divide the sum by the observed count. Check the empty list first.",
    tests: [
      { name: "Ignore missing", input: [10, null, 20, 30], expected: 20 },
      { name: "No observations", input: [null], expected: null },
    ],
  },
  {
    id: "clean",
    title: "Clean with pandas",
    skill: "Data cleaning",
    objective:
      "Use pandas to return a list with missing values removed; retain zeros and order.",
    starter:
      "import pandas as pd\n\ndef solve(values):\n    series = pd.Series(values)\n    return series.tolist()",
    hint: "Series.dropna() removes missing values, not zeros.",
    tests: [
      {
        name: "Retain zero",
        input: [null, 0, 12, null, 5],
        expected: [0, 12, 5],
      },
      { name: "Empty input", input: [], expected: [] },
    ],
  },
  {
    id: "groups",
    title: "Compare rainy deliveries",
    skill: "Group comparison",
    objective:
      "Return the mean duration for Rain records with observed durations, or None.",
    starter:
      "import pandas as pd\n\ndef solve(records):\n    df = pd.DataFrame(records)\n    return None",
    hint: "Filter weather first, then drop missing durations. Check the number of observations.",
    tests: [
      {
        name: "Mixed weather",
        input: [
          { weather: "Rain", duration: 60 },
          { weather: "Clear", duration: 10 },
          { weather: "Rain", duration: 80 },
        ],
        expected: 70,
      },
      {
        name: "Missing rain",
        input: [
          { weather: "Rain", duration: null },
          { weather: "Clear", duration: 10 },
        ],
        expected: null,
      },
    ],
  },
  {
    id: "spread",
    title: "Spread with NumPy",
    skill: "Statistical reasoning",
    objective: "Use NumPy to calculate population standard deviation (ddof=0).",
    starter: "import numpy as np\n\ndef solve(values):\n    return 0.0",
    hint: "np.std measures spread around the mean. Population standard deviation uses ddof=0.",
    tests: [
      {
        name: "Variable waits",
        input: [10, 20, 30],
        expected: Math.sqrt(200 / 3),
      },
      { name: "Identical waits", input: [7, 7, 7], expected: 0 },
    ],
  },
  {
    id: "error",
    title: "Repair a boundary error",
    skill: "Python debugging",
    objective:
      "Repair this function so it returns the final value, or None for an empty list.",
    starter: "def solve(values):\n    return values[len(values)]",
    hint: "Indexes end at len(values)-1. Handle empty input before indexing.",
    tests: [
      { name: "Final observation", input: [10, 20, 30], expected: 30 },
      { name: "Empty records", input: [], expected: null },
    ],
  },
] satisfies {
  id: string;
  title: string;
  skill: string;
  objective: string;
  starter: string;
  hint: string;
  tests: Check[];
}[];
