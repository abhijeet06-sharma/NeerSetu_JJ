// NeerSetu_JJ What-If Process Simulation Sandbox
// Models theoretical purification reduction efficiency for SIH Judges demonstrations
// STRICT: All outputs explicitly tagged with SIMULATED data source!

export class WhatIfEngine {
  constructor() {
    this.isActive = false;
    this.rawWaterInputs = {
      turbidity: 45, // NTU (Heavy monsoon/mine runoff)
      hydrocarbons: 25, // ppm (Mine machinery oil runoff)
      heavyMetalsRisk: 'HIGH' // Low, Moderate, High
    };
  }

  setRawWaterInputs(inputs) {
    this.rawWaterInputs = { ...this.rawWaterInputs, ...inputs };
  }

  getSimulationResults() {
    const rawTurb = this.rawWaterInputs.turbidity;
    const rawOil = this.rawWaterInputs.hydrocarbons;
    const metalRisk = this.rawWaterInputs.heavyMetalsRisk;

    // Model purification stage reductions mathematically:
    // Stage 2 & 3 (Coarse + Mesh): Drops turbidity by 40%
    const postMeshTurb = rawTurb * 0.6;

    // Stage 5 (Oil Separator): Removes 92% of hydrocarbons
    const postOilHydrocarbons = Number((rawOil * 0.08).toFixed(1));

    // Stage 6 (Filtration: Calcium-Alginate + PDC + AZBC):
    // Removes 85% of remaining turbidity, 95% of heavy metals
    const postFiltrationTurb = Number((postMeshTurb * 0.15).toFixed(1));
    const metalRemoval = metalRisk === 'HIGH' ? '92% Reduction' : '98% Reduction';

    // Stage 7 (Optical Sensor simulated response)
    const simulatedTds = Math.round(180 + (postFiltrationTurb * 18));
    const simulatedTurb = Math.max(0.6, postFiltrationTurb);
    const simulatedPh = metalRisk === 'HIGH' ? 6.8 : 7.2;

    // Stage 9 (UV): Pathogen log reduction
    const pathogenInactivation = '99.9% (3-Log reduction)';

    return {
      raw: {
        turbidity: rawTurb,
        hydrocarbons: rawOil,
        metalRisk: metalRisk
      },
      stageReductions: {
        screening: { turbReduction: '40%', outputTurb: postMeshTurb.toFixed(1) },
        oilSeparator: { oilReduction: '92%', outputOil: postOilHydrocarbons },
        filtration: { metalReduction: metalRemoval, outputTurb: postFiltrationTurb },
        uvDisinfection: { disinfection: pathogenInactivation }
      },
      finalSimulatedReading: {
        tds: simulatedTds,
        turbidity: simulatedTurb,
        ph: simulatedPh,
        temperature: 27.2,
        water_status: simulatedTurb < 3.5 ? 'GOOD' : 'ATTENTION',
        data_source: 'SIMULATED' // Mandatory badge
      }
    };
  }
}

export const whatIfEngine = new WhatIfEngine();
