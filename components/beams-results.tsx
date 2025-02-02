"use client";

import { Solution } from "@/app/utils/boundaryCondition";
import { SpanCriticalPoints } from "@/app/utils/criticalBMSF";
import { FixedEndMomentResults, SlopeDeflectionEquation } from "@/typings";
import BeamDiagram from "./beam-diagrams/diagrams";

interface Props {
  equations: SlopeDeflectionEquation[];
  boundaryCondition: Solution;
  finalMoments?: { [key: string]: number };
  reactions?: { [key: string]: number };
  criticalPoints?: SpanCriticalPoints[];
  results: FixedEndMomentResults[];
}

export default function BeamsResult({
  equations,
  boundaryCondition,
  finalMoments,
  reactions,
  criticalPoints,
  results,
}: Props) {
  console.log(criticalPoints);
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Fixed End Moments</h2>
        <div className="space-y-2">
          {results.map((result) => (
            <div key={result.spanLabel} className="p-4 bg-secondary rounded-lg">
              <p>Span {result.spanLabel}:</p>
              <p className="pl-4">
                FEM{result.spanLabel}: {result.startMoment.toFixed(2)}{" "}
                <span className="text-sm text-chart-2">KNM</span>
              </p>
              <p className="pl-4">
                FEM{result.spanLabel.split("").reverse().join("")}:{" "}
                {result.endMoment.toFixed(2)}{" "}
                <span className="text-sm text-chart-2">KNM</span>
              </p>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-4">
          Slope Deflection Equations
        </h3>
        <div className="space-y-4">
          {equations.map((eq) => {
            if (!eq.startEquation && !eq.endEquation) return null;

            return (
              <div
                key={eq.spanLabel}
                className="p-4 bg-secondary rounded-lg space-y-2"
              >
                <div>
                  <span className="font-medium">Span {eq.spanLabel}:</span>
                </div>
                <div className="pl-4">
                  {eq.startEquation && (
                    <div>
                      M{eq.spanLabel} ={" "}
                      <span className="font-bold">{eq.startEquation}</span>
                    </div>
                  )}
                  {eq.endEquation && (
                    <div>
                      M{eq.spanLabel.split("").reverse().join("")} ={" "}
                      <span className="font-bold">{eq.endEquation}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {boundaryCondition && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Boundary Conditions</h3>
          <div className="space-y-2 p-4 bg-secondary rounded-lg">
            <p>θB = {boundaryCondition.thetaB.toFixed(6)}</p>
            <p>θC = {boundaryCondition.thetaC.toFixed(6)}</p>
            {boundaryCondition.thetaD !== undefined && (
              <p>θD = {boundaryCondition.thetaD.toFixed(6)}</p>
            )}
          </div>
        </div>
      )}
      {finalMoments && Object.keys(finalMoments).length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Final Moments</h3>
          <div className="space-y-2 p-4 bg-secondary rounded-lg">
            {Object.entries(finalMoments).map(([key, value]) => (
              <p key={key}>
                {key} = <span className="font-bold">{value.toFixed(2)}</span>{" "}
                <span className="text-sm text-chart-2">KNM</span>
              </p>
            ))}
          </div>
        </div>
      )}
      {reactions && Object.keys(reactions).length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Support Reactions</h3>
          <div className="space-y-2 p-4 bg-secondary rounded-lg">
            {Object.entries(reactions).map(([key, value]) => (
              <p key={key}>
                {key} = <span className="font-bold">{value.toFixed(2)}</span>{" "}
                <span className="text-sm text-chart-2">KN</span>
              </p>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">
          Bending Moments and Shear Forces
        </h3>
        <div className="space-y-4">
          {criticalPoints?.map((span) => (
            <div key={span.spanLabel} className="bg-secondary rounded-lg p-4">
              <h4 className="font-medium mb-2">Span {span.spanLabel}</h4>
              <div className="space-y-2">
                {span.criticalPoints.map((point, index) => (
                  <div key={index} className="grid grid-cols-3 gap-4 text-sm">
                    <div>{point.location}</div>
                    <div>BM: {point.bendingMoment.toFixed(2)} KNm</div>
                    <div>SF: {point.shearForce.toFixed(2)} KN</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      {criticalPoints && criticalPoints.length > 0 && (
        <div className="mt-8">
          <BeamDiagram criticalPoints={criticalPoints} />
        </div>
      )}
    </div>
  );
}
