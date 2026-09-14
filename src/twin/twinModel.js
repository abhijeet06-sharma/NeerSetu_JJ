// NeerSetu_JJ Digital Twin Data & State Model
// Represents the 11 purification stages, honest telemetry states, and physical modular reality

export const STAGES_CONFIG = [
  {
    id: 'raw_inlet',
    number: 1,
    nameKey: 'stage_raw_inlet',
    defaultName: 'Raw Water Inlet',
    role: 'Collection of untreated surface, well, or mine runoff water',
    physicalStatus: 'AVAILABLE',
    physicalDesc: 'Physical funnel & intake port present on site',
    baseDataSource: 'MODELLED',
    telemetryConnected: false,
    sensors: ['Flow rate estimator (modelled)'],
    parameters: { flow: '12 L/min', pressure: '0.4 bar' }
  },
  {
    id: 'coarse_screening',
    number: 2,
    nameKey: 'stage_coarse_screen',
    defaultName: 'Coarse Screening Basket',
    role: 'Interception of leaves, gravel, grit, and large suspended debris (>2mm)',
    physicalStatus: 'AVAILABLE',
    physicalDesc: 'Removable stainless wire basket in intake reservoir',
    baseDataSource: 'MODELLED',
    telemetryConnected: false,
    sensors: ['Basket differential pressure indicator (mechanical)'],
    parameters: { debris_captured: '85%', retention: '2mm' }
  },
  {
    id: 'mesh_filter',
    number: 3,
    nameKey: 'stage_primary_mesh',
    defaultName: 'Primary Mesh Filter',
    role: 'Fine particulate barrier down to 100 microns prior to separation',
    physicalStatus: 'AVAILABLE',
    physicalDesc: 'Micron mesh cartridge within inlet line',
    baseDataSource: 'MODELLED',
    telemetryConnected: false,
    sensors: ['None'],
    parameters: { pore_size: '100 um', status: 'Clean' }
  },
  {
    id: 'initial_storage',
    number: 4,
    nameKey: 'stage_initial_tank',
    defaultName: 'Initial Storage Tank',
    role: 'Buffer settlement tank allowing coarse sediment to settle by gravity',
    physicalStatus: 'AVAILABLE',
    physicalDesc: 'Sediment settling drum container',
    baseDataSource: 'MODELLED',
    telemetryConnected: false,
    sensors: ['Float switch (standby)'],
    parameters: { capacity: '40 Liters', level: '78%' }
  },
  {
    id: 'oil_separation',
    number: 5,
    nameKey: 'stage_oil_sep',
    defaultName: 'Oil-Water Separator',
    role: 'Automatic skimmer & coalescing plate separator for hydrocarbon runoff from mining zones',
    physicalStatus: 'AVAILABLE_STANDALONE',
    physicalDesc: 'Modular container with oleophilic belt skimmer. Not yet plumbed inline.',
    baseDataSource: 'NOT_CONNECTED',
    telemetryConnected: false,
    sensors: ['Oil-water interface sensor (planned)'],
    parameters: { hydrocarbon_removal: '94% (modelled)', skimmer_rpm: '12 rpm' }
  },
  {
    id: 'filtration_tank',
    number: 6,
    nameKey: 'stage_filtration',
    defaultName: 'Multi-layer Filtration Tank',
    role: 'Advanced chemical adsorption: Calcium-Alginate, PDC Adsorbent, AZBC Composite, Anthocyanin delivery',
    physicalStatus: 'AVAILABLE_STANDALONE',
    physicalDesc: 'Layered column cartridge. Standalone physical container.',
    baseDataSource: 'MODELLED',
    telemetryConnected: false,
    sensors: ['Differential pressure drop (modelled)'],
    layers: [
      'Layer 1: Calcium-Alginate functional bio-sorbent',
      'Layer 2: Cellulosic filter membrane 1',
      'Layer 3: PDC porous carbon adsorption bed',
      'Layer 4: Cellulosic filter membrane 2',
      'Layer 5: AZBC heavy-metal composite adsorbent',
      'Layer 6: Anthocyanin reagent delivery line'
    ],
    parameters: { adsorption_efficiency: '91%', beds_active: '6/6' }
  },
  {
    id: 'quality_chamber',
    number: 7,
    nameKey: 'stage_quality_chamber',
    defaultName: 'Optical Quality Chamber (ESP32)',
    role: 'Multi-spectral 6-band optical sensing + Edge TinyML classification of TDS, Turbidity & water status',
    physicalStatus: 'LIVE_HARDWARE',
    physicalDesc: 'ESP32 edge unit with optical flow-cell chamber. Fully wired & active!',
    baseDataSource: 'LIVE',
    telemetryConnected: true,
    sensors: [
      '6-Band Optical Array: Blue (470nm), Red (660nm), White, Green (525nm), IR (850nm), UV (385nm)',
      'High-precision NTC Water Temperature Probe',
      'Electrochemical pH Glass Probe (where equipped)'
    ],
    parameters: { edge_mcu: 'ESP32 Dual-Core 240MHz', tinyml_latency: '18ms INT8' }
  },
  {
    id: 'heavy_metal',
    number: 8,
    nameKey: 'stage_heavy_metal',
    defaultName: 'Heavy-Metal Detection Chamber',
    role: 'Optical absorbance reaction with Anthocyanin reagent to detect iron, lead & arsenic trace ions',
    physicalStatus: 'CONCEPTUAL_MODEL',
    physicalDesc: 'Reaction colorimetry stage currently digitally simulated & modelled.',
    baseDataSource: 'MODELLED',
    telemetryConnected: false,
    sensors: ['Spectrophotometric colorimetry sensor (future phase)'],
    parameters: { fe_ppb: '< 150 ppb (est)', as_risk: 'LOW' }
  },
  {
    id: 'uv_disinfection',
    number: 9,
    nameKey: 'stage_uv_chamber',
    defaultName: 'UV Disinfection Chamber',
    role: 'Germicidal 254nm ultraviolet light chamber inactivating coliform bacteria and pathogens',
    physicalStatus: 'AVAILABLE_STANDALONE',
    physicalDesc: '11W quartz UV sleeve module. Standalone unit without active telemetry.',
    baseDataSource: 'NOT_CONNECTED',
    telemetryConnected: false,
    sensors: ['UV intensity photodiode (standby)'],
    parameters: { lamp_power: '11W UV-C', dosage: '30 mJ/cm2 (nominal)' }
  },
  {
    id: 'final_quality',
    number: 10,
    nameKey: 'stage_final_quality',
    defaultName: 'Final Quality Verification',
    role: 'Confirmation testing verifying that treated water meets potable limits before storage',
    physicalStatus: 'CONCEPTUAL_MODEL',
    physicalDesc: 'Cross-verification logic. Uses edge telemetry & model extrapolation.',
    baseDataSource: 'MODELLED',
    telemetryConnected: false,
    sensors: ['Verification logic node'],
    parameters: { verification_confidence: '98.2%' }
  },
  {
    id: 'final_storage',
    number: 11,
    nameKey: 'stage_final_tank',
    defaultName: 'Treated Water Storage & Outlet',
    role: 'Food-grade clean water reservoir with dispensing tap for rural community access',
    physicalStatus: 'AVAILABLE',
    physicalDesc: 'Food-grade stainless collection container with manual dispense tap.',
    baseDataSource: 'MODELLED',
    telemetryConnected: false,
    sensors: ['Storage level ultrasonic sensor (future)'],
    parameters: { storage_capacity: '50 Liters', dispense_flow: 'Safe gravity flow' }
  }
];
