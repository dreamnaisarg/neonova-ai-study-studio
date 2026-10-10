import * as THREE from 'three';

export type AnatomicalSystem = 
  | 'cardiovascular' 
  | 'nervous' 
  | 'skeletal' 
  | 'respiratory' 
  | 'digestive' 
  | 'sensory' 
  | 'urinary' 
  | 'cellular_molecular';

export type AnatomicalPlane = 
  | 'anterior' 
  | 'posterior' 
  | 'lateral_left' 
  | 'lateral_right' 
  | 'superior' 
  | 'inferior' 
  | 'isometric';

export type GradeLevelMode = 
  | 'elementary' 
  | 'middle_school' 
  | 'high_school_premed';

export type MedicalViewerTheme = 'clinical_light' | 'surgical_dark';

export type AnatomicalMaterialType = 
  | 'myocardium' 
  | 'oxygenated_artery' 
  | 'deoxygenated_vein' 
  | 'valvular_cartilage' 
  | 'cortical_bone' 
  | 'articular_cartilage' 
  | 'brain_cerebrum' 
  | 'brain_cerebellum' 
  | 'brainstem' 
  | 'lung_parenchyma' 
  | 'trachea_cartilage' 
  | 'digestive_smooth_muscle' 
  | 'liver_tissue' 
  | 'cornea_lens' 
  | 'sclera_retina' 
  | 'cochlea_bone' 
  | 'renal_cortex' 
  | 'renal_pyramid' 
  | 'myelin_sheath' 
  | 'axon_soma' 
  | 'dna_sugar_phosphate' 
  | 'dna_base_pair';

export interface GradeAdaptiveContent {
  title: string;
  summary: string;
  functionDesc: string;
  clinicalOrEducationalNote: string;
  keyTerminology: string[];
}

export interface AnatomicalStructureDefinition {
  id: string;
  name: string;
  latinName?: string;
  system: AnatomicalSystem;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  geometryType: 
    | 'ventricle_chamber' 
    | 'atrium_chamber' 
    | 'aortic_arch' 
    | 'pulmonary_trunk' 
    | 'vena_cava_tube' 
    | 'cardiac_valve' 
    | 'coronary_vessels' 
    | 'cerebral_lobe' 
    | 'cerebellum_folia' 
    | 'brainstem_pons' 
    | 'skull_cranium' 
    | 'vertebral_column' 
    | 'ribcage_sternum' 
    | 'femur_tibia_joint' 
    | 'trachea_rings' 
    | 'bronchial_tree' 
    | 'lung_lobe' 
    | 'diaphragm_muscle' 
    | 'stomach_organ' 
    | 'liver_organ' 
    | 'intestinal_tract' 
    | 'eye_globe' 
    | 'cornea_dome' 
    | 'optic_nerve' 
    | 'ear_pinna_canal' 
    | 'ossicles_bones' 
    | 'cochlea_spiral' 
    | 'kidney_bean' 
    | 'renal_pyramids' 
    | 'neuron_soma' 
    | 'neuron_axon_sheaths' 
    | 'dna_helix_ribbon' 
    | 'dna_base_rungs';
  params?: Record<string, any>;
  materialType: AnatomicalMaterialType;
  color: number;
  labelCoords: [number, number, number];
  isInternal: boolean;
  crossSectionAxis?: 'x' | 'y' | 'z';
  explodedVector: [number, number, number];
  gradeContent: {
    elementary: GradeAdaptiveContent;
    middleSchool: GradeAdaptiveContent;
    highSchoolPreMed: GradeAdaptiveContent;
  };
  simulationRole?: 
    | 'ventricular_systole' 
    | 'atrial_systole' 
    | 'av_valve' 
    | 'semilunar_valve' 
    | 'lung_inhalation' 
    | 'diaphragm_descent' 
    | 'action_potential' 
    | 'arterial_pulse';
}

export interface AnatomicalModelDefinition {
  id: string;
  name: string;
  latinName?: string;
  system: AnatomicalSystem;
  categoryLabel: string;
  summary: string;
  realDimensionsCm: { height: number; width: number; depth: number };
  defaultCameraPos: [number, number, number];
  structures: AnatomicalStructureDefinition[];
  clinicalPearls: string[];
  validationChecklist: {
    landmarkCheck: boolean;
    spatialOrientation: boolean;
    hemodynamicOrPathwayCoherence: boolean;
    medicalReferenceVerified: boolean;
    referenceSources: string;
  };
  simulationConfig: {
    type: 'cardiac_cycle' | 'ventilation_cycle' | 'neural_transmission' | 'blood_circulation' | 'none';
    defaultRateBpm: number;
    rateLabel: string;
    rateUnit: string;
    minRate: number;
    maxRate: number;
  };
  quizQuestions: {
    id: string;
    question: string;
    targetStructureId: string;
    gradeLevel: 'elementary' | 'middle_school' | 'high_school';
    explanation: string;
  }[];
}
