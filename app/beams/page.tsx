"use client";
import InputSpan from "@/components/input-span";
import { Button } from "@/components/ui/button";
import {
  CalculatorFormData,
  FixedEndMomentResults,
  SlopeDeflectionEquation,
  Span,
} from "@/typings";
import { useEffect, useState } from "react";
import {
  Solution,
  solveSimultaneousEquations,
} from "../utils/boundaryCondition";
import { calculateBMSF } from "../utils/calculateBMSF";
import { calculateFinalMoments } from "../utils/calculateFinalMoments";
import { calculateReactions } from "../utils/calculateReactions";
import { calculateFixedEndMoments } from "../utils/calculations";
import { SpanCriticalPoints, extractCriticalBMSF } from "../utils/criticalBMSF";
import { generateSlopeDeflectionEquations } from "../utils/slopeDeflection";
import { Input } from "@/components/ui/input";
import { LOAD_TYPES } from "../utils/loadTypes";
import BeamsResult from "@/components/beams-results";

export default function BeamCalculatorPage() {
  const [formData, setFormData] = useState<CalculatorFormData>({
    modulusOfElasticity: 1,
    momentOfInertia: 1,
    numberOfSpans: 0,
    spans: [],
    sinkingSupports: [],
  });
  console.log(formData.sinkingSupports.length);
  const [results, setResults] = useState<FixedEndMomentResults[]>([]);
  const [slopeDeflectionEquations, setSlopeDeflectionEquations] = useState<
    SlopeDeflectionEquation[]
  >([]);
  const [boundaryCondition, setBoundaryCondition] = useState<Solution>({
    thetaB: 0,
    thetaC: 0,
    thetaD: 0,
  });
  const [finalMoments, setFinalMoments] = useState<{ [key: string]: number }>(
    {}
  );
  const [reactions, setReactions] = useState<{ [key: string]: number }>({});
  const [criticalPoints, setCriticalPoints] = useState<SpanCriticalPoints[]>(
    []
  );

  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    const isValid = validateForm();
    setIsFormValid(isValid);
  }, [formData]);

  const validateForm = () => {
    if (
      formData.modulusOfElasticity <= 0 ||
      formData.momentOfInertia <= 0 ||
      formData.numberOfSpans < 3
    ) {
      return false;
    }

    for (const span of formData.spans) {
      if (
        span.length <= 0 ||
        span.momentOfInertia <= 0 ||
        span.loadMagnitude < 0
      ) {
        return false;
      }
    }

    return true;
  };

  const handleNumberOfSpansChange = (value: number) => {
    const newSpans = Array(value)
      .fill(null)
      .map(() => ({ ...initialSpan }));
    const newSinkingSupports = Array(value + 1).fill(0);

    setFormData((prev) => ({
      ...prev,
      numberOfSpans: value,
      spans: newSpans,
      sinkingSupports: newSinkingSupports,
    }));
  };

  const handleSpanChange = (index: number, span: Span) => {
    setFormData((prev) => ({
      ...prev,
      spans: prev.spans.map((s, i) => (i === index ? span : s)),
    }));
  };

  const handleSinkingSupportChange = (index: number, value: number) => {
    setFormData((prev) => ({
      ...prev,
      sinkingSupports: prev.sinkingSupports.map((s, i) =>
        i === index ? value : s
      ),
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Calculate Fixed End Moments
    const fixedEndMoments = formData.spans.map((span, index) => {
      const { start, end } = calculateFixedEndMoments(span);
      const spanLabel =
        String.fromCharCode(65 + index) + String.fromCharCode(66 + index);
      return {
        spanLabel,
        startMoment: start,
        endMoment: end,
      };
    });

    // Generate Slope Deflection Equations
    const equations = generateSlopeDeflectionEquations(
      formData.spans,
      fixedEndMoments,
      formData.sinkingSupports
    );

    const equation1 = equations[0].endEquation + equations[1].startEquation;
    const equation2 = equations[1].endEquation + equations[2].startEquation;
    const lastSpan = formData.spans[formData.spans.length - 1];
    const equation3 =
      lastSpan.endSupport === "hinged" || lastSpan.endSupport === "roller"
        ? equations[2].endEquation
        : null;

    const solutions = solveSimultaneousEquations(
      equation1,
      equation2,
      equation3,
      formData.modulusOfElasticity,
      formData.momentOfInertia
    );

    const EI = formData.modulusOfElasticity * formData.momentOfInertia;
    if (solutions) {
      const moments = calculateFinalMoments(
        equations,
        solutions.thetaB,
        solutions.thetaC,
        solutions.thetaD ?? 0,
        EI
      );

      // Calculate reactions using the moments directly instead of from state
      const reactions = calculateReactions(formData.spans, moments);

      const {
        results: bmsfResults,
        startReactions,
        startMoments,
      } = calculateBMSF(formData.spans, moments);
      const criticalPoints = extractCriticalBMSF(
        formData.spans,
        bmsfResults,
        startReactions,
        startMoments
      );

      // Update state with the final results
      setResults(fixedEndMoments);
      setSlopeDeflectionEquations(equations);
      setBoundaryCondition(solutions);
      setFinalMoments(moments);
      setReactions(reactions);
      setCriticalPoints(criticalPoints);
    }
  };

  return (
    <main>
      <div className="min-h-screen bg-gradient-to-r from-white via-teal-100 to-teal-200">
        <div className="container mx-auto py-8 max-w-4xl">
          <h1 className="text-xl md:text-3xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-teal-900">
            BEAMS CALCULATOR
          </h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Number of Spans
                </label>
                <Input
                  type="number"
                  value={formData.numberOfSpans}
                  onChange={(e) =>
                    handleNumberOfSpansChange(parseInt(e.target.value) || 0)
                  }
                  min={0}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Modulus of Elasticity (E){" "}
                  <span className="text-chart-4 text-xs">(kN/m&sup2;)</span>
                </label>
                <Input
                  type="number"
                  value={formData.modulusOfElasticity}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      modulusOfElasticity: parseFloat(e.target.value) || 0,
                    }))
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Moment of Inertia (I){" "}
                  <span className="text-chart-4 text-xs">(m&#8308;)</span>
                </label>
                <Input
                  type="number"
                  value={formData.momentOfInertia}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      momentOfInertia: parseFloat(e.target.value) || 0,
                    }))
                  }
                />
              </div>
            </div>

            <div className="flex items-center justify-between mb-10 shadow-sm border p-4 rounded-sm">
              {formData.sinkingSupports.map((value, index) => (
                <div key={index}>
                  <label className="block text-sm font-medium mb-1">
                    Sink Support {String.fromCharCode(65 + index)}{" "}
                    <span className="text-chart-4 text-xs">(m)</span>
                  </label>
                  <Input
                    type="number"
                    value={value}
                    onChange={(e) =>
                      handleSinkingSupportChange(
                        index,
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="w-32 border-chart-2"
                  />
                </div>
              ))}
            </div>

            {formData.spans.map((span, index) => (
              <div key={index} className="space-y-4">
                <InputSpan
                  span={span}
                  index={index}
                  onChange={(span) => handleSpanChange(index, span)}
                />
              </div>
            ))}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-teal-500 to-teal-800 hover:from-teal-600 hover:to-teal-600 text-2xl font-semibold font-serif"
              disabled={!isFormValid}
            >
              SUBMIT
            </Button>
          </form>

          {results.length > 0 && (
            <div className="mt-8 space-y-6">
              <BeamsResult
                equations={slopeDeflectionEquations}
                boundaryCondition={boundaryCondition}
                finalMoments={finalMoments}
                reactions={reactions}
                criticalPoints={criticalPoints}
                results={results}
              />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

const initialSpan: Span = {
  length: 0,
  momentOfInertia: 0,
  loadType: LOAD_TYPES.UDL,
  startSupport: "hinged",
  endSupport: "hinged",
  loadMagnitude: 0,
  pointLoadDistances: { a: 0, b: 0 },
};
