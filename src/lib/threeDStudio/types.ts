import * as THREE from 'three';

export type ModelCategory = 
  | 'mechanical' 
  | 'vehicle' 
  | 'aircraft' 
  | 'architecture' 
  | 'biology' 
  | 'anatomy' 
  | 'scientific' 
  | 'geography' 
  | 'historical'
  | 'object';

export type ModelQualityLevel = 'standard' | 'high' | 'ultra';

export type LightingPreset = 'studio' | 'daylight' | 'lab' | 'cinematic' | 'technical';

export type CameraViewAngle = 
  | 'perspective' 
  | 'front' 
  | 'rear' 
  | 'left' 
  | 'right' 
  | 'top' 
  | 'bottom' 
  | 'closeup' 
  | 'overview';

export type PBRMaterialType = 
  | 'painted_metal' 
  | 'bare_metal' 
  | 'brushed_metal' 
  | 'polished_metal' 
  | 'glass' 
  | 'transparent_plastic' 
  | 'rubber' 
  | 'leather' 
  | 'fabric' 
  | 'wood' 
  | 'concrete' 
  | 'ceramic' 
  | 'carbon_fiber' 
  | 'plastic' 
  | 'stone' 
  | 'skin' 
  | 'organic';

export type TexturePatternType = 
  | 'smooth' 
  | 'anisotropic_brushed' 
  | 'panel_seams_rivets' 
  | 'tire_tread' 
  | 'carbon_twill' 
  | 'cellular_myocardium' 
  | 'concrete_grit' 
  | 'wood_grain';

export interface ComponentMovement {
  type: 'spin' | 'oscillate' | 'pulse' | 'articulate';
  axis: 'x' | 'y' | 'z';
  speed: number;
  amplitude?: number;
}

export interface ModelComponentDefinition {
  id: string;
  name: string;
  subsystem: string;
  shapeType: 
    | 'compound_hull' 
    | 'extruded_aerofoil' 
    | 'curved_canopy' 
    | 'articulated_rotor' 
    | 'wheel_assembly' 
    | 'strut_tube' 
    | 'beveled_chassis' 
    | 'fluted_column' 
    | 'organic_chamber' 
    | 'vascular_tube' 
    | 'optical_lens' 
    | 'stator_coil' 
    | 'solar_panel' 
    | 'parabolic_dish' 
    | 'gear_spoke'
    | 'detail_fastener';
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  params?: Record<string, number | boolean | string>;
  materialType: PBRMaterialType;
  color: number;
  roughness: number;
  metalness: number;
  clearcoat?: number;
  transmission?: number;
  opacity?: number;
  texturePattern?: TexturePatternType;
  functionDesc: string;
  simpleExplanation: string;
  technicalDetails: string;
  explodeVector: [number, number, number];
  movement?: ComponentMovement;
  children?: ModelComponentDefinition[];
}

export interface MicroDetailDefinition {
  id: string;
  name: string;
  type: 'rivet_strip' | 'bolt_ring' | 'panel_seam' | 'antenna_mast' | 'pitot_tube' | 'cable_conduit' | 'cooling_vent';
  position: [number, number, number];
  rotation: [number, number, number];
  count?: number;
  spacing?: number;
}

export interface RealismValidationReport {
  isCoherent: boolean;
  score: number; // 0 to 100
  checks: {
    proportionCheck: boolean;
    connectionCheck: boolean;
    materialAppropriateness: boolean;
    polygonBudget: boolean;
    symmetryVerified: boolean;
  };
  notes: string[];
}

export interface EducationalStructuralPlan {
  id: string;
  prompt: string;
  objectName: string;
  category: ModelCategory;
  realWorldDimensions: {
    lengthMeters: number;
    widthMeters: number;
    heightMeters: number;
  };
  summary: string;
  gradeLevel: string;
  scaleNote: string;
  materialNotes: string;
  primaryComponents: ModelComponentDefinition[];
  secondaryComponents: ModelComponentDefinition[];
  microDetails: MicroDetailDefinition[];
  validation: RealismValidationReport;
  quizQuestions: {
    question: string;
    targetPartId: string;
    explanation: string;
  }[];
}

export type GenerationStageId = 
  | 'analyzing' 
  | 'primary_form' 
  | 'secondary_structures' 
  | 'materials_pbr' 
  | 'micro_details' 
  | 'realism_check' 
  | 'viewer_ready';

export interface GenerationProgressEvent {
  stage: GenerationStageId;
  label: string;
  detail: string;
  percentage: number;
  activeComponent?: string;
}
