import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import {
  original,
  defaultConfig,
  runExperiment,
  type Prediction,
} from "../lab/engine";
export function LessonExperiment() {
  const [prediction, setPrediction] = useState<Prediction | "">(""),
    [cap, setCap] = useState(90),
    [ran, setRan] = useState(false),
    [answer, setAnswer] = useState("");
  const result =
    ran && prediction
      ? runExperiment({ ...defaultConfig, outlierCap: cap }, prediction)
      : null;
  return (
    <section aria-label="Interactive hypothesis lesson">
      <h2>Objective: test a claim without overstating it</h2>
      <p>
        A hypothesis names a measurable change. An experiment specifies how to
        check it. Like comparing two shopping baskets, the comparison only makes
        sense when you know which items changed.
      </p>
      <h3>Worked example</h3>
      <p>
        For waits of 20, 30 and 100 minutes, the mean is 50. Excluding the
        100-minute wait changes it to 25. That describes a different set of
        deliveries; it does not prove the delay was an error.
      </p>
      <h3>Predict → experiment → explain</h3>
      <p>
        Now test the same idea on {original.length} synthetic deliveries.
        Predict before revealing the result.
      </p>
      <label>
        Exclude durations above {cap} minutes
        <input
          aria-label="Lesson duration threshold"
          type="range"
          min="40"
          max="150"
          step="10"
          value={cap}
          onChange={(e) => {
            setCap(Number(e.target.value));
            setRan(false);
            setPrediction("");
          }}
        />
      </label>
      <label>
        Predict the mean
        <select
          aria-label="Lesson prediction"
          value={prediction}
          onChange={(e) => {
            setPrediction(e.target.value as Prediction);
            setRan(false);
          }}
        >
          <option value="">Choose a direction</option>
          <option value="increase">Increase</option>
          <option value="decrease">Decrease</option>
          <option value="same">Stay the same</option>
        </select>
      </label>
      <Button disabled={!prediction} onClick={() => setRan(true)}>
        Test lesson prediction
      </Button>
      {result && (
        <p role="status">
          Original mean {result.before.mean!.toFixed(2)} min; selected mean{" "}
          {result.after.mean?.toFixed(2) ?? "unavailable"} min.{" "}
          {result.predictionCorrect
            ? "Your direction matched."
            : "The measurements differed from your prediction."}{" "}
          Removing high values changes the population being described.
        </p>
      )}
      <h3>Knowledge check</h3>
      <p>
        Removing slow deliveries proves that the company improved its service.
      </p>
      <div className="action-row">
        {["True", "False"].map((a) => (
          <Button
            key={a}
            variant="outline"
            aria-pressed={answer === a}
            onClick={() => setAnswer(a)}
          >
            {a}
          </Button>
        ))}
      </div>
      {answer && (
        <p role="status">
          {answer === "False" ? "Correct." : "Reconsider the comparison."}{" "}
          Changing which records you analyze is not an intervention on delivery
          service. The omitted deliveries still happened.
        </p>
      )}
      <h3>Mini-challenge and evidence</h3>
      <p>
        Compare thresholds of 60 and 120 minutes. In your saved reflection,
        state the two observed means, explain the direction, and name the
        selection limitation. These local checks give immediate practice
        feedback; verified assessment evidence comes from Quiz Arena.
      </p>
      <div className="action-row">
        <Link className="text-link" to="/investigate">
          Apply this to the full investigation
        </Link>
        <Link className="text-link" to="/practice">
          Practice the calculation in Python
        </Link>
      </div>
    </section>
  );
}
