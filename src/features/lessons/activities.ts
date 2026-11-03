import {
  original,
  median,
  stats,
  transform,
  defaultConfig,
} from "../lab/engine";
export type Activity = {
  objective: string;
  analogy: string;
  example: string;
  parameterLabel: string;
  min: number;
  max: number;
  initial: number;
  unit: string;
  check: string;
  correct: string;
  incorrect: string;
  feedback: string;
  challenge: string;
};
export const activities: Record<string, Activity> = {
  observations: {
    objective: "Count observations and distinguish rows from variables.",
    analogy:
      "A table is a collection of delivery cards: each card is a row, each labeled box a column.",
    example:
      "Two cards with three fields contain six recorded cells. IDs identify cards; averaging them is meaningless.",
    parameterLabel: "Number of delivery cards",
    min: 1,
    max: 10,
    initial: 4,
    unit: "cells",
    check: "Does adding a row create a new variable?",
    correct: "No",
    incorrect: "Yes",
    feedback: "Rows add observations. Columns define variables.",
    challenge: "count",
  },
  hypotheses: {
    objective: "Test a measurable claim and identify selection effects.",
    analogy:
      "Comparing different shopping baskets requires knowing which items were removed.",
    example:
      "For waits 20, 30 and 100, the mean is 50; excluding 100 leaves 25.",
    parameterLabel: "Maximum duration included",
    min: 40,
    max: 150,
    initial: 90,
    unit: "minutes",
    check: "Does excluding slow records prove the service improved?",
    correct: "No",
    incorrect: "Yes",
    feedback:
      "The omitted deliveries still happened. Selection is not an intervention.",
    challenge: "average",
  },
  "python-basics": {
    objective: "Trace a variable through an arithmetic expression.",
    analogy:
      "A variable is a labeled container; changing its contents changes a recipe that uses it.",
    example:
      "With preparation=10, distance=4 and rate=3, estimate=10+4\u00d73=22.",
    parameterLabel: "Minutes per kilometre",
    min: 1,
    max: 6,
    initial: 3,
    unit: "minutes",
    check: "Is the name rate the same thing as its stored number?",
    correct: "No",
    incorrect: "Yes",
    feedback:
      "The name refers to a value. Assignment changes the value used by later expressions.",
    challenge: "count",
  },
  processing: {
    objective: "Filter observed values using a strict condition.",
    analogy:
      "A sieve keeps records meeting a rule, while missing measurements need an explicit policy.",
    example:
      "For [20,40,None,60,80], values greater than 40 are [60,80]: count 2.",
    parameterLabel: "Strict duration threshold",
    min: 20,
    max: 80,
    initial: 40,
    unit: "records",
    check:
      "Does a value equal to the threshold pass a strict greater-than test?",
    correct: "No",
    incorrect: "Yes",
    feedback:
      "Greater-than excludes equality. Greater-than-or-equal includes it; neither silently treats missing as zero.",
    challenge: "count",
  },
  dataframes: {
    objective: "Inspect a named-column table before filtering.",
    analogy:
      "A DataFrame is a spreadsheet with consistent column names and explicit data types.",
    example:
      "Filtering distances [2,5,8] to at most 5 keeps two rows; it does not remove columns.",
    parameterLabel: "Maximum distance in km",
    min: 1,
    max: 15,
    initial: 8,
    unit: "records",
    check: "Does filtering rows change the number of columns?",
    correct: "No",
    incorrect: "Yes",
    feedback:
      "A row filter changes the selected observations. Selecting columns is a different operation.",
    challenge: "groups",
  },
  missing: {
    objective: "See how an imputation assumption changes a mean.",
    analogy: "A missing thermometer reading is not a reading of zero degrees.",
    example:
      "Observed values 20 and 40 average 30. Filling a missing value with zero gives a three-row mean of 20.",
    parameterLabel: "Assumed missing duration",
    min: 0,
    max: 100,
    initial: 30,
    unit: "minutes",
    check: "Is replacing every missing duration with zero a neutral choice?",
    correct: "No",
    incorrect: "Yes",
    feedback:
      "Zero invents a value and can pull the mean down. Missingness may differ systematically between groups.",
    challenge: "clean",
  },
  distributions: {
    objective: "Compare a distribution shape with its average.",
    analogy:
      "Two queues can have the same typical wait but different risks of a very long wait.",
    example:
      "For [20,25,30,35,100], four values are below 40 and one lies in the tail.",
    parameterLabel: "Longest wait in minutes",
    min: 40,
    max: 140,
    initial: 60,
    unit: "minutes",
    check: "Can a mean alone show the slowest tail of a distribution?",
    correct: "No",
    incorrect: "Yes",
    feedback:
      "A single center hides shape. Inspect counts across intervals and report extreme waits.",
    challenge: "spread",
  },
  charts: {
    objective: "Recognize how an axis changes visual emphasis.",
    analogy:
      "Zooming a photograph changes appearance without changing the object size.",
    example:
      "Groups averaging 40 and 50 differ by 10 minutes. A truncated axis magnifies their visible bar difference.",
    parameterLabel: "Bar-axis lower bound",
    min: 0,
    max: 35,
    initial: 0,
    unit: "percentage points",
    check:
      "Does truncating the axis change the underlying 10-minute difference?",
    correct: "No",
    incorrect: "Yes",
    feedback:
      "Axis selection changes visual proportions, not measured values. Bar charts should normally begin at zero.",
    challenge: "groups",
  },
  summary: {
    objective: "Compare the sensitivity of mean and median.",
    analogy:
      "The mean is a balance point; the median is the person in the middle of an ordered queue.",
    example: "For [10,20,30,40,100], the mean is 40 and the median is 30.",
    parameterLabel: "Longest delivery",
    min: 40,
    max: 200,
    initial: 100,
    unit: "minutes",
    check: "Does an extreme maximum necessarily move the median?",
    correct: "No",
    incorrect: "Yes",
    feedback:
      "Changing an already-largest value keeps the middle ordered value fixed, while the mean changes.",
    challenge: "average",
  },
  uncertainty: {
    objective: "Identify how sampling location changes a conclusion.",
    analogy:
      "Tasting only the top of a soup pot may miss what is at the bottom.",
    example:
      "Ten early deliveries at 20 and ten late deliveries at 80 have a population mean of 50. Sampling only early orders gives 20.",
    parameterLabel: "Start index of a ten-order sample",
    min: 0,
    max: 10,
    initial: 0,
    unit: "minutes",
    check: "Does a fixed seed guarantee an unbiased sample?",
    correct: "No",
    incorrect: "Yes",
    feedback:
      "A seed reproduces a selection. It does not make the source or selection representative.",
    challenge: "average",
  },
  features: {
    objective: "Detect information unavailable at prediction time.",
    analogy:
      "Predicting an exam score using the marked exam is cheating the timing of the problem.",
    example:
      "An actual arrival time can perfectly explain itself, but it is unavailable before dispatch.",
    parameterLabel: "Weight given to the future outcome (%)",
    min: 0,
    max: 100,
    initial: 0,
    unit: "minutes MAE",
    check: "Can actual arrival time be a pre-dispatch predictor?",
    correct: "No",
    incorrect: "Yes",
    feedback:
      "This leaks the target. Excellent retrospective error can conceal a model that cannot be used in practice.",
    challenge: "error",
  },
  evaluation: {
    objective: "Calculate held-out mean absolute error in meaningful units.",
    analogy:
      "A rehearsal is training; a new performance is the test. Mixing them hides surprises.",
    example:
      "Predictions [35,45] for actual [40,50] have absolute errors [5,5], so MAE is 5 minutes.",
    parameterLabel: "Model slope (minutes per km)",
    min: 1,
    max: 6,
    initial: 3,
    unit: "minutes MAE",
    check: "Is repeatedly tuning on the test set an honest final evaluation?",
    correct: "No",
    incorrect: "Yes",
    feedback:
      "Repeated tuning uses the test set as feedback. Use training/validation for choices and reserve a final unseen test.",
    challenge: "error",
  },
};
const mean = (a: number[]) => a.reduce((s, v) => s + v, 0) / a.length;
export function computeActivity(id: string, p: number) {
  const a = activities[id];
  if (!a || !Number.isFinite(p) || p < a.min || p > a.max)
    throw new Error("Invalid activity parameter");
  let values: number[] = [],
    labels: string[] = [],
    metric = 0,
    explanation = "";
  switch (id) {
    case "observations":
      values = Array.from({ length: Math.floor(p) }, () => 3);
      labels = values.map((_, i) => "Row " + (i + 1));
      metric = values.reduce((s, v) => s + v, 0);
      explanation = `${values.length} observations × 3 fields = ${metric} cells. The variables remain ID, weather and duration.`;
      break;
    case "hypotheses": {
      const selected = transform(original, { ...defaultConfig, outlierCap: p });
      const before = stats(original).mean!,
        after = stats(selected).mean!;
      values = [before, after];
      labels = ["Original mean", "Selected mean"];
      metric = after;
      explanation = `${selected.length} of ${original.length} records remain. Exclusion changes the analyzed population; it does not change past deliveries.`;
      break;
    }
    case "python-basics":
      metric = 10 + 4 * p;
      values = [10, 4 * p];
      labels = ["Preparation", "Distance × rate"];
      explanation = `Arithmetic simulation: preparation=10; distance=4; rate=${p}; estimate=10+4*${p}=${metric}. Run actual Python in Practice.`;
      break;
    case "processing":
      values = [20, 40, 60, 80].filter((v) => v > p);
      labels = values.map((_, i) => "Selected " + (i + 1));
      metric = values.length;
      explanation = `[20,40,None,60,80] filtered by observed duration > ${p} leaves ${JSON.stringify(values)}. None is excluded explicitly.`;
      break;
    case "dataframes": {
      const rows = original.slice(0, 12).filter((x) => x.distance <= p);
      values = rows.map((x) => x.distance);
      labels = rows.map((x) => x.id);
      metric = rows.length;
      explanation = `First 12 source rows, distance <= ${p}: ${metric} rows remain with the same eight named columns. Distances shown below are measured in km.`;
      break;
    }
    case "missing":
      values = [20, p, 40];
      labels = ["Observed", "Imputed assumption", "Observed"];
      metric = mean(values);
      explanation = `Observed-only mean is 30. The imputed three-row mean is (${values.join("+")})/3. The assumed value is not a measurement.`;
      break;
    case "distributions": {
      const raw = [20, 25, 30, 35, p];
      values = [0, 40, 80, 120].map(
        (low, i) =>
          raw.filter((v) => v >= low && (i === 3 ? v <= 160 : v < low + 40))
            .length,
      );
      labels = ["0–39", "40–79", "80–119", "120–160"];
      metric = mean(raw);
      explanation = `Five waits: ${raw.join(", ")}. Histogram counts sum to five. Changing the final wait moves the mean and tail.`;
      break;
    }
    case "charts":
      values = [40, 50].map((v) => ((v - p) / (60 - p)) * 100);
      labels = ["40-minute group", "50-minute group"];
      metric = values[1] - values[0];
      explanation = `Axis runs ${p}–60. Visible height gap is ${metric.toFixed(2)} percentage points; measured difference remains 10 minutes. This demonstration intentionally shows a misleading truncated bar axis.`;
      break;
    case "summary": {
      const raw = [10, 20, 30, 40, p];
      values = [mean(raw), median(raw)!];
      labels = ["Mean", "Median"];
      metric = values[0];
      explanation = `Ordered values ${raw.join(", ")}. Median stays ${values[1]}; mean uses every value.`;
      break;
    }
    case "uncertainty": {
      const population = [...Array(10).fill(20), ...Array(10).fill(80)];
      values = population.slice(p, p + 10);
      labels = values.map((_, i) => "Order " + (p + i + 1));
      metric = mean(values);
      explanation = `Selected ten-order mean differs from the full twenty-order mean of 50. Source order is deliberately biased by time of day.`;
      break;
    }
    case "features": {
      const actual = [20, 30, 40, 50],
        distance = [2, 4, 6, 8];
      values = actual.map((y, i) =>
        Math.abs(y - ((10 + 3 * distance[i]) * (1 - p / 100) + (y * p) / 100)),
      );
      labels = values.map((_, i) => "Error " + (i + 1));
      metric = mean(values);
      explanation = `More future-outcome leakage lowers retrospective error to ${metric.toFixed(2)}, but requires information unavailable at dispatch. Zero leakage is the usable baseline.`;
      break;
    }
    case "evaluation":
      values = [6, 8].map((x, i) => Math.abs(10 + p * x - [40, 50][i]));
      labels = ["Held-out error 1", "Held-out error 2"];
      metric = mean(values);
      explanation = `Held-out predictions are ${10 + 6 * p} and ${10 + 8 * p}; actual durations are 40 and 50. MAE averages absolute errors. This is an instructional simulation, not a validated production model.`;
      break;
  }
  return { metric, values, labels, explanation };
}
export function direction(before: number, after: number) {
  return Math.abs(after - before) < 0.01
    ? "same"
    : after > before
      ? "increase"
      : "decrease";
}
export function evaluateActivity(
  id: string,
  s: {
    parameter: number;
    prediction: string;
    ran: boolean;
    answer: string;
    applied: string;
    explanation: string;
  },
) {
  const a = activities[id],
    result = computeActivity(id, s.parameter);
  const knowledgePassed = s.answer === a.correct,
    appliedPassed =
      s.applied.trim() !== "" &&
      Number.isFinite(Number(s.applied)) &&
      Math.abs(Number(s.applied) - result.metric) <= 0.05,
    reflectionPresent = s.explanation.trim().length >= 20;
  return {
    knowledgePassed,
    appliedPassed,
    reflectionPresent,
    passed:
      s.ran &&
      !!s.prediction &&
      knowledgePassed &&
      appliedPassed &&
      reflectionPresent,
  };
}
