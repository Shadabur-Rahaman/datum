import type { Question } from "./questions";
export const chapterNames = [
  "Data literacy",
  "Python foundations",
  "Data cleaning",
  "Visual reasoning",
  "Statistical reasoning",
  "Evaluation",
];
export const chapterQuestions: (Question & { chapter: number })[] = [
  {
    id: "c1q1",
    chapter: 0,
    kind: "single",
    skill: "Data literacy",
    objective:
      "A table records one hospital visit per row. What is the observation?",
    difficulty: "Foundation",
    prompt:
      "A table records one hospital visit per row. What is the observation?",
    options: [
      {
        id: "o0",
        label: "One visit",
      },
      {
        id: "o1",
        label: "One hospital",
      },
      {
        id: "o2",
        label: "One column",
      },
    ],
  },
  {
    id: "c1q2",
    chapter: 0,
    kind: "multi",
    skill: "Data literacy",
    objective: "Which variables are categorical?",
    difficulty: "Foundation",
    prompt: "Which variables are categorical?",
    options: [
      {
        id: "o0",
        label: "Payment method",
      },
      {
        id: "o1",
        label: "Region",
      },
      {
        id: "o2",
        label: "Price",
      },
      {
        id: "o3",
        label: "Weight",
      },
    ],
  },
  {
    id: "c1q3",
    chapter: 0,
    kind: "boolean",
    skill: "Data literacy",
    objective: "An association alone proves a causal effect.",
    difficulty: "Foundation",
    prompt: "An association alone proves a causal effect.",
    options: [
      {
        id: "o0",
        label: "True",
      },
      {
        id: "o1",
        label: "False",
      },
    ],
  },
  {
    id: "c1q4",
    chapter: 0,
    kind: "numeric",
    skill: "Data literacy",
    objective:
      "A table has 8 rows and 4 columns. How many cells does it contain?",
    difficulty: "Applied",
    prompt: "A table has 8 rows and 4 columns. How many cells does it contain?",
    options: [],
  },
  {
    id: "c1q5",
    chapter: 0,
    kind: "scenario",
    skill: "Data literacy",
    objective:
      "You want to test whether a new queue system reduces waiting. What is the best comparison?",
    difficulty: "Applied",
    prompt:
      "You want to test whether a new queue system reduces waiting. What is the best comparison?",
    options: [
      {
        id: "o0",
        label: "Randomly assign comparable queues to new and old systems",
      },
      {
        id: "o1",
        label: "Compare only happy customers",
      },
      {
        id: "o2",
        label: "Ask the system designer",
      },
    ],
  },
  {
    id: "c1q6",
    chapter: 0,
    kind: "single",
    skill: "Data literacy",
    objective: "Which statement can be tested with delivery records?",
    difficulty: "Applied",
    prompt: "Which statement can be tested with delivery records?",
    options: [
      {
        id: "o0",
        label: "Rainy deliveries have a higher mean duration",
      },
      {
        id: "o1",
        label: "Rain is unpleasant",
      },
      {
        id: "o2",
        label: "Deliveries should be magical",
      },
    ],
  },
  {
    id: "c2q1",
    chapter: 1,
    kind: "output",
    skill: "Python foundations",
    objective: "What does print([4, 8, 12][1]) print?",
    difficulty: "Foundation",
    prompt: "What does print([4, 8, 12][1]) print?",
    options: [
      {
        id: "o0",
        label: "4",
      },
      {
        id: "o1",
        label: "8",
      },
      {
        id: "o2",
        label: "12",
      },
    ],
  },
  {
    id: "c2q2",
    chapter: 1,
    kind: "numeric",
    skill: "Python foundations",
    objective: "What does len([2, 4, 6, 8, 10]) return?",
    difficulty: "Foundation",
    prompt: "What does len([2, 4, 6, 8, 10]) return?",
    options: [],
  },
  {
    id: "c2q3",
    chapter: 1,
    kind: "output",
    skill: "Python foundations",
    objective: "What does print(3 * 4 + 2) print?",
    difficulty: "Foundation",
    prompt: "What does print(3 * 4 + 2) print?",
    options: [
      {
        id: "o0",
        label: "14",
      },
      {
        id: "o1",
        label: "18",
      },
      {
        id: "o2",
        label: "9",
      },
    ],
  },
  {
    id: "c2q4",
    chapter: 1,
    kind: "boolean",
    skill: "Python foundations",
    objective: "In Python, assigning x = 5 tests whether x equals 5.",
    difficulty: "Applied",
    prompt: "In Python, assigning x = 5 tests whether x equals 5.",
    options: [
      {
        id: "o0",
        label: "True",
      },
      {
        id: "o1",
        label: "False",
      },
    ],
  },
  {
    id: "c2q5",
    chapter: 1,
    kind: "multi",
    skill: "Python foundations",
    objective: "Which expressions are True?",
    difficulty: "Applied",
    prompt: "Which expressions are True?",
    options: [
      {
        id: "o0",
        label: "3 > 2",
      },
      {
        id: "o1",
        label: "2 == 2",
      },
      {
        id: "o2",
        label: "1 > 9",
      },
      {
        id: "o3",
        label: "4 != 4",
      },
    ],
  },
  {
    id: "c2q6",
    chapter: 1,
    kind: "scenario",
    skill: "Python foundations",
    objective: "A loop never stops. What should you inspect first?",
    difficulty: "Applied",
    prompt: "A loop never stops. What should you inspect first?",
    options: [
      {
        id: "o0",
        label: "Whether its condition can become false",
      },
      {
        id: "o1",
        label: "The chart color",
      },
      {
        id: "o2",
        label: "The font size",
      },
    ],
  },
  {
    id: "c3q1",
    chapter: 2,
    kind: "numeric",
    skill: "Data cleaning",
    objective:
      "Values are 12, missing, 24. Excluding the missing value, what is the mean?",
    difficulty: "Foundation",
    prompt:
      "Values are 12, missing, 24. Excluding the missing value, what is the mean?",
    options: [],
  },
  {
    id: "c3q2",
    chapter: 2,
    kind: "single",
    skill: "Data cleaning",
    objective: "What does a DataFrame column normally represent?",
    difficulty: "Foundation",
    prompt: "What does a DataFrame column normally represent?",
    options: [
      {
        id: "o0",
        label: "A variable",
      },
      {
        id: "o1",
        label: "Always one person",
      },
      {
        id: "o2",
        label: "A chart",
      },
    ],
  },
  {
    id: "c3q3",
    chapter: 2,
    kind: "scenario",
    skill: "Data cleaning",
    objective:
      "Two rows share an order ID. What should happen before deleting one?",
    difficulty: "Foundation",
    prompt:
      "Two rows share an order ID. What should happen before deleting one?",
    options: [
      {
        id: "o0",
        label: "Check whether they are duplicate events or legitimate updates",
      },
      {
        id: "o1",
        label: "Delete the longer row",
      },
      {
        id: "o2",
        label: "Replace both with zeros",
      },
    ],
  },
  {
    id: "c3q4",
    chapter: 2,
    kind: "boolean",
    skill: "Data cleaning",
    objective: "Replacing an unknown income with zero is always neutral.",
    difficulty: "Applied",
    prompt: "Replacing an unknown income with zero is always neutral.",
    options: [
      {
        id: "o0",
        label: "True",
      },
      {
        id: "o1",
        label: "False",
      },
    ],
  },
  {
    id: "c3q5",
    chapter: 2,
    kind: "numeric",
    skill: "Data cleaning",
    objective:
      "Filter [5, 10, 15, 20] with value > 10. How many values remain?",
    difficulty: "Applied",
    prompt: "Filter [5, 10, 15, 20] with value > 10. How many values remain?",
    options: [],
  },
  {
    id: "c3q6",
    chapter: 2,
    kind: "multi",
    skill: "Data cleaning",
    objective: "Which cleaning details should be recorded?",
    difficulty: "Applied",
    prompt: "Which cleaning details should be recorded?",
    options: [
      {
        id: "o0",
        label: "Rows removed and why",
      },
      {
        id: "o1",
        label: "Imputation rule",
      },
      {
        id: "o2",
        label: "Only the final chart color",
      },
      {
        id: "o3",
        label: "A claim that cleaning never matters",
      },
    ],
  },
  {
    id: "c4q1",
    chapter: 3,
    kind: "chart",
    skill: "Visual reasoning",
    objective: "A bar chart shows A=20 and B=30. Which statement is supported?",
    difficulty: "Foundation",
    prompt: "A bar chart shows A=20 and B=30. Which statement is supported?",
    options: [
      {
        id: "o0",
        label: "B is 10 higher than A",
      },
      {
        id: "o1",
        label: "B is three times A",
      },
      {
        id: "o2",
        label: "A exceeds B",
      },
    ],
  },
  {
    id: "c4q2",
    chapter: 3,
    kind: "numeric",
    skill: "Visual reasoning",
    objective:
      "Histogram bins contain 3, 5 and 7 observations. How many observations are displayed?",
    difficulty: "Foundation",
    prompt:
      "Histogram bins contain 3, 5 and 7 observations. How many observations are displayed?",
    options: [],
  },
  {
    id: "c4q3",
    chapter: 3,
    kind: "single",
    skill: "Visual reasoning",
    objective:
      "Which chart is suitable for the distribution of delivery duration?",
    difficulty: "Foundation",
    prompt:
      "Which chart is suitable for the distribution of delivery duration?",
    options: [
      {
        id: "o0",
        label: "Histogram",
      },
      {
        id: "o1",
        label: "Unlabelled pie chart",
      },
      {
        id: "o2",
        label: "An unordered list of colors",
      },
    ],
  },
  {
    id: "c4q4",
    chapter: 3,
    kind: "boolean",
    skill: "Visual reasoning",
    objective:
      "Truncating a bar chart axis can exaggerate apparent differences.",
    difficulty: "Applied",
    prompt: "Truncating a bar chart axis can exaggerate apparent differences.",
    options: [
      {
        id: "o0",
        label: "True",
      },
      {
        id: "o1",
        label: "False",
      },
    ],
  },
  {
    id: "c4q5",
    chapter: 3,
    kind: "scenario",
    skill: "Visual reasoning",
    objective:
      "A group mean is based on only two records. What should the chart include?",
    difficulty: "Applied",
    prompt:
      "A group mean is based on only two records. What should the chart include?",
    options: [
      {
        id: "o0",
        label: "The sample count and a limitation",
      },
      {
        id: "o1",
        label: "A guarantee of representativeness",
      },
      {
        id: "o2",
        label: "No axis labels",
      },
    ],
  },
  {
    id: "c4q6",
    chapter: 3,
    kind: "multi",
    skill: "Visual reasoning",
    objective: "Which improve chart interpretation?",
    difficulty: "Applied",
    prompt: "Which improve chart interpretation?",
    options: [
      {
        id: "o0",
        label: "Units on the numeric axis",
      },
      {
        id: "o1",
        label: "A clear description of the groups",
      },
      {
        id: "o2",
        label: "Hiding missing data counts",
      },
      {
        id: "o3",
        label: "Changing scales without labels",
      },
    ],
  },
  {
    id: "c5q1",
    chapter: 4,
    kind: "numeric",
    skill: "Statistical reasoning",
    objective: "What is the mean of 6, 12 and 30?",
    difficulty: "Foundation",
    prompt: "What is the mean of 6, 12 and 30?",
    options: [],
  },
  {
    id: "c5q2",
    chapter: 4,
    kind: "numeric",
    skill: "Statistical reasoning",
    objective: "What is the median of 3, 7, 11 and 99?",
    difficulty: "Foundation",
    prompt: "What is the median of 3, 7, 11 and 99?",
    options: [],
  },
  {
    id: "c5q3",
    chapter: 4,
    kind: "single",
    skill: "Statistical reasoning",
    objective:
      "Which statistic is most directly affected by increasing the largest value?",
    difficulty: "Foundation",
    prompt:
      "Which statistic is most directly affected by increasing the largest value?",
    options: [
      {
        id: "o0",
        label: "Mean",
      },
      {
        id: "o1",
        label: "Count",
      },
      {
        id: "o2",
        label: "Minimum",
      },
    ],
  },
  {
    id: "c5q4",
    chapter: 4,
    kind: "boolean",
    skill: "Statistical reasoning",
    objective:
      "A larger sample from a biased source necessarily removes selection bias.",
    difficulty: "Applied",
    prompt:
      "A larger sample from a biased source necessarily removes selection bias.",
    options: [
      {
        id: "o0",
        label: "True",
      },
      {
        id: "o1",
        label: "False",
      },
    ],
  },
  {
    id: "c5q5",
    chapter: 4,
    kind: "numeric",
    skill: "Statistical reasoning",
    objective: "What is the range of 4, 9 and 16?",
    difficulty: "Applied",
    prompt: "What is the range of 4, 9 and 16?",
    options: [],
  },
  {
    id: "c5q6",
    chapter: 4,
    kind: "scenario",
    skill: "Statistical reasoning",
    objective:
      "Two samples give different estimates. What is a reasonable response?",
    difficulty: "Applied",
    prompt:
      "Two samples give different estimates. What is a reasonable response?",
    options: [
      {
        id: "o0",
        label: "Investigate sampling variation and selection",
      },
      {
        id: "o1",
        label: "Assume one must be fabricated",
      },
      {
        id: "o2",
        label: "Choose the estimate you prefer",
      },
    ],
  },
  {
    id: "c6q1",
    chapter: 5,
    kind: "single",
    skill: "Evaluation",
    objective: "Which feature leaks the delivery outcome at prediction time?",
    difficulty: "Foundation",
    prompt: "Which feature leaks the delivery outcome at prediction time?",
    options: [
      {
        id: "o0",
        label: "Final delivery duration",
      },
      {
        id: "o1",
        label: "Distance known at dispatch",
      },
      {
        id: "o2",
        label: "Weather forecast at dispatch",
      },
    ],
  },
  {
    id: "c6q2",
    chapter: 5,
    kind: "numeric",
    skill: "Evaluation",
    objective:
      "Actual values are [10, 20], predictions [12, 16]. What is mean absolute error?",
    difficulty: "Foundation",
    prompt:
      "Actual values are [10, 20], predictions [12, 16]. What is mean absolute error?",
    options: [],
  },
  {
    id: "c6q3",
    chapter: 5,
    kind: "boolean",
    skill: "Evaluation",
    objective:
      "Repeatedly tuning a model on the test set preserves an unbiased final test.",
    difficulty: "Foundation",
    prompt:
      "Repeatedly tuning a model on the test set preserves an unbiased final test.",
    options: [
      {
        id: "o0",
        label: "True",
      },
      {
        id: "o1",
        label: "False",
      },
    ],
  },
  {
    id: "c6q4",
    chapter: 5,
    kind: "scenario",
    skill: "Evaluation",
    objective: "When should a scaling mean be learned?",
    difficulty: "Applied",
    prompt: "When should a scaling mean be learned?",
    options: [
      {
        id: "o0",
        label: "From training data only",
      },
      {
        id: "o1",
        label: "From the complete dataset before splitting",
      },
      {
        id: "o2",
        label: "Only from test outcomes",
      },
    ],
  },
  {
    id: "c6q5",
    chapter: 5,
    kind: "multi",
    skill: "Evaluation",
    objective: "What should accompany an evaluation result?",
    difficulty: "Applied",
    prompt: "What should accompany an evaluation result?",
    options: [
      {
        id: "o0",
        label: "The metric and units",
      },
      {
        id: "o1",
        label: "The held-out data definition",
      },
      {
        id: "o2",
        label: "A promise of perfect future performance",
      },
      {
        id: "o3",
        label: "Only a model nickname",
      },
    ],
  },
  {
    id: "c6q6",
    chapter: 5,
    kind: "numeric",
    skill: "Evaluation",
    objective:
      "A baseline has MAE 8 and a candidate has MAE 5 on the same held-out records. What is the absolute reduction?",
    difficulty: "Applied",
    prompt:
      "A baseline has MAE 8 and a candidate has MAE 5 on the same held-out records. What is the absolute reduction?",
    options: [],
  },
];
export const publicPractice = [
  {
    id: "practice-c1",
    chapter: 0,
    kind: "numeric",
    skill: "Data literacy",
    objective: "How many cells are in 3 rows and 5 columns?",
    difficulty: "Practice",
    prompt: "How many cells are in 3 rows and 5 columns?",
    options: [],
    answer: 15,
    explanation: "3 \u00d7 5 = 15.",
  },
  {
    id: "practice-c2",
    chapter: 1,
    kind: "numeric",
    skill: "Python foundations",
    objective: "What is len([9, 8, 7])?",
    difficulty: "Practice",
    prompt: "What is len([9, 8, 7])?",
    options: [],
    answer: 3,
    explanation: "There are three list elements.",
  },
  {
    id: "practice-c3",
    chapter: 2,
    kind: "numeric",
    skill: "Data cleaning",
    objective: "How many of [2, 4, 6, 8] are strictly greater than 4?",
    difficulty: "Practice",
    prompt: "How many of [2, 4, 6, 8] are strictly greater than 4?",
    options: [],
    answer: 2,
    explanation: "6 and 8 satisfy the filter.",
  },
  {
    id: "practice-c4",
    chapter: 3,
    kind: "numeric",
    skill: "Visual reasoning",
    objective: "Bars show A=12 and B=19. What is B minus A?",
    difficulty: "Practice",
    prompt: "Bars show A=12 and B=19. What is B minus A?",
    options: [],
    answer: 7,
    explanation: "19 - 12 = 7.",
  },
  {
    id: "practice-c5",
    chapter: 4,
    kind: "numeric",
    skill: "Statistical reasoning",
    objective: "What is the mean of 10, 20 and 30?",
    difficulty: "Practice",
    prompt: "What is the mean of 10, 20 and 30?",
    options: [],
    answer: 20,
    explanation: "60 divided by 3 is 20.",
  },
  {
    id: "practice-c6",
    chapter: 5,
    kind: "numeric",
    skill: "Evaluation",
    objective:
      "Actual value is 12 and prediction is 9. What is absolute error?",
    difficulty: "Practice",
    prompt: "Actual value is 12 and prediction is 9. What is absolute error?",
    options: [],
    answer: 3,
    explanation: "Absolute error is |12 - 9| = 3.",
  },
];
