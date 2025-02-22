"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import FramesResults from "../../components/frames-results";
import { calculateFrameFixedEndMoments } from "../utils/femFrames";
import { generalFrameEquation } from "../utils/frameBoundaryCondition";
import { generateFrameSlopeDeflectionEquations } from "../utils/frameSlopeDeflection";

import { Input } from "@/components/ui/input";

import { calculateBeamBMSF, calculateColumnBMSF } from "../utils/frameBMSF";
import {
  calculateFrameHorizontalReactions,
  calculateFrameVerticalReactions,
} from "../utils/frameReactions";
import {
  generateFrameShearEquation,
  simplifyFrameShearEquation,
  solveFrameEquations,
} from "../utils/frameShearEquation";
import { calculateFrameFinalMoments } from "../utils/framesFinalMoments";
import { Beam, CalculationResults, Column } from "./types";
import ColumnForm from "@/components/column-form";
import BeamForm from "@/components/beam-form";
import FrameShearForceDiagram from "@/components/frame-sf-diagram";
import FrameBendingMomentDiagram from "@/components/frame-bm-diagram";

const initialColumn: Column = {
  length: 0,
  momentOfInertia: 0,
  supportType: "fixed",
  loadType: "NONE",
  loadMagnitude: 0,
};

const initialBeam: Beam = {
  length: 0,
  momentOfInertia: 0,
  loadMagnitude: 0,
  loadType: "NONE",
};

export default function FramesPage() {
  const [formData, setFormData] = useState({
    numberOfColumns: 0,
    numberOfBeams: 0,
    columns: [] as Column[],
    beams: [] as Beam[],
  });

  const [results, setResults] = useState<CalculationResults | null>(null);

  const handleNumberOfColumnsChange = (value: number) => {
    const newColumns = Array(value)
      .fill(null)
      .map(() => ({ ...initialColumn }));
    setFormData((prev) => ({
      ...prev,
      numberOfColumns: value,
      columns: newColumns,
    }));
  };

  const handleNumberOfBeamsChange = (value: number) => {
    const newBeams = Array(value)
      .fill(null)
      .map(() => ({ ...initialBeam }));
    setFormData((prev) => ({
      ...prev,
      numberOfBeams: value,
      beams: newBeams,
    }));
  };

  const handleColumnChange = (
    index: number,
    field: keyof Column,
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      columns: prev.columns.map((col, i) =>
        i === index ? { ...col, [field]: value } : col
      ),
    }));
  };

  const handleBeamChange = (index: number, field: keyof Beam, value: any) => {
    setFormData((prev) => ({
      ...prev,
      beams: prev.beams.map((beam, i) =>
        i === index ? { ...beam, [field]: value } : beam
      ),
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const columnResults = formData.columns.map((column, index) => ({
      label: `Column ${index + 1}`,
      ...calculateFrameFixedEndMoments(column),
    }));

    const beamResults = formData.beams.map((beam, index) => ({
      label: `Beam ${index + 1}`,
      ...calculateFrameFixedEndMoments(beam),
    }));

    // Generate slope deflection equations
    const slopeDeflectionEquations = generateFrameSlopeDeflectionEquations(
      formData.columns,
      formData.beams,
      [...columnResults, ...beamResults]
    );

    const hasHingeOrRoller = formData.columns.some(
      (column) =>
        column.supportType === "hinged" || column.supportType === "roller"
    );

    // Get boundary equations
    const boundaryEquations = generalFrameEquation(
      slopeDeflectionEquations,
      hasHingeOrRoller
    );

    // Calculate shear equation and simplify it
    const shearEquation = generateFrameShearEquation(
      formData.columns,
      slopeDeflectionEquations
    );

    const simplifiedShearEquation = simplifyFrameShearEquation(
      shearEquation.shearEquation
    );

    // Solve the system of equations
    const solution = solveFrameEquations(
      boundaryEquations?.eq1 || "",
      boundaryEquations?.eq2 || "",
      boundaryEquations?.eq3 || null,
      simplifiedShearEquation.simplifiedEquation
    );

    const finalMoments = calculateFrameFinalMoments(
      slopeDeflectionEquations,
      formData.columns,
      solution.thetaB,
      solution.thetaC,
      solution.thetaD,
      solution.delta,
      1
    );

    // Calculate horizontal reactions
    const horizontalReactions = calculateFrameHorizontalReactions(
      formData.columns,
      finalMoments
    );

    // Add vertical reactions calculation
    const verticalReactions = calculateFrameVerticalReactions(
      formData.beams,
      finalMoments
    );

    // Calculate BMSF for columns and beams
    const columnBMSF = formData.columns.map((column, index) =>
      calculateColumnBMSF(column, index, finalMoments, horizontalReactions)
    );

    const beamBMSF = formData.beams.map((beam) =>
      calculateBeamBMSF(beam, finalMoments[`MBCs`] || 0, verticalReactions)
    );

    setResults({
      columns: columnResults,
      beams: beamResults,
      slopeDeflectionEquations,
      boundaryEquations,
      shearEquation: {
        ...shearEquation,
        simplifiedEquation: simplifiedShearEquation,
      },
      solution,
      finalMoments,
      horizontalReactions,
      verticalReactions,
      columnBMSF,
      beamBMSF,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-white via-teal-100 to-teal-200">
      <div className="container mx-auto py-8 max-w-4xl relative">
        <h1 className="text-xl md:text-3xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-teal-900">
          FRAMES CALCULATOR
        </h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Number of Columns</Label>
              <Input
                type="number"
                value={formData.numberOfColumns}
                onChange={(e) =>
                  handleNumberOfColumnsChange(parseInt(e.target.value) || 0)
                }
                min={0}
              />
            </div>
            <div className="space-y-2">
              <Label>Number of Beams</Label>
              <Input
                type="number"
                value={formData.numberOfBeams}
                onChange={(e) =>
                  handleNumberOfBeamsChange(parseInt(e.target.value) || 0)
                }
                min={0}
              />
            </div>
          </div>

          {formData.columns.length > 0 && (
            <div className="p-6 bg-teal-200 bg-opacity-50 rounded-xl backdrop-blur-sm shadow-sm">
              <ColumnForm
                columns={formData.columns}
                onColumnChange={handleColumnChange}
              />
            </div>
          )}

          {formData.beams.length > 0 && (
            <div className="p-6 bg-teal-200 bg-opacity-50 rounded-xl backdrop-blur-sm shadow-sm">
              <BeamForm
                beams={formData.beams}
                onBeamChange={handleBeamChange}
              />
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-teal-500 to-teal-800 hover:from-teal-600 hover:to-teal-600 text-2xl font-semibold font-serif"
            disabled={
              formData.numberOfColumns === 0 && formData.numberOfBeams === 0
            }
          >
            SUBMIT
          </Button>
        </form>

        {results && (
          <div className="mt-8 p-6 bg-teal-400 rounded-xl backdrop-blur-sm">
            <FramesResults results={results} />
          </div>
        )}
        <div className="bg-teal-600/70 flex flex-col space-y-4 mt-10 rounded-md p-4">
          <div>{results && <FrameShearForceDiagram results={results} />}</div>
          {results && <FrameBendingMomentDiagram results={results} />}
        </div>
      </div>
    </div>
  );
}
