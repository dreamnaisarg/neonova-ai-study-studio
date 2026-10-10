import { AnatomicalModelDefinition } from './types';

export const ANATOMICAL_MODELS_CATALOG: Record<string, AnatomicalModelDefinition> = {
  // 1. CARDIOVASCULAR SYSTEM: THE HUMAN HEART
  heart: {
    id: 'heart',
    name: 'The Human Heart (4-Chamber Cardiovascular Pump)',
    latinName: 'Cor humanum',
    system: 'cardiovascular',
    categoryLabel: 'Circulatory / Cardiovascular System',
    summary: 'The muscular cardiovascular pump featuring four distinct chambers, unidirectional fibrous cardiac valves, myocardium, ascending aorta, pulmonary trunk, and vena cava.',
    realDimensionsCm: { height: 12, width: 8.5, depth: 6 },
    defaultCameraPos: [0, 1.2, 5.8],
    clinicalPearls: [
      'Normal stroke volume is approximately 70 mL, generating a cardiac output of ~5.0 L/min at rest.',
      'The left ventricular myocardium is triple the thickness of the right ventricle to overcome systemic peripheral vascular resistance.',
      'Fibrous skeleton of the heart electrically insulates atria from ventricles, ensuring sequential contraction coordinated by the AV node.'
    ],
    validationChecklist: {
      landmarkCheck: true,
      spatialOrientation: true,
      hemodynamicOrPathwayCoherence: true,
      medicalReferenceVerified: true,
      referenceSources: "Gray's Anatomy 42nd Ed., Netter Atlas of Human Anatomy 7th Ed."
    },
    simulationConfig: {
      type: 'cardiac_cycle',
      defaultRateBpm: 72,
      rateLabel: 'Heart Rate (Cardiac Cycle)',
      rateUnit: 'BPM',
      minRate: 45,
      maxRate: 140
    },
    structures: [
      {
        id: 'left_ventricle',
        name: 'Left Ventricle (Thick Myocardium)',
        latinName: 'Ventriculus sinister cordis',
        system: 'cardiovascular',
        position: [0.35, -0.65, 0.2],
        rotation: [0, 0, 0],
        scale: [1.1, 1.5, 0.95],
        geometryType: 'ventricle_chamber',
        materialType: 'myocardium',
        color: 0xdc2626,
        labelCoords: [0.75, -0.6, 0.45],
        isInternal: false,
        explodedVector: [0.6, -0.4, 0.3],
        simulationRole: 'ventricular_systole',
        gradeContent: {
          elementary: {
            title: 'Left Ventricle — The Power Pump',
            summary: 'The strongest muscle chamber in your heart.',
            functionDesc: 'Pumps fresh red oxygen-rich blood out to every muscle, organ, and your brain.',
            clinicalOrEducationalNote: 'Its muscular walls are extra thick because it has to push blood all the way down to your toes!',
            keyTerminology: ['Pumping Chamber', 'Oxygen-rich blood', 'Heart muscle']
          },
          middleSchool: {
            title: 'Left Ventricle (Systemic Pump)',
            summary: 'High-pressure chamber generating systemic blood flow.',
            functionDesc: 'Contracts during ventricular systole to eject blood through the aortic valve into the systemic aorta.',
            clinicalOrEducationalNote: 'Generates systolic blood pressure averaging 120 mmHg in healthy resting adolescents.',
            keyTerminology: ['Systole', 'Aorta', 'Myocardium', 'Systemic circulation']
          },
          highSchoolPreMed: {
            title: 'Left Ventricle (Myocardial Architecture & Hemodynamics)',
            summary: 'High-resistance conical chamber with spiral helical myocardial fiber orientation.',
            functionDesc: 'Develops peak systolic pressures (100–140 mmHg) to overcome systemic vascular resistance (SVR) and maintain cerebral and renal perfusion.',
            clinicalOrEducationalNote: 'Histology shows branched cardiomyocytes joined by intercalated discs with gap junctions. Pathologic chronic hypertension leads to concentric left ventricular hypertrophy (LVH).',
            keyTerminology: ['Afterload', 'Ejection Fraction (LVEF ~55-70%)', 'Concentric Hypertrophy', 'Intercalated discs']
          }
        }
      },
      {
        id: 'right_ventricle',
        name: 'Right Ventricle',
        latinName: 'Ventriculus dexter cordis',
        system: 'cardiovascular',
        position: [-0.45, -0.55, 0.3],
        rotation: [0, 0, 0],
        scale: [0.95, 1.35, 0.85],
        geometryType: 'ventricle_chamber',
        materialType: 'myocardium',
        color: 0x3b82f6,
        labelCoords: [-0.95, -0.55, 0.55],
        isInternal: false,
        explodedVector: [-0.7, -0.3, 0.3],
        simulationRole: 'ventricular_systole',
        gradeContent: {
          elementary: {
            title: 'Right Ventricle — The Lung Pump',
            summary: 'The chamber that sends used blood to get fresh air.',
            functionDesc: 'Pumps blue used blood to your lungs so it can pick up fresh oxygen when you breathe in.',
            clinicalOrEducationalNote: 'Has thinner walls than the left side because the lungs are right next door!',
            keyTerminology: ['Blue blood', 'Lungs', 'Breathing']
          },
          middleSchool: {
            title: 'Right Ventricle (Pulmonary Circulation)',
            summary: 'Low-pressure chamber driving pulmonary gas exchange.',
            functionDesc: 'Ejects deoxygenated blood through the pulmonary semilunar valve into the pulmonary trunk.',
            clinicalOrEducationalNote: 'Operates at approximately 25/10 mmHg systolic/diastolic pressure.',
            keyTerminology: ['Pulmonary circulation', 'Pulmonary artery', 'Deoxygenated blood']
          },
          highSchoolPreMed: {
            title: 'Right Ventricle (Pulmonary Hemodynamics)',
            summary: 'Crescentic chamber wrapped around the interventricular septum, highly compliant.',
            functionDesc: 'Generates ~25 mmHg systolic pressure across the low-resistance pulmonary vascular bed (PVR ~1-2 Wood units).',
            clinicalOrEducationalNote: 'Susceptible to acute dilation in massive pulmonary embolism (acute cor pulmonale) due to abrupt afterload spike.',
            keyTerminology: ['Pulmonary Vascular Resistance', 'Cor Pulmonale', 'Tricuspid annular plane (TAPSE)']
          }
        }
      },
      {
        id: 'left_atrium',
        name: 'Left Atrium & Pulmonary Veins',
        latinName: 'Atrium sinistrum',
        system: 'cardiovascular',
        position: [0.45, 0.65, -0.2],
        rotation: [0, 0, 0],
        scale: [0.85, 0.85, 0.85],
        geometryType: 'atrium_chamber',
        materialType: 'myocardium',
        color: 0xf87171,
        labelCoords: [0.95, 0.7, -0.15],
        isInternal: false,
        explodedVector: [0.5, 0.4, -0.4],
        simulationRole: 'atrial_systole',
        gradeContent: {
          elementary: {
            title: 'Left Atrium — Receiving Room',
            summary: 'The chamber that welcomes fresh oxygenated blood from the lungs.',
            functionDesc: 'Receives bright red blood from the lungs and pours it down into the left ventricle.',
            clinicalOrEducationalNote: 'Acts like a holding tank right before the big pump squeezes.',
            keyTerminology: ['Receiving chamber', 'Lungs']
          },
          middleSchool: {
            title: 'Left Atrium (Oxygenated Reservoir)',
            summary: 'Posterior thin-walled chamber receiving 4 pulmonary veins.',
            functionDesc: 'Collects oxygenated blood and delivers end-diastolic filling (atrial kick) through the mitral valve.',
            clinicalOrEducationalNote: 'The 4 pulmonary veins are unique as veins carrying oxygenated blood in the adult body.',
            keyTerminology: ['Pulmonary veins', 'Mitral valve', 'Atrial kick']
          },
          highSchoolPreMed: {
            title: 'Left Atrium (Anatomy & Electrophysiology)',
            summary: 'Posterior base of heart forming cardiac silhouette anterior to esophagus.',
            functionDesc: 'Generates ~10–15% of ventricular end-diastolic volume through active atrial systole (a-wave on venous pressure tracing).',
            clinicalOrEducationalNote: 'Sleeve of myocardium extending into pulmonary veins is the primary trigger focus for atrial fibrillation (AFib).',
            keyTerminology: ['Pulmonary venous ostia', 'Atrial Fibrillation', 'Left atrial appendage (LAA thrombus)']
          }
        }
      },
      {
        id: 'right_atrium',
        name: 'Right Atrium & Vena Cava',
        latinName: 'Atrium dextrum',
        system: 'cardiovascular',
        position: [-0.65, 0.55, -0.1],
        rotation: [0, 0, 0],
        scale: [0.9, 0.9, 0.9],
        geometryType: 'atrium_chamber',
        materialType: 'myocardium',
        color: 0x60a5fa,
        labelCoords: [-1.15, 0.6, -0.05],
        isInternal: false,
        explodedVector: [-0.6, 0.4, -0.3],
        simulationRole: 'atrial_systole',
        gradeContent: {
          elementary: {
            title: 'Right Atrium — Return Chamber',
            summary: 'Where tired used blood enters the heart.',
            functionDesc: 'Receives blood returning from your arms, legs, and body via large veins.',
            clinicalOrEducationalNote: 'Contains your natural internal pacemaker that keeps your heart beating in rhythm!',
            keyTerminology: ['Natural Pacemaker', 'Main Veins']
          },
          middleSchool: {
            title: 'Right Atrium (Systemic Venous Return)',
            summary: 'Thin-walled chamber receiving superior and inferior vena cava.',
            functionDesc: 'Collects systemic venous return and passes it through the tricuspid valve into the right ventricle.',
            clinicalOrEducationalNote: 'Houses the Sinoatrial (SA) node, the natural pacemaker setting your resting heart rate.',
            keyTerminology: ['Sinoatrial (SA) Node', 'Superior Vena Cava', 'Inferior Vena Cava']
          },
          highSchoolPreMed: {
            title: 'Right Atrium (Electrophysiology & Venous Hemodynamics)',
            summary: 'Anterior chamber containing crista terminalis, pectinate muscles, and fossa ovalis.',
            functionDesc: 'Measures Central Venous Pressure (CVP ~2-6 mmHg) reflecting right ventricular preload.',
            clinicalOrEducationalNote: 'Houses SA node near SVC junction and AV node at the apex of Triangle of Koch. Fossa ovalis represents patent foramen ovale (PFO) remnant.',
            keyTerminology: ['SA Node', 'Triangle of Koch', 'Fossa Ovalis', 'Central Venous Pressure']
          }
        }
      },
      {
        id: 'aorta_arch',
        name: 'Aortic Arch & Systemic Arteries',
        latinName: 'Arcus aortae',
        system: 'cardiovascular',
        position: [0.0, 0.8, 0.0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        geometryType: 'aortic_arch',
        materialType: 'oxygenated_artery',
        color: 0xef4444,
        labelCoords: [0.4, 1.45, 0.15],
        isInternal: false,
        explodedVector: [0, 0.9, 0],
        simulationRole: 'arterial_pulse',
        gradeContent: {
          elementary: {
            title: 'The Aorta — The Giant Highway Artery',
            summary: 'The biggest blood vessel in your whole body.',
            functionDesc: 'Arches over the top of the heart like a candy cane to send oxygen-rich blood everywhere.',
            clinicalOrEducationalNote: 'Has three branches at the top that feed your arms and your brain!',
            keyTerminology: ['Main Artery', 'Big Blood Vessel']
          },
          middleSchool: {
            title: 'Aortic Arch (Systemic Trunk)',
            summary: 'High-pressure elastic arterial conduit distributing blood body-wide.',
            functionDesc: 'Dampens pulsatile pressure from the heart and channels blood into the brachiocephalic, carotid, and subclavian arteries.',
            clinicalOrEducationalNote: 'Elastic walls stretch during systole and recoil during diastole (Windkessel effect).',
            keyTerminology: ['Brachiocephalic artery', 'Carotid artery', 'Windkessel effect']
          },
          highSchoolPreMed: {
            title: 'Aortic Arch (Biomechanics & Vascular Branching)',
            summary: 'Major elastic conduit branching into brachiocephalic trunk, left common carotid, and left subclavian artery.',
            functionDesc: 'High elastin content in tunica media generates Windkessel recoil, converting intermittent stroke volume into continuous peripheral perfusion.',
            clinicalOrEducationalNote: 'Site of baroreceptors (vagus nerve CN X innervation) sensing MAP changes. Prone to type A aortic dissection originating in the ascending aorta.',
            keyTerminology: ['Windkessel Mechanism', 'Baroreceptors', 'Tunica Media', 'Type A Dissection']
          }
        }
      },
      {
        id: 'pulmonary_artery_trunk',
        name: 'Pulmonary Artery Trunk & Bifurcation',
        latinName: 'Truncus pulmonalis',
        system: 'cardiovascular',
        position: [0.0, 0.6, 0.25],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        geometryType: 'pulmonary_trunk',
        materialType: 'deoxygenated_vein',
        color: 0x2563eb,
        labelCoords: [-0.4, 1.1, 0.35],
        isInternal: false,
        explodedVector: [-0.2, 0.8, 0.3],
        gradeContent: {
          elementary: {
            title: 'Pulmonary Artery — Lung Highway',
            summary: 'The special blue artery leading to both lungs.',
            functionDesc: 'Splits in two so blue blood can go to the left lung and the right lung simultaneously.',
            clinicalOrEducationalNote: 'Even though it is called an artery, it carries deoxygenated blood!',
            keyTerminology: ['Lung Artery', 'Blue Blood']
          },
          middleSchool: {
            title: 'Pulmonary Trunk & Arteries',
            summary: 'Bifurcating vessel directing deoxygenated blood to alveolar capillaries.',
            functionDesc: 'Originates at the pulmonary valve and bifurcates into the right and left pulmonary arteries.',
            clinicalOrEducationalNote: 'The only major arteries in the adult body carrying deoxygenated blood.',
            keyTerminology: ['Pulmonary Trunk', 'Alveolar capillaries']
          },
          highSchoolPreMed: {
            title: 'Pulmonary Trunk (Hemodynamics & Embryology)',
            summary: 'Anterior great vessel arising from the infundibulum (conus arteriosus) of the right ventricle.',
            functionDesc: 'Divides beneath aortic arch into right (passes posterior to ascending aorta/SVC) and left pulmonary arteries.',
            clinicalOrEducationalNote: 'Connected to aortic arch via ligamentum arteriosum (obliterated fetal ductus arteriosus, patent in PDA with continuous machinery murmur).',
            keyTerminology: ['Ligamentum Arteriosum', 'Patent Ductus Arteriosus (PDA)', 'Conus Arteriosus']
          }
        }
      },
      {
        id: 'cardiac_valves',
        name: 'Fibrous Cardiac Valves (Mitral & Tricuspid)',
        latinName: 'Valvae cordis',
        system: 'cardiovascular',
        position: [0.0, 0.05, 0.15],
        rotation: [0, 0, 0],
        scale: [0.9, 0.9, 0.9],
        geometryType: 'cardiac_valve',
        materialType: 'valvular_cartilage',
        color: 0xfef08a,
        labelCoords: [0.2, 0.15, 0.45],
        isInternal: true,
        explodedVector: [0, 0.2, 0.6],
        simulationRole: 'av_valve',
        gradeContent: {
          elementary: {
            title: 'Heart Valves — One-Way Trapdoors',
            summary: 'Flaps that keep blood flowing forward, never backward.',
            functionDesc: 'They snap shut between heartbeats to prevent blood from leaking backward.',
            clinicalOrEducationalNote: 'When you hear "lub-dub" with a stethoscope, you are hearing these doors snapping shut!',
            keyTerminology: ['One-Way Doors', 'Heartbeat Sounds (Lub-Dub)']
          },
          middleSchool: {
            title: 'Cardiac Valves (Atrioventricular & Semilunar)',
            summary: 'Fibrous leaflets ensuring unidirectional forward blood flow.',
            functionDesc: 'Tricuspid and bicuspid (mitral) valves close during systole (S1 sound); aortic and pulmonary valves close during diastole (S2 sound).',
            clinicalOrEducationalNote: 'Chordae tendineae (heart strings) prevent mitral valve prolapse under high pressure.',
            keyTerminology: ['Mitral Valve', 'Tricuspid Valve', 'S1/S2 Heart Sounds', 'Chordae Tendineae']
          },
          highSchoolPreMed: {
            title: 'Valvular Mechanics & Cardiac Auscultation',
            summary: 'Four fibrous endocardial duplicate valves anchored to the fibrous cardiac skeleton.',
            functionDesc: 'Mitral (bicuspid, 2 cusps) and tricuspid (3 cusps) valves tethered by chordae tendineae to papillary muscles. Semilunar valves (aortic, pulmonary) have 3 pocket-like lunules.',
            clinicalOrEducationalNote: 'S1 coincides with AV valve closure (isometric contraction); S2 with semilunar valve closure (isometric relaxation). Stenosis produces systolic/diastolic ejection murmurs.',
            keyTerminology: ['Papillary Muscles', 'S1/S2 Acoustics', 'Aortic Stenosis', 'Mitral Regurgitation']
          }
        }
      }
    ],
    quizQuestions: [
      {
        id: 'q_heart_1',
        question: 'Which chamber of the heart has the thickest muscular wall to pump blood through the entire body?',
        targetStructureId: 'left_ventricle',
        gradeLevel: 'middle_school',
        explanation: 'The left ventricle has thick myocardium (about triple the thickness of the right ventricle) to overcome high systemic vascular resistance.'
      },
      {
        id: 'q_heart_2',
        question: 'What creates the classic "lub-dub" sound heard with a stethoscope during a heartbeat?',
        targetStructureId: 'cardiac_valves',
        gradeLevel: 'middle_school',
        explanation: 'The heart sounds are caused by the closure of the cardiac valves: S1 ("lub") is the closure of the mitral and tricuspid valves, while S2 ("dub") is the closure of the aortic and pulmonary semilunar valves.'
      },
      {
        id: 'q_heart_3',
        question: 'Which great vessel distributes freshly oxygenated blood from the left ventricle into systemic circulation?',
        targetStructureId: 'aorta_arch',
        gradeLevel: 'elementary',
        explanation: 'The aorta is the largest artery in the human body, arching over the heart and branching to deliver oxygenated blood to all organs.'
      }
    ]
  },

  // 2. NERVOUS SYSTEM: THE HUMAN BRAIN
  brain: {
    id: 'brain',
    name: 'The Human Brain (Central Nervous System Atlas)',
    latinName: 'Encephalon humanum',
    system: 'nervous',
    categoryLabel: 'Central Nervous System',
    summary: 'The anatomical organ of cognition, motor command, sensory integration, and autonomous homeostasis comprising the cerebral cortex lobes, cerebellum, and brainstem.',
    realDimensionsCm: { height: 14, width: 14, depth: 16.5 },
    defaultCameraPos: [0, 1.4, 5.5],
    clinicalPearls: [
      'The brain consumes approximately 20% of resting cardiac output and 20% of metabolic oxygen despite accounting for only 2% of body mass.',
      'Bilateral symmetry with specialized hemispheric lateralization (e.g. left hemispheric dominance for language in ~95% of individuals).',
      'The circle of Willis provides redundant collateral blood supply between carotid and vertebral arterial networks.'
    ],
    validationChecklist: {
      landmarkCheck: true,
      spatialOrientation: true,
      hemodynamicOrPathwayCoherence: true,
      medicalReferenceVerified: true,
      referenceSources: "Kandel's Principles of Neural Science 6th Ed., Gray's Anatomy"
    },
    simulationConfig: {
      type: 'neural_transmission',
      defaultRateBpm: 60,
      rateLabel: 'Neural Oscillations',
      rateUnit: 'Hz',
      minRate: 10,
      maxRate: 100
    },
    structures: [
      {
        id: 'frontal_lobe',
        name: 'Frontal Lobe (Executive Cortex & Motor Strip)',
        latinName: 'Lobus frontalis',
        system: 'nervous',
        position: [0.0, 0.45, 0.75],
        rotation: [0, 0, 0],
        scale: [1.2, 1.1, 1.1],
        geometryType: 'cerebral_lobe',
        materialType: 'brain_cerebrum',
        color: 0x38bdf8,
        labelCoords: [0.0, 0.95, 1.25],
        isInternal: false,
        explodedVector: [0, 0.4, 0.7],
        gradeContent: {
          elementary: {
            title: 'Frontal Lobe — The Thinking & Planning Zone',
            summary: 'The front area of your brain that makes decisions.',
            functionDesc: 'Controls problem-solving, making good choices, your personality, and moves your voluntary muscles.',
            clinicalOrEducationalNote: 'It is the part of your brain that works when you solve a math problem or decide to be kind!',
            keyTerminology: ['Thinking brain', 'Decision making', 'Moving muscles']
          },
          middleSchool: {
            title: 'Frontal Lobe (Executive & Motor Cortex)',
            summary: 'Anterior cerebral cortex governing voluntary movement and cognition.',
            functionDesc: 'Contains the primary motor cortex (precentral gyrus) and prefrontal cortex for planning, judgment, and emotional regulation.',
            clinicalOrEducationalNote: 'Houses Broca\'s area in the dominant hemisphere, which coordinates expressive speech production.',
            keyTerminology: ['Prefrontal cortex', 'Primary motor cortex', "Broca's area"]
          },
          highSchoolPreMed: {
            title: 'Frontal Lobe (Neuroanatomy & Cortical Mapping)',
            summary: 'Largest cerebral lobe bounded posteriorly by the central sulcus of Rolando and inferiorly by the lateral fissure of Sylvius.',
            functionDesc: 'Brodmann Area 4 (primary motor cortex) exhibits somatotopic homunculus representation. Prefrontal cortex governs working memory, task sequencing, and social inhibition.',
            clinicalOrEducationalNote: 'Lesions in Broca\'s area (BA 44/45) produce non-fluent, expressive aphasia with preserved comprehension. Prefrontal damage produces behavioral disinhibition and abulia.',
            keyTerminology: ['Central Sulcus', 'Motor Homunculus', 'Expressive Aphasia', 'Brodmann Area 4']
          }
        }
      },
      {
        id: 'parietal_lobe',
        name: 'Parietal Lobe (Somatosensory Cortex)',
        latinName: 'Lobus parietalis',
        system: 'nervous',
        position: [0.0, 0.65, -0.3],
        rotation: [0, 0, 0],
        scale: [1.2, 1.0, 1.0],
        geometryType: 'cerebral_lobe',
        materialType: 'brain_cerebrum',
        color: 0xa855f7,
        labelCoords: [0.0, 1.15, -0.35],
        isInternal: false,
        explodedVector: [0, 0.5, -0.3],
        gradeContent: {
          elementary: {
            title: 'Parietal Lobe — The Touch & Sensation Center',
            summary: 'Processes how things feel.',
            functionDesc: 'Lets you know if something is hot, cold, soft, or prickly, and helps you understand where your arms and legs are.',
            clinicalOrEducationalNote: 'Works like a GPS for your body so you can touch your nose with your eyes closed!',
            keyTerminology: ['Touch', 'Temperature', 'Body sense']
          },
          middleSchool: {
            title: 'Parietal Lobe (Somatosensory Integration)',
            summary: 'Superior posterior lobe mapping sensory information.',
            functionDesc: 'Houses the primary somatosensory cortex (postcentral gyrus) processing touch, pressure, pain, temperature, and proprioception.',
            clinicalOrEducationalNote: 'Integrates visual and spatial cues to help navigate 3D space.',
            keyTerminology: ['Somatosensory cortex', 'Proprioception', 'Postcentral gyrus']
          },
          highSchoolPreMed: {
            title: 'Parietal Lobe (Sensory Homunculus & Spatial Processing)',
            summary: 'Situated posterior to the central sulcus and superior to the parieto-occipital sulcus.',
            functionDesc: 'Brodmann Areas 3, 1, 2 represent the sensory homunculus, receiving tertiary thalamocortical afferents via ventral posterolateral (VPL) nucleus.',
            clinicalOrEducationalNote: 'Non-dominant parietal lobe lesions (typically right hemisphere) result in contralateral hemispatial neglect and anosognosia.',
            keyTerminology: ['Sensory Homunculus', 'VPL Thalamic Relay', 'Hemispatial Neglect', 'Stereognosis']
          }
        }
      },
      {
        id: 'occipital_lobe',
        name: 'Occipital Lobe (Visual Cortex V1)',
        latinName: 'Lobus occipitalis',
        system: 'nervous',
        position: [0.0, 0.15, -1.15],
        rotation: [0, 0, 0],
        scale: [1.1, 0.85, 0.9],
        geometryType: 'cerebral_lobe',
        materialType: 'brain_cerebrum',
        color: 0x10b981,
        labelCoords: [0.0, 0.55, -1.55],
        isInternal: false,
        explodedVector: [0, 0.2, -0.7],
        gradeContent: {
          elementary: {
            title: 'Occipital Lobe — The Vision Screen',
            summary: 'The back part of your brain that sees pictures.',
            functionDesc: 'Takes the light signals from your eyes and turns them into colors, shapes, and faces.',
            clinicalOrEducationalNote: 'Even though your eyes are at the front of your head, seeing happens in the very back of your brain!',
            keyTerminology: ['Seeing', 'Colors', 'Shapes']
          },
          middleSchool: {
            title: 'Occipital Lobe (Primary Visual Center)',
            summary: 'Posterior cerebral cortex dedicated to visual reception and processing.',
            functionDesc: 'Processes retinal signals sent along optic radiations to distinguish motion, color, contrast, and depth.',
            clinicalOrEducationalNote: 'Damage to this area can cause cortical blindness even if the physical eyes are completely healthy.',
            keyTerminology: ['Primary visual cortex (V1)', 'Optic radiation', 'Retinotopic map']
          },
          highSchoolPreMed: {
            title: 'Occipital Lobe (Retinotopic Calcarine Cortex)',
            summary: 'Most posterior cerebral lobe surrounding the calcarine sulcus (Brodmann Area 17/V1).',
            functionDesc: 'Maintains precise retinotopic orientation. Sends parallel visual streams: dorsal ("where") pathway to parietal lobe and ventral ("what") pathway to temporal lobe.',
            clinicalOrEducationalNote: 'Posterior cerebral artery (PCA) stroke leads to contralateral homonymous hemianopia with macular sparing (dual MCA collateral supply).',
            keyTerminology: ['Calcarine Sulcus', 'Brodmann Area 17', 'Dorsal/Ventral Streams', 'Macular Sparing']
          }
        }
      },
      {
        id: 'cerebellum',
        name: 'Cerebellum (Motor Coordination & Balance)',
        latinName: 'Cerebellum',
        system: 'nervous',
        position: [0.0, -0.65, -0.75],
        rotation: [0, 0, 0],
        scale: [1.3, 0.75, 0.95],
        geometryType: 'cerebellum_folia',
        materialType: 'brain_cerebellum',
        color: 0xf43f5e,
        labelCoords: [0.0, -1.05, -1.15],
        isInternal: false,
        explodedVector: [0, -0.5, -0.5],
        gradeContent: {
          elementary: {
            title: 'Cerebellum — The Balance Master',
            summary: 'The "little brain" that keeps you steady on your feet.',
            functionDesc: 'Helps you ride a bike, balance on one leg, throw a ball accurately, and catch your balance if you trip.',
            clinicalOrEducationalNote: 'Acts like an autopilot for smooth, graceful body movements!',
            keyTerminology: ['Balance', 'Coordination', 'Riding a bike']
          },
          middleSchool: {
            title: 'Cerebellum (Motor Timing & Muscle Memory)',
            summary: 'Convoluted structure beneath occipital lobes coordinating precision movement.',
            functionDesc: 'Compares intended motor commands with actual sensory feedback to fine-tune timing, posture, and motor learning.',
            clinicalOrEducationalNote: 'Contains over half of all neurons in the entire human brain, densely packed in tiny folds called folia.',
            keyTerminology: ['Motor learning', 'Purkinje cells', 'Equilibrium']
          },
          highSchoolPreMed: {
            title: 'Cerebellum (Circuitry & Cerebellar Ataxia)',
            summary: 'Consists of two hemispheres, central vermis, and three peduncles linking to the brainstem.',
            functionDesc: 'Involves mossy/climbing fiber inputs to Purkinje cells (GABAergic inhibitory output) modulating deep cerebellar nuclei (dentate, emboliform, globose, fastigial).',
            clinicalOrEducationalNote: 'Ipsilateral cerebellar deficits: dysmetria, intention tremor, dysdiadochokinesia, and scanning speech without muscle paralysis.',
            keyTerminology: ['Purkinje Neurons', 'Deep Cerebellar Nuclei', 'Intention Tremor', 'Dysdiadochokinesia']
          }
        }
      },
      {
        id: 'brainstem',
        name: 'Brainstem (Pons & Medulla Oblongata)',
        latinName: 'Truncus encephali',
        system: 'nervous',
        position: [0.0, -0.85, -0.15],
        rotation: [0, 0, 0],
        scale: [0.65, 1.2, 0.65],
        geometryType: 'brainstem_pons',
        materialType: 'brainstem',
        color: 0xfecdd3,
        labelCoords: [-0.65, -1.15, -0.15],
        isInternal: false,
        explodedVector: [0, -0.6, 0],
        gradeContent: {
          elementary: {
            title: 'Brainstem — The Life Support Stem',
            summary: 'Controls the vital things you never have to think about.',
            functionDesc: 'Keeps your heart beating, controls your breathing while you sleep, and controls swallowing and blinking.',
            clinicalOrEducationalNote: 'Connects your brain directly to your spinal cord down your back.',
            keyTerminology: ['Automatic breathing', 'Heartbeat control', 'Life support']
          },
          middleSchool: {
            title: 'Brainstem (Autonomic Relay & Cranial Nerves)',
            summary: 'Stem composed of the midbrain, pons, and medulla oblongata.',
            functionDesc: 'Regulates critical autonomous reflexes: cardiac rhythm, respiratory drive, vasomotor tone, coughing, and swallowing.',
            clinicalOrEducationalNote: 'Houses nuclei for 10 of the 12 pairs of cranial nerves that serve your head and face.',
            keyTerminology: ['Medulla oblongata', 'Pons', 'Autonomic nervous system', 'Cranial nerves']
          },
          highSchoolPreMed: {
            title: 'Brainstem (Reticular Activating System & Medullary Pacing)',
            summary: 'Connects forebrain with spinal cord, comprised of midbrain (mesencephalon), pons (metencephalon), and medulla (myelencephalon).',
            functionDesc: 'Houses dorsal and ventral respiratory groups (pre-Bötzinger complex respiratory pacemaker) and baroreceptor vasomotor center. Reticular Activating System (RAS) mediates consciousness.',
            clinicalOrEducationalNote: 'Medullary herniation through foramen magnum compresses respiratory centers, resulting in rapid respiratory arrest and death.',
            keyTerminology: ['Pre-Bötzinger Complex', 'Reticular Activating System (RAS)', 'Cranial Nerve Nuclei (III-XII)', 'Tonsillar Herniation']
          }
        }
      }
    ],
    quizQuestions: [
      {
        id: 'q_brain_1',
        question: 'Which brain lobe houses the primary motor cortex and coordinates decision-making and personality?',
        targetStructureId: 'frontal_lobe',
        gradeLevel: 'middle_school',
        explanation: 'The frontal lobe contains the prefrontal cortex for executive decision-making and the precentral gyrus for voluntary motor control.'
      },
      {
        id: 'q_brain_2',
        question: 'Which structure is primarily responsible for motor coordination, smooth posture, and balance?',
        targetStructureId: 'cerebellum',
        gradeLevel: 'elementary',
        explanation: 'The cerebellum (meaning "little brain") continuously refines motor timing and balance based on sensory feedback.'
      },
      {
        id: 'q_brain_3',
        question: 'Where are the vital autonomous centers controlling automatic breathing and heart rate located?',
        targetStructureId: 'brainstem',
        gradeLevel: 'high_school',
        explanation: 'The brainstem (specifically the medulla oblongata and pons) contains the cardiovascular and respiratory pacemaking centers that sustain autonomic life support.'
      }
    ]
  },

  // 3. RESPIRATORY SYSTEM: THE LUNGS & AIRWAY
  lungs: {
    id: 'lungs',
    name: 'The Respiratory System (Trachea, Bronchial Tree & Lungs)',
    latinName: 'Systema respiratorium',
    system: 'respiratory',
    categoryLabel: 'Respiratory System',
    summary: 'The pulmonary ventilatory gas exchange organ comprising the cartilage-ringed trachea, carina, bifurcating bronchial tree, right trilobed lung, left bilobed lung with cardiac notch, and the thoracic diaphragm.',
    realDimensionsCm: { height: 26, width: 22, depth: 15 },
    defaultCameraPos: [0, 0.5, 6.2],
    clinicalPearls: [
      'The right lung is shorter and wider with 3 lobes; the left lung has 2 lobes with an anterior cardiac notch to accommodate the heart.',
      'Surface area of the human alveolar-capillary membrane is approximately 70–100 m² (roughly the size of half a tennis court!).',
      'Pulmonary surfactant produced by Type II pneumocytes lowers alveolar surface tension, preventing atelectasis (alveolar collapse).'
    ],
    validationChecklist: {
      landmarkCheck: true,
      spatialOrientation: true,
      hemodynamicOrPathwayCoherence: true,
      medicalReferenceVerified: true,
      referenceSources: "West's Respiratory Physiology 11th Ed., Gray's Anatomy"
    },
    simulationConfig: {
      type: 'ventilation_cycle',
      defaultRateBpm: 15,
      rateLabel: 'Respiratory Rate',
      rateUnit: 'Breaths/min',
      minRate: 8,
      maxRate: 35
    },
    structures: [
      {
        id: 'trachea_airway',
        name: 'Trachea & Cartilaginous C-Rings',
        latinName: 'Trachea',
        system: 'respiratory',
        position: [0.0, 1.2, 0.0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        geometryType: 'trachea_rings',
        materialType: 'trachea_cartilage',
        color: 0xe2e8f0,
        labelCoords: [0.0, 1.7, 0.35],
        isInternal: false,
        explodedVector: [0, 0.6, 0],
        gradeContent: {
          elementary: {
            title: 'Trachea — The Windpipe',
            summary: 'The main tube that carries air to your lungs.',
            functionDesc: 'A sturdy tube made of cartilage rings that stays open day and night so you can breathe freely.',
            clinicalOrEducationalNote: 'You can feel these bumps on the front of your neck with your fingers!',
            keyTerminology: ['Windpipe', 'Airway', 'Breathing tube']
          },
          middleSchool: {
            title: 'Trachea (Cartilaginous Airway)',
            summary: 'Rigid fibrocartilaginous tube extending from larynx to carina.',
            functionDesc: 'Contains 16–20 C-shaped hyaline cartilage rings preventing airway collapse during intrathoracic pressure drops.',
            clinicalOrEducationalNote: 'Lined with ciliated pseudostratified columnar epithelium that sweeps mucus and inhaled dust out of the lungs (mucociliary escalator).',
            keyTerminology: ['Hyaline cartilage C-rings', 'Mucociliary escalator', 'Carina']
          },
          highSchoolPreMed: {
            title: 'Trachea (Histology & Bronchial Bifurcation)',
            summary: 'Fibromuscular conduit descending in superior mediastinum anterior to the esophagus.',
            functionDesc: 'Posterior trachealis muscle (smooth muscle) relaxes during swallowing and constricts during cough reflex. Bifurcates at T4/T5 (sternal angle) at the sensitive carina.',
            clinicalOrEducationalNote: 'Right main bronchus is wider, shorter, and more vertical than the left, making it the most frequent destination for aspirated foreign bodies.',
            keyTerminology: ['Trachealis muscle', 'Carina reflex', 'Sternal angle (Angle of Louis)', 'Foreign body aspiration']
          }
        }
      },
      {
        id: 'right_lung',
        name: 'Right Lung (3 Lobes: Superior, Middle, Inferior)',
        latinName: 'Pulmo dexter',
        system: 'respiratory',
        position: [1.2, 0.1, -0.1],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        geometryType: 'lung_lobe',
        materialType: 'lung_parenchyma',
        color: 0xf87171,
        labelCoords: [1.85, 0.4, 0.25],
        isInternal: false,
        explodedVector: [0.8, 0, 0],
        simulationRole: 'lung_inhalation',
        gradeContent: {
          elementary: {
            title: 'Right Lung — Three Air Lobes',
            summary: 'The right side of your breathing pair.',
            functionDesc: 'Has three distinct sections (lobes) filled with millions of microscopic air sponges called alveoli.',
            clinicalOrEducationalNote: 'Slightly bigger than the left lung because it doesn’t have to share space with the heart!',
            keyTerminology: ['Right lung', 'Three lobes', 'Air sacs']
          },
          middleSchool: {
            title: 'Right Lung (Trilobed Pulmonary Parenchyma)',
            summary: 'Larger pulmonary organ divided into superior, middle, and inferior lobes.',
            functionDesc: 'Separated by horizontal and oblique fissures. Serviced by the right primary bronchus branching into 3 secondary lobar bronchi.',
            clinicalOrEducationalNote: 'Contains millions of alveoli wrapped in capillaries for passive O2 and CO2 diffusion.',
            keyTerminology: ['Horizontal fissure', 'Oblique fissure', 'Lobar bronchi']
          },
          highSchoolPreMed: {
            title: 'Right Lung (Bronchopulmonary Anatomy & Diffusion)',
            summary: 'Trilobed organ containing 10 distinct bronchopulmonary segments, each supplied by tertiary segmental bronchus and pulmonary artery branch.',
            functionDesc: 'Alveolar gas exchange governed by Fick\'s Law of Diffusion: flux proportional to surface area and partial pressure gradient (PAO2 - PaO2), inversely to membrane thickness.',
            clinicalOrEducationalNote: 'Middle lobe syndrome: compression of the small-diameter middle lobar bronchus by peribronchial lymph nodes causing recurrent atelectasis.',
            keyTerminology: ['10 Bronchopulmonary Segments', "Fick's Law of Diffusion", 'Ventilation/Perfusion (V/Q) ratio']
          }
        }
      },
      {
        id: 'left_lung',
        name: 'Left Lung (2 Lobes with Cardiac Notch)',
        latinName: 'Pulmo sinister',
        system: 'respiratory',
        position: [-1.2, 0.1, -0.1],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        geometryType: 'lung_lobe',
        materialType: 'lung_parenchyma',
        color: 0xf87171,
        labelCoords: [-1.85, 0.35, 0.25],
        isInternal: false,
        explodedVector: [-0.8, 0, 0],
        simulationRole: 'lung_inhalation',
        gradeContent: {
          elementary: {
            title: 'Left Lung — Two Lobes with Heart Notch',
            summary: 'The left lung shaped to make room for the heart.',
            functionDesc: 'Has a special curved dent called the cardiac notch so the heart can nestle securely beside it.',
            clinicalOrEducationalNote: 'Has two lobes instead of three because your heart sits mostly on the left side of your chest!',
            keyTerminology: ['Heart notch', 'Two lobes']
          },
          middleSchool: {
            title: 'Left Lung (Bilobed Parenchyma & Cardiac Notch)',
            summary: 'Lung divided into superior and inferior lobes by the oblique fissure.',
            functionDesc: 'Features an anterior indentation (cardiac notch) and an inferior tongue-like projection called the lingula.',
            clinicalOrEducationalNote: 'The left main bronchus enters at a sharper angle because it must pass under the aortic arch.',
            keyTerminology: ['Cardiac notch', 'Lingula', 'Oblique fissure']
          },
          highSchoolPreMed: {
            title: 'Left Lung (Segmental Architecture & Lingular Segment)',
            summary: 'Bilobed organ divided into superior and inferior lobes by oblique fissure; 8–10 bronchopulmonary segments.',
            functionDesc: 'Superior lobe contains the lingula (homologous to middle lobe of right lung). Impression of aortic arch and descending aorta on mediastinal surface.',
            clinicalOrEducationalNote: 'Lingular pneumonia presents with silhouette sign blurring the left heart border on chest radiography.',
            keyTerminology: ['Cardiac Impression', 'Lingula', 'Silhouette Sign', 'Hypoxic Pulmonary Vasoconstriction']
          }
        }
      }
    ],
    quizQuestions: [
      {
        id: 'q_lung_1',
        question: 'Why does the left lung have only 2 lobes compared to the right lung which has 3 lobes?',
        targetStructureId: 'left_lung',
        gradeLevel: 'elementary',
        explanation: 'The left lung has two lobes and a cardiac notch to accommodate the apex and volume of the human heart, which sits predominantly on the left side of the thoracic cavity.'
      },
      {
        id: 'q_lung_2',
        question: 'What is the function of the cartilaginous C-shaped rings along the trachea?',
        targetStructureId: 'trachea_airway',
        gradeLevel: 'middle_school',
        explanation: 'The rigid hyaline cartilage C-rings maintain an open patent airway during pressure changes while allowing the esophagus behind it to expand during swallowing.'
      }
    ]
  },

  // 4. SENSORY ORGAN: THE HUMAN EYE
  eye: {
    id: 'eye',
    name: 'The Human Eye (Visual Optical Apparatus)',
    latinName: 'Oculus humanus',
    system: 'sensory',
    categoryLabel: 'Visual Sensory System',
    summary: 'The optical photoreceptive organ comprising the avascular transparent cornea, anterior chamber, pigmented iris with pupil aperture, crystalline biconvex lens, vitreous humor, multilayered retina, and optic nerve.',
    realDimensionsCm: { height: 2.4, width: 2.4, depth: 2.4 },
    defaultCameraPos: [0, 0.2, 4.5],
    clinicalPearls: [
      'The cornea provides ~70% (43 diopters) of total optical refractive power; the lens provides fine dynamic accommodation (15–20 diopters).',
      'The retina contains ~120 million rod photoreceptors (night vision/scotopic) and ~6 million cone photoreceptors (color/photopic vision concentrated in the fovea centralis).',
      'Optic disc creates a physiological blind spot (scotoma) due to the absence of photoreceptors where the optic nerve exits.'
    ],
    validationChecklist: {
      landmarkCheck: true,
      spatialOrientation: true,
      hemodynamicOrPathwayCoherence: true,
      medicalReferenceVerified: true,
      referenceSources: "Adler's Physiology of the Eye 11th Ed., Gray's Anatomy"
    },
    simulationConfig: {
      type: 'none',
      defaultRateBpm: 0,
      rateLabel: 'Accommodation',
      rateUnit: 'Diopters',
      minRate: 0,
      maxRate: 15
    },
    structures: [
      {
        id: 'cornea_lens_optics',
        name: 'Cornea & Crystalline Lens (Refractive Media)',
        latinName: 'Cornea et Lens crystallina',
        system: 'sensory',
        position: [0.0, 0.0, 0.6],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        geometryType: 'cornea_dome',
        materialType: 'cornea_lens',
        color: 0xffffff,
        labelCoords: [0.0, 0.65, 0.95],
        isInternal: false,
        explodedVector: [0, 0, 0.8],
        gradeContent: {
          elementary: {
            title: 'Cornea & Lens — The Eye Glasses',
            summary: 'The clear front windows that focus light.',
            functionDesc: 'Bends incoming light beams to project a crisp, clear image onto the back screen of your eye.',
            clinicalOrEducationalNote: 'The lens can change its thickness like a zoom camera when you look up close versus far away!',
            keyTerminology: ['Clear window', 'Focusing light', 'Lens']
          },
          middleSchool: {
            title: 'Cornea & Crystalline Lens (Optical Focus)',
            summary: 'Primary refractive elements bending light toward the retina.',
            functionDesc: 'Cornea provides fixed refraction (index 1.376); ciliary muscles contract to adjust lens curvature (accommodation).',
            clinicalOrEducationalNote: 'Cataracts occur when the crystallin proteins in the lens become cloudy with age, blurring vision.',
            keyTerminology: ['Refraction', 'Accommodation', 'Ciliary muscles', 'Cataracts']
          },
          highSchoolPreMed: {
            title: 'Corneal Stroma, Lens Capsule & Accommodation',
            summary: 'Avascular transparent tissues nourished by aqueous humor and tear film.',
            functionDesc: 'Corneal transparency maintained by regular orthogonal collagen fibril spacing (lattice theory) and endothelial Na+/K+ ATPase deturgescence. Parasympathetic CN III ciliary contraction relaxes zonules to increase lens convexity.',
            clinicalOrEducationalNote: 'Presbyopia: age-related loss of lens elasticity reducing accommodative amplitude. Astigmatism: asymmetric corneal curvature.',
            keyTerminology: ['Endothelial Deturgescence', 'Zonules of Zinn', 'Presbyopia', 'Snellen Acuity']
          }
        }
      },
      {
        id: 'retina_optic_nerve',
        name: 'Retina & Optic Nerve (Photoreception & CN II)',
        latinName: 'Retina et Nervus opticus',
        system: 'sensory',
        position: [0.0, 0.0, -0.4],
        rotation: [0, 0, 0],
        scale: [1.1, 1.1, 1.1],
        geometryType: 'optic_nerve',
        materialType: 'sclera_retina',
        color: 0xfef08a,
        labelCoords: [0.0, -0.65, -1.15],
        isInternal: true,
        explodedVector: [0, 0, -0.7],
        gradeContent: {
          elementary: {
            title: 'Retina & Optic Nerve — The Movie Screen & Cable',
            summary: 'The sensor screen and the cable to your brain.',
            functionDesc: 'Captures light with millions of tiny cells and shoots electrical messages down the optic nerve cable to the brain.',
            clinicalOrEducationalNote: 'Rods help you see in the dark, and cones let you see red, blue, and green colors!',
            keyTerminology: ['Rods and Cones', 'Optic cable', 'Color vision']
          },
          middleSchool: {
            title: 'Retina & Optic Nerve (CN II)',
            summary: 'Sensory tunic containing rods, cones, and ganglion cells.',
            functionDesc: 'Converts photons into action potentials via rhodopsin phototransduction and transmits them via Cranial Nerve II to the brain.',
            clinicalOrEducationalNote: 'The macula and fovea centralis provide highest visual acuity for reading and seeing fine details.',
            keyTerminology: ['Photoreceptors', 'Fovea centralis', 'Optic nerve (CN II)', 'Macula']
          },
          highSchoolPreMed: {
            title: 'Retinal Layers, Phototransduction & Optic Chiasm',
            summary: '10-layer neuroepithelial structure originating as an outpouching of the diencephalon.',
            functionDesc: 'Photon absorption activates rhodopsin -> transducin (G-protein) -> PDE breaks down cGMP -> closing Na+ channels, hyperpolarizing photoreceptors and reducing glutamate release.',
            clinicalOrEducationalNote: 'Pituitary adenoma compressing optic chiasm results in bitemporal hemianopsia (loss of peripheral visual fields). Diabetic retinopathy causes neovascularization.',
            keyTerminology: ['Phototransduction Cascade', 'Bitemporal Hemianopsia', 'Fovea (100% cones)', 'Macular Degeneration']
          }
        }
      }
    ],
    quizQuestions: [
      {
        id: 'q_eye_1',
        question: 'Which transparent avascular structure at the front of the eye provides the majority of its refractive focusing power?',
        targetStructureId: 'cornea_lens_optics',
        gradeLevel: 'middle_school',
        explanation: 'The cornea provides about 70% of the eye\'s refractive power (about 43 diopters) due to the large difference in refractive index between air and corneal tissue.'
      },
      {
        id: 'q_eye_2',
        question: 'Which specialized nerve carries visual impulses from the retina to the visual cortex in the brain?',
        targetStructureId: 'retina_optic_nerve',
        gradeLevel: 'elementary',
        explanation: 'The optic nerve (Cranial Nerve II) bundles axons from retinal ganglion cells and transmits electrical visual signals directly to the brain.'
      }
    ]
  },

  // 5. URINARY SYSTEM: THE HUMAN KIDNEY
  kidney: {
    id: 'kidney',
    name: 'The Human Kidney (Renal Anatomy & Filtration)',
    latinName: 'Ren humanus',
    system: 'urinary',
    categoryLabel: 'Urinary System',
    summary: 'The retroperitoneal bean-shaped homeostatic organ responsible for blood filtration, electrolyte balance, blood pressure regulation (RAAS), and urine production, featuring the renal cortex, medullary pyramids, calyces, and renal pelvis.',
    realDimensionsCm: { height: 11.5, width: 6.0, depth: 3.5 },
    defaultCameraPos: [0, 0.4, 4.8],
    clinicalPearls: [
      'Normal Glomerular Filtration Rate (GFR) is approximately 120–125 mL/min (~180 liters of blood ultrafiltrate filtered daily, of which >99% is reabsorbed).',
      'The kidneys receive ~20–25% of total cardiac output via the large renal arteries.',
      'Juxtaglomerular apparatus secretes renin in response to decreased renal perfusion, activating the Renin-Angiotensin-Aldosterone System (RAAS).'
    ],
    validationChecklist: {
      landmarkCheck: true,
      spatialOrientation: true,
      hemodynamicOrPathwayCoherence: true,
      medicalReferenceVerified: true,
      referenceSources: "Brenner & Rector's The Kidney 11th Ed., Gray's Anatomy"
    },
    simulationConfig: {
      type: 'none',
      defaultRateBpm: 0,
      rateLabel: 'GFR Filtration',
      rateUnit: 'mL/min',
      minRate: 60,
      maxRate: 130
    },
    structures: [
      {
        id: 'renal_cortex_medulla',
        name: 'Renal Cortex & Medullary Pyramids',
        latinName: 'Cortex renalis et Medulla renalis',
        system: 'urinary',
        position: [0.0, 0.0, 0.0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        geometryType: 'kidney_bean',
        materialType: 'renal_cortex',
        color: 0xb91c1c,
        labelCoords: [0.95, 0.4, 0.4],
        isInternal: false,
        explodedVector: [0.6, 0, 0],
        gradeContent: {
          elementary: {
            title: 'Kidney Filters — The Body Cleaning Factory',
            summary: 'Bean-shaped organs that filter and clean your blood.',
            functionDesc: 'Removes wastes, extra water, and toxins from your blood 24 hours a day to make urine.',
            clinicalOrEducationalNote: 'Your kidneys filter all the blood in your body over 40 times every single day!',
            keyTerminology: ['Blood filter', 'Cleaning waste', 'Urine maker']
          },
          middleSchool: {
            title: 'Renal Cortex & Medullary Pyramids',
            summary: 'Functional layers containing over 1 million microscopic nephrons.',
            functionDesc: 'Cortex houses glomeruli and Bowman\'s capsules for ultrafiltration; medulla contains pyramids with loops of Henle for water reabsorption.',
            clinicalOrEducationalNote: 'Maintains fluid, salt, and acid-base balance while producing erythropoietin (EPO) to stimulate red blood cell production.',
            keyTerminology: ['Nephron', 'Glomerulus', 'Loop of Henle', 'Erythropoietin (EPO)']
          },
          highSchoolPreMed: {
            title: 'Renal Parenchyma & Countercurrent Multiplication',
            summary: 'Outer cortex (300 mOsm/L isosmotic) and inner hyperosmotic medullary pyramids (up to 1200 mOsm/L).',
            functionDesc: 'Countercurrent multiplication in the loops of Henle and vasa recta creates an osmotic corticomedullary gradient. ADH (vasopressin) inserts aquaporin-2 channels into collecting ducts to concentrate urine.',
            clinicalOrEducationalNote: 'Chronic kidney disease (CKD) stages defined by GFR (<60 mL/min/1.73m² for >3 months). Leads to uremia, hyperkalemia, and metabolic acidosis.',
            keyTerminology: ['Countercurrent Multiplier', 'Aquaporin-2', 'Glomerular Filtration Rate (GFR)', 'Renin-Angiotensin System']
          }
        }
      }
    ],
    quizQuestions: [
      {
        id: 'q_kidney_1',
        question: 'What microscopic functional filtration unit, numbering over 1 million per kidney, cleans the blood?',
        targetStructureId: 'renal_cortex_medulla',
        gradeLevel: 'middle_school',
        explanation: 'The nephron is the microscopic structural and functional unit of the kidney, consisting of a renal corpuscle (glomerulus and Bowman\'s capsule) and a renal tubule.'
      }
    ]
  },

  // 6. MOLECULAR & CELLULAR BIOLOGY: THE NEURON
  neuron: {
    id: 'neuron',
    name: 'The Multipolar Neuron (Cellular Neurobiology)',
    latinName: 'Neuron multipolare',
    system: 'cellular_molecular',
    categoryLabel: 'Cellular Neurobiology',
    summary: 'The excitable physiological cell of the nervous system featuring a metabolic soma, dendritic reception tree, axon hillock, myelinated axon with Nodes of Ranvier, and synaptic terminal arborizations.',
    realDimensionsCm: { height: 18, width: 8, depth: 4 },
    defaultCameraPos: [0, -1.8, 6.2],
    clinicalPearls: [
      'Resting membrane potential is approximately -70 mV, maintained primarily by the electrogenic Na+/K+ ATPase pump (3 Na+ out, 2 K+ in).',
      'Action potentials follow the "All-or-None" law: once threshold potential (~ -55 mV) is reached, voltage-gated Na+ channels rapidly open.',
      'Myelination increases conduction velocity up to 100-fold via saltatory conduction across Nodes of Ranvier (up to 120 m/s).'
    ],
    validationChecklist: {
      landmarkCheck: true,
      spatialOrientation: true,
      hemodynamicOrPathwayCoherence: true,
      medicalReferenceVerified: true,
      referenceSources: "Purves Neuroscience 6th Ed., Kandel's Principles of Neural Science"
    },
    simulationConfig: {
      type: 'neural_transmission',
      defaultRateBpm: 60,
      rateLabel: 'Action Potential Frequency',
      rateUnit: 'Hz',
      minRate: 5,
      maxRate: 120
    },
    structures: [
      {
        id: 'neuron_cell_body',
        name: 'Soma & Dendritic Tree (Signal Reception)',
        latinName: 'Soma et Dendrita',
        system: 'cellular_molecular',
        position: [0.0, 0.0, 0.0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        geometryType: 'neuron_soma',
        materialType: 'axon_soma',
        color: 0x38bdf8,
        labelCoords: [0.85, 0.35, 0.3],
        isInternal: false,
        explodedVector: [0, 0.4, 0],
        gradeContent: {
          elementary: {
            title: 'Neuron Cell Body & Dendrite Branches',
            summary: 'The main brain cell body with receiving branches.',
            functionDesc: 'Catches incoming messages from other nerve cells like satellite antennas.',
            clinicalOrEducationalNote: 'Your brain has over 86 billion of these cells talking to each other!',
            keyTerminology: ['Brain cell', 'Antenna branches', 'Cell body']
          },
          middleSchool: {
            title: 'Soma & Dendrites (Input Zone)',
            summary: 'Metabolic headquarters and dendritic arborization.',
            functionDesc: 'Dendrites receive chemical neurotransmitters at synapses; the soma integrates graded potentials toward the axon hillock.',
            clinicalOrEducationalNote: 'Contains the cell nucleus and abundant rough endoplasmic reticulum (Nissl bodies) for protein synthesis.',
            keyTerminology: ['Dendrite', 'Soma', 'Neurotransmitter', 'Nissl bodies']
          },
          highSchoolPreMed: {
            title: 'Soma, Dendritic Spines & Synaptic Integration',
            summary: 'Receptive field covered in thousands of post-synaptic dendritic spines.',
            functionDesc: 'Performs spatial and temporal summation of excitatory (EPSPs) and inhibitory (IPSPs) postsynaptic potentials. If membrane threshold (-55 mV) is reached at the axon hillock, an action potential fires.',
            clinicalOrEducationalNote: 'Long-term potentiation (LTP) in dendritic spines (NMDA and AMPA receptor recruitment) forms the cellular foundation of memory.',
            keyTerminology: ['Axon Hillock', 'Spatial/Temporal Summation', 'EPSP/IPSP', 'Long-Term Potentiation (LTP)']
          }
        }
      },
      {
        id: 'myelinated_axon',
        name: 'Myelinated Axon & Nodes of Ranvier',
        latinName: 'Axon myelinatum',
        system: 'cellular_molecular',
        position: [0.0, -2.5, 0.0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        geometryType: 'neuron_axon_sheaths',
        materialType: 'myelin_sheath',
        color: 0xfef08a,
        labelCoords: [0.55, -2.2, 0.25],
        isInternal: false,
        explodedVector: [0.4, 0, 0],
        simulationRole: 'action_potential',
        gradeContent: {
          elementary: {
            title: 'The Axon Cable & Myelin Insulation',
            summary: 'The long wire that shoots messages lightning-fast.',
            functionDesc: 'Wrapped in special fatty insulation (myelin) so electric signals can jump super fast without leaking out.',
            clinicalOrEducationalNote: 'Signals can travel down this cable faster than a racing car—up to 270 miles per hour!',
            keyTerminology: ['Nerve cable', 'Myelin insulation', 'Lightning speed']
          },
          middleSchool: {
            title: 'Myelinated Axon (Saltatory Conduction)',
            summary: 'Long conducting nerve fiber wrapped in Schwann cells/oligodendrocytes.',
            functionDesc: 'Myelin acts as electrical insulation; impulses leap rapidly from node to node (saltatory conduction).',
            clinicalOrEducationalNote: 'In Multiple Sclerosis (MS), the body\'s immune system mistakenly damages the myelin sheath, slowing signals.',
            keyTerminology: ['Myelin sheath', 'Nodes of Ranvier', 'Saltatory conduction', 'Multiple Sclerosis']
          },
          highSchoolPreMed: {
            title: 'Axon Electrophysiology & Saltatory Velocity',
            summary: 'Cylindrical axon surrounded by lipid-rich myelin lamellae separated by unmyelinated Nodes of Ranvier.',
            functionDesc: 'Nodes of Ranvier feature dense clusters of voltage-gated Na+ channels (Nav1.6). Myelin reduces membrane capacitance and increases transmembrane resistance, accelerating conduction via saltatory propagation.',
            clinicalOrEducationalNote: 'Demyelinating neuropathies (Guillain-Barré syndrome in PNS, Multiple Sclerosis in CNS) produce conduction block and temporal dispersion.',
            keyTerminology: ['Saltatory Conduction', 'Nodes of Ranvier', 'Membrane Capacitance', 'Guillain-Barré Syndrome']
          }
        }
      }
    ],
    quizQuestions: [
      {
        id: 'q_neuron_1',
        question: 'What is the function of the fatty myelin sheath wrapping the axon of a neuron?',
        targetStructureId: 'myelinated_axon',
        gradeLevel: 'middle_school',
        explanation: 'The myelin sheath acts as electrical insulation, enabling rapid saltatory conduction where action potentials jump between the Nodes of Ranvier.'
      }
    ]
  },

  // 7. MOLECULAR BIOLOGY: DNA DOUBLE HELIX
  dna: {
    id: 'dna',
    name: 'DNA Double Helix (Molecular Genetics Architecture)',
    latinName: 'Acidum desoxyribonucleicum',
    system: 'cellular_molecular',
    categoryLabel: 'Molecular Genetics',
    summary: 'The universal molecular hereditary blueprint featuring two antiparallel sugar-phosphate helical backbones connected by complementary hydrogen-bonded nitrogenous base pairs (Adenine-Thymine, Guanine-Cytosine).',
    realDimensionsCm: { height: 18, width: 6, depth: 6 },
    defaultCameraPos: [0, 0, 5.8],
    clinicalPearls: [
      'Human genome comprises ~3.2 billion base pairs in each diploid nucleus, packing ~2 meters of DNA into a 6-micron nucleus via histone octamers.',
      "Chargaff's Rules: In double-stranded DNA, %A = %T and %G = %C due to specific Watson-Crick hydrogen bonding constraints.",
      'Standard B-DNA helix has a diameter of 2.0 nm, a helical pitch of 3.4 nm per turn, and approximately 10.5 base pairs per helical turn.'
    ],
    validationChecklist: {
      landmarkCheck: true,
      spatialOrientation: true,
      hemodynamicOrPathwayCoherence: true,
      medicalReferenceVerified: true,
      referenceSources: "Watson's Molecular Biology of the Gene 7th Ed., Alberts Molecular Biology of the Cell"
    },
    simulationConfig: {
      type: 'none',
      defaultRateBpm: 0,
      rateLabel: 'Replication Rate',
      rateUnit: 'bp/sec',
      minRate: 20,
      maxRate: 100
    },
    structures: [
      {
        id: 'sugar_phosphate_backbone',
        name: 'Antiparallel Sugar-Phosphate Backbones',
        latinName: 'Sceletus phosphato-desoxyribosicus',
        system: 'cellular_molecular',
        position: [0.0, 0.0, 0.0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        geometryType: 'dna_helix_ribbon',
        materialType: 'dna_sugar_phosphate',
        color: 0x0284c7,
        labelCoords: [0.95, 1.2, 0.45],
        isInternal: false,
        explodedVector: [0.5, 0, 0],
        gradeContent: {
          elementary: {
            title: 'DNA Twisted Ribbon — The Recipe Book of Life',
            summary: 'The famous twisted spiral ladder holding your genetic code.',
            functionDesc: 'Forms the two sturdy handrails of the DNA ladder, holding all the genetic instructions that make you who you are.',
            clinicalOrEducationalNote: 'Every living creature—from trees to kittens to you—uses this exact same twisted ladder recipe!',
            keyTerminology: ['Twisted ladder', 'Life recipe', 'DNA spiral']
          },
          middleSchool: {
            title: 'Sugar-Phosphate Backbone (5\' to 3\' Antiparallel)',
            summary: 'Covalently bonded structural framework of the double helix.',
            functionDesc: 'Alternating deoxyribose sugar and phosphate groups linked by phosphodiester bonds running in opposite (antiparallel) directions.',
            clinicalOrEducationalNote: 'Discovered by James Watson, Francis Crick, and Rosalind Franklin in 1953.',
            keyTerminology: ['Deoxyribose', 'Phosphate group', 'Phosphodiester bond', 'Antiparallel']
          },
          highSchoolPreMed: {
            title: 'Phosphodiester Bonds & Helical Topology (B-DNA)',
            summary: 'Right-handed B-DNA antiparallel double helix with 5\'-phosphate to 3\'-hydroxyl polarity.',
            functionDesc: 'Hydrophilic negatively charged phosphate backbone faces outward, while hydrophobic base pairs stack internally with van der Waals pi-pi stacking interactions (3.4 Å rise per bp).',
            clinicalOrEducationalNote: 'Major groove (22 Å wide) exposes specific hydrogen-bond donors and acceptors for sequence-specific transcription factor binding (zinc fingers, leucine zippers).',
            keyTerminology: ['5\' to 3\' Polarity', 'Major and Minor Grooves', 'Pi-Pi Stacking', 'Phosphodiester Backbone']
          }
        }
      },
      {
        id: 'nitrogenous_base_pairs',
        name: 'Complementary Base Pairs (A-T & G-C)',
        latinName: 'Bases nitrogenatae (Adeninum-Thyminum, Guaninum-Cytosinum)',
        system: 'cellular_molecular',
        position: [0.0, 0.0, 0.0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        geometryType: 'dna_base_rungs',
        materialType: 'dna_base_pair',
        color: 0x10b981,
        labelCoords: [-0.05, -0.4, 0.35],
        isInternal: true,
        explodedVector: [-0.4, 0, 0],
        gradeContent: {
          elementary: {
            title: 'DNA Base Pair Rungs — The 4 Genetic Letters',
            summary: 'The steps of the ladder written with 4 letters: A, T, C, and G.',
            functionDesc: 'A always pairs with T, and C always pairs with G, spelling out the secret instructions for your eye color and height.',
            clinicalOrEducationalNote: 'Just 4 chemical letters write the complete book of human life!',
            keyTerminology: ['Four letters (A, T, C, G)', 'Ladder steps', 'Genetic code']
          },
          middleSchool: {
            title: 'Complementary Base Pairs (Hydrogen Bonding)',
            summary: 'The horizontal rungs of the double helix.',
            functionDesc: 'Adenine pairs with Thymine via 2 hydrogen bonds (A=T); Guanine pairs with Cytosine via 3 hydrogen bonds (G≡C).',
            clinicalOrEducationalNote: 'G-C rich DNA is harder to separate than A-T rich DNA because 3 hydrogen bonds are stronger than 2.',
            keyTerminology: ['Adenine', 'Thymine', 'Guanine', 'Cytosine', 'Hydrogen bonds']
          },
          highSchoolPreMed: {
            title: 'Watson-Crick Base Pairing & Thermodynamic Melting',
            summary: 'Purines (A, G with 2 rings) pair strictly with pyrimidines (T, C with 1 ring) maintaining uniform 2.0 nm helical diameter.',
            functionDesc: 'A=T (2 H-bonds) and G≡C (3 H-bonds). Melting temperature (Tm) is directly proportional to GC-content. Mismatched bases activate DNA mismatch repair (MMR; MLH1/MSH2).',
            clinicalOrEducationalNote: 'UV radiation induces thymine-thymine cyclobutane pyrimidine dimers, repaired by nucleotide excision repair (deficient in Xeroderma Pigmentosum).',
            keyTerminology: ['Purine vs Pyrimidine', 'Chargaff\'s Rules', 'Melting Temperature (Tm)', 'Thymine Dimers']
          }
        }
      }
    ],
    quizQuestions: [
      {
        id: 'q_dna_1',
        question: 'According to complementary base pairing rules, which nitrogenous base always pairs with Adenine in DNA?',
        targetStructureId: 'nitrogenous_base_pairs',
        gradeLevel: 'elementary',
        explanation: 'In DNA, Adenine (A) always pairs with Thymine (T) via 2 hydrogen bonds, while Guanine (G) pairs with Cytosine (C) via 3 hydrogen bonds.'
      },
      {
        id: 'q_dna_2',
        question: 'Why does DNA with high Guanine-Cytosine (G-C) content require higher temperatures to denature?',
        targetStructureId: 'nitrogenous_base_pairs',
        gradeLevel: 'high_school',
        explanation: 'Guanine and Cytosine are connected by three hydrogen bonds (G≡C), whereas Adenine and Thymine share only two (A=T), providing greater thermodynamic stability.'
      }
    ]
  }
};
