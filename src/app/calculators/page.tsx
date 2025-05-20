"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calculator, Leaf, Thermometer } from "lucide-react";

export default function CalculatorsPage() {
  // ABV Calculator State
  const [og, setOg] = useState<string>("");
  const [fg, setFg] = useState<string>("");
  const [abv, setAbv] = useState<string | null>(null);

  // IBU Calculator State
  const [hopAmount, setHopAmount] = useState<string>("28"); // ~1 oz
  const [alphaAcid, setAlphaAcid] = useState<string>("5.5");
  const [boilTime, setBoilTime] = useState<string>("60");
  const [wortGravity, setWortGravity] = useState<string>("1.050");
  const [boilVolume, setBoilVolume] = useState<string>("20"); // Liters
  const [calculatedIbu, setCalculatedIbu] = useState<string | null>(null);

  // SG Temperature Compensation State
  const [measuredSg, setMeasuredSg] = useState<string>("1.048");
  const [sampleTempC, setSampleTempC] = useState<string>("25"); // Celsius
  const [calibTempC, setCalibTempC] = useState<string>("20"); // Celsius
  const [correctedSg, setCorrectedSg] = useState<string | null>(null);

  // ABV Calculation
  useEffect(() => {
    const originalGravity = parseFloat(og);
    const finalGravity = parseFloat(fg);
    if (
      !isNaN(originalGravity) &&
      !isNaN(finalGravity) &&
      originalGravity > finalGravity &&
      finalGravity > 0
    ) {
      const calculated = (originalGravity - finalGravity) * 131.25;
      setAbv(calculated.toFixed(2));
    } else {
      setAbv(null);
    }
  }, [og, fg]);

  // IBU Calculation (Tinseth)
  useEffect(() => {
    const amount = parseFloat(hopAmount);
    const alpha = parseFloat(alphaAcid) / 100; // decimal
    const time = parseFloat(boilTime);
    const gravity = parseFloat(wortGravity);
    const volume = parseFloat(boilVolume);

    if (
      [amount, alpha, time, gravity, volume].some(isNaN) ||
      volume <= 0 ||
      time < 0
    ) {
      setCalculatedIbu(null);
      return;
    }

    const bignessFactor = 1.65 * Math.pow(0.000125, gravity - 1);
    const boilTimeFactor = (1 - Math.exp(-0.04 * time)) / 4.15;
    const utilization = bignessFactor * boilTimeFactor;

    const mgAlphaAcids = (amount * alpha * 1000) / volume;
    const ibu = utilization * mgAlphaAcids;

    setCalculatedIbu(ibu > 0 ? ibu.toFixed(1) : "0.0");
  }, [hopAmount, alphaAcid, boilTime, wortGravity, boilVolume]);

  // SG Temperature Compensation Calculation
  useEffect(() => {
    const sg = parseFloat(measuredSg);
    const tempSampleC = parseFloat(sampleTempC);
    const tempCalibC = parseFloat(calibTempC);
  
    if ([sg, tempSampleC, tempCalibC].some(isNaN)) {
      setCorrectedSg(null);
      return;
    }
  
    // Convert celsius to fahrenheit
    const cToF = (c: number) => c * 9 / 5 + 32;
    const tempSampleF = cToF(tempSampleC);
    const tempCalibF = cToF(tempCalibC);
  
    // Correction factor function (Fahrenheit version)
    const correctionFactor = (t: number) =>
      1.00130346 -
      0.000134722124 * t +
      0.00000204052596 * Math.pow(t, 2) -
      0.00000000232820948 * Math.pow(t, 3);
  
    const ratio = correctionFactor(tempSampleF) / correctionFactor(tempCalibF);
    const corrected = sg * ratio;
  
    console.log({
      sg,
      tempSampleC,
      tempSampleF,
      tempCalibC,
      tempCalibF,
      ratio,
      corrected
    });
  
    setCorrectedSg(corrected.toFixed(3));
  }, [measuredSg, sampleTempC, calibTempC]);

  return (
    <div className="container mx-auto py-8 px-4 space-y-12">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-foreground">
          Brewing Calculators
        </h1>
        <p className="text-lg text-muted-foreground mt-2 max-w-xl mx-auto">
          Handy tools for your brewing needs.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8 items-start max-w-2xl mx-auto">
        {/* ABV Calculator Card */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Calculator size={22} className="mr-2 text-primary" />
              ABV Calculator
            </CardTitle>
            <CardDescription>
              Alcohol By Volume from Original and Final Gravity.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="ogInput">Original Gravity (OG)</Label>
              <Input
                id="ogInput"
                type="number"
                step="0.001"
                value={og}
                onChange={(e) => setOg(e.target.value)}
                placeholder="e.g., 1.050"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="fgInput">Final Gravity (FG)</Label>
              <Input
                id="fgInput"
                type="number"
                step="0.001"
                value={fg}
                onChange={(e) => setFg(e.target.value)}
                placeholder="e.g., 1.010"
                className="mt-1"
              />
            </div>
            {abv !== null && (
              <div className="pt-2">
                <p className="text-lg font-semibold text-foreground">
                  Calculated ABV: <span className="text-primary">{abv}%</span>
                </p>
              </div>
            )}
            {abv === null &&
              og &&
              fg &&
              (parseFloat(og) <= parseFloat(fg) || parseFloat(fg) <= 0) && (
                <p className="text-sm text-destructive pt-2">
                  Enter valid OG & FG (OG &gt; FG &gt; 0).
                </p>
              )}
          </CardContent>
        </Card>

        {/* IBU Calculator Card */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Leaf size={22} className="mr-2 text-primary" />
              IBU Calculator (Tinseth)
            </CardTitle>
            <CardDescription>
              Estimate International Bitterness Units.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="hopAmount">Hop Amount (grams)</Label>
              <Input
                id="hopAmount"
                type="number"
                value={hopAmount}
                onChange={(e) => setHopAmount(e.target.value)}
                placeholder="e.g., 28"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="alphaAcid">Alpha Acid (%)</Label>
              <Input
                id="alphaAcid"
                type="number"
                step="0.1"
                value={alphaAcid}
                onChange={(e) => setAlphaAcid(e.target.value)}
                placeholder="e.g., 5.5"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="boilTimeIbu">Boil Time (minutes)</Label>
              <Input
                id="boilTimeIbu"
                type="number"
                value={boilTime}
                onChange={(e) => setBoilTime(e.target.value)}
                placeholder="e.g., 60"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="wortGravity">Wort Gravity (OG)</Label>
              <Input
                id="wortGravity"
                type="number"
                step="0.001"
                value={wortGravity}
                onChange={(e) => setWortGravity(e.target.value)}
                placeholder="e.g., 1.050"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="boilVolume">Post-Boil Volume (Liters)</Label>
              <Input
                id="boilVolume"
                type="number"
                step="0.1"
                value={boilVolume}
                onChange={(e) => setBoilVolume(e.target.value)}
                placeholder="e.g., 20"
                className="mt-1"
              />
            </div>
            {calculatedIbu !== null && (
              <div className="pt-2">
                <p className="text-lg font-semibold text-foreground">
                  Estimated IBU:{" "}
                  <span className="text-primary">{calculatedIbu}</span>
                </p>
              </div>
            )}
            {calculatedIbu === null &&
              [hopAmount, alphaAcid, boilTime, wortGravity, boilVolume].some(
                (val) => parseFloat(val) <= 0 && val !== wortGravity
              ) && (
                <p className="text-sm text-destructive pt-2">
                  Enter valid positive values.
                </p>
              )}
          </CardContent>
        </Card>

        {/* SG Temperature Compensation Card */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Thermometer size={22} className="mr-2 text-primary" />
              SG Temp. Correction
            </CardTitle>
            <CardDescription>
              Correct SG for temperature (Celsius).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="measuredSg">Measured SG</Label>
              <Input
                id="measuredSg"
                type="number"
                step="0.001"
                value={measuredSg}
                onChange={(e) => setMeasuredSg(e.target.value)}
                placeholder="e.g., 1.048"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="sampleTempC">Sample Temperature (°C)</Label>
              <Input
                id="sampleTempC"
                type="number"
                value={sampleTempC}
                onChange={(e) => setSampleTempC(e.target.value)}
                placeholder="e.g., 25"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="calibTempC">
                Hydrometer Calibration Temp (°C)
              </Label>
              <Input
                id="calibTempC"
                type="number"
                value={calibTempC}
                onChange={(e) => setCalibTempC(e.target.value)}
                placeholder="e.g., 20"
                className="mt-1"
              />
            </div>
            {correctedSg !== null && (
              <div className="pt-2">
                <p className="text-lg font-semibold text-foreground">
                  Corrected SG:{" "}
                  <span className="text-primary">{correctedSg}</span>
                </p>
              </div>
            )}
            {correctedSg === null &&
              [measuredSg, sampleTempC, calibTempC].some(
                (val) => val === ""
              ) && (
                <p className="text-sm text-destructive pt-2">
                  Enter all values.
                </p>
              )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
