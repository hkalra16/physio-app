import { MovementTest } from '@/lib/types';

/**
 * Movement Tests Configuration
 * ============================
 *
 * Config file location: src/data/movement-tests.ts
 *
 * To add YouTube demonstration videos:
 * 1. Find the test in this file by its id
 * 2. Add or update the `demonstrationUrl` field with the YouTube URL
 *
 * Example:
 *   demonstrationUrl: 'https://www.youtube.com/watch?v=VIDEO_ID'
 *
 * The video will be embedded in the test card for users to watch.
 */

export const movementTests: MovementTest[] = [
  // ============================================
  // SHOULDER TESTS
  // ============================================
  {
    id: 'neers-test',
    name: "Neer's Test",
    targetArea: ['shoulder-left-anterior', 'shoulder-right-anterior'],
    targetMuscles: ['Supraspinatus', 'Rotator cuff'],
    instructions: [
      'Stand or sit with your arm relaxed at your side',
      'Keep your arm straight and thumb pointing down',
      'Slowly raise your arm forward and up toward the ceiling',
      'Continue lifting as high as you can go',
      'Note any pain during the movement'
    ],
    // TODO: Add YouTube URL for demonstration video
    demonstrationUrl: '',
    duration: 10,
    repetitions: 3,
    expectedFindings: {
      positive: 'Pain in the front/top of shoulder between 70-120 degrees of elevation suggests rotator cuff impingement',
      negative: 'Full range of motion without pain suggests no impingement'
    }
  },
  {
    id: 'hawkins-kennedy',
    name: 'Hawkins-Kennedy Test',
    targetArea: ['shoulder-left-anterior', 'shoulder-right-anterior'],
    targetMuscles: ['Supraspinatus', 'Infraspinatus', 'Rotator cuff'],
    instructions: [
      'Raise your arm forward to shoulder height (90 degrees)',
      'Bend your elbow to 90 degrees',
      'Slowly rotate your forearm downward (internal rotation)',
      'Note any pain in the shoulder during rotation'
    ],
    // TODO: Add YouTube URL for demonstration video
    demonstrationUrl: '',
    duration: 10,
    repetitions: 3,
    expectedFindings: {
      positive: 'Pain in the shoulder during internal rotation suggests subacromial impingement',
      negative: 'No pain during movement suggests no impingement'
    }
  },
  {
    id: 'empty-can',
    name: 'Empty Can Test (Jobe Test)',
    targetArea: ['shoulder-left-anterior', 'shoulder-right-anterior'],
    targetMuscles: ['Supraspinatus'],
    instructions: [
      'Stand with your arms at your sides',
      'Raise both arms to 90 degrees (shoulder height) at a 30-degree angle forward',
      'Turn your thumbs down as if emptying a can',
      'Try to hold this position while applying gentle downward pressure',
      'Note any pain or weakness'
    ],
    // TODO: Add YouTube URL for demonstration video
    demonstrationUrl: '',
    duration: 10,
    repetitions: 3,
    expectedFindings: {
      positive: 'Pain or weakness suggests supraspinatus tendinopathy or tear',
      negative: 'Strong hold without pain suggests intact supraspinatus'
    }
  },

  // ============================================
  // NECK TESTS
  // ============================================
  {
    id: 'spurlings-test',
    name: "Spurling's Test",
    targetArea: ['neck-anterior', 'neck-posterior'],
    targetMuscles: ['Cervical spine', 'Nerve roots'],
    instructions: [
      'Sit upright and look straight ahead',
      'Slowly turn your head to one side',
      'Then tilt your head toward that same shoulder',
      'Gently press down on top of your head',
      'Note any pain radiating down your arm'
    ],
    // TODO: Add YouTube URL for demonstration video
    demonstrationUrl: '',
    duration: 10,
    repetitions: 2,
    expectedFindings: {
      positive: 'Pain radiating down the arm suggests cervical nerve root compression (radiculopathy)',
      negative: 'No radiating pain suggests no nerve root involvement'
    }
  },
  {
    id: 'cervical-rotation',
    name: 'Cervical Rotation Range',
    targetArea: ['neck-anterior', 'neck-posterior'],
    targetMuscles: ['Sternocleidomastoid', 'Scalenes', 'Splenius'],
    instructions: [
      'Sit or stand with good posture',
      'Keep your shoulders still and level',
      'Slowly turn your head to look over your right shoulder',
      'Return to center, then turn to look over your left shoulder',
      'Note any pain, stiffness, or asymmetry'
    ],
    // TODO: Add YouTube URL for demonstration video
    demonstrationUrl: '',
    duration: 15,
    repetitions: 3,
    expectedFindings: {
      positive: 'Reduced range (less than 70-90 degrees) or pain suggests cervical dysfunction',
      negative: 'Full, symmetric rotation without pain is normal'
    }
  },

  // ============================================
  // LOWER BACK TESTS
  // ============================================
  {
    id: 'straight-leg-raise',
    name: 'Straight Leg Raise (Lasègue Test)',
    targetArea: ['lower-back-left', 'lower-back-right', 'lower-back-center'],
    targetMuscles: ['Sciatic nerve', 'Hamstrings', 'Lumbar spine'],
    instructions: [
      'Lie flat on your back on a firm surface',
      'Keep both legs straight',
      'Slowly raise one leg, keeping the knee straight',
      'Lift until you feel tightness or pain',
      'Note where you feel pain (back, buttock, or leg)',
      'Repeat with the other leg'
    ],
    // TODO: Add YouTube URL for demonstration video
    demonstrationUrl: '',
    duration: 15,
    repetitions: 2,
    expectedFindings: {
      positive: 'Pain radiating down the leg before 70 degrees suggests sciatic nerve irritation or disc herniation',
      negative: 'Ability to raise leg to 70+ degrees with only hamstring tightness is normal'
    }
  },
  {
    id: 'slump-test',
    name: 'Slump Test',
    targetArea: ['lower-back-center', 'thigh-left-posterior', 'thigh-right-posterior'],
    targetMuscles: ['Sciatic nerve', 'Spinal cord', 'Nerve roots'],
    instructions: [
      'Sit at the edge of a chair with hands behind your back',
      'Slump forward, rounding your back',
      'Tuck your chin to your chest',
      'Straighten one knee and point your toes up',
      'Note any pain or pulling sensation',
      'Repeat with the other leg'
    ],
    // TODO: Add YouTube URL for demonstration video
    demonstrationUrl: '',
    duration: 15,
    repetitions: 2,
    expectedFindings: {
      positive: 'Reproduction of leg symptoms suggests neural tension or nerve root irritation',
      negative: 'Only feeling of stretch without pain reproduction is normal'
    }
  },
  {
    id: 'mckenzie-extension',
    name: 'McKenzie Extension',
    targetArea: ['lower-back-center', 'lower-back-left', 'lower-back-right'],
    targetMuscles: ['Erector spinae', 'Multifidus', 'Lumbar spine'],
    instructions: [
      'Lie face down on a firm surface',
      'Place your hands under your shoulders',
      'Slowly push up, extending your back while keeping hips on the ground',
      'Hold for 2-3 seconds, then lower back down',
      'Note if symptoms centralize (move toward the spine) or peripheralize (move away)'
    ],
    // TODO: Add YouTube URL for demonstration video
    demonstrationUrl: '',
    duration: 30,
    repetitions: 10,
    expectedFindings: {
      positive: 'Centralization of symptoms (moving toward midline) is a good sign for disc-related pain',
      negative: 'Peripheralization (pain moving into legs) may indicate need for different approach'
    }
  },

  // ============================================
  // HIP TESTS
  // ============================================
  {
    id: 'faber-test',
    name: 'FABER Test (Patrick Test)',
    targetArea: ['hip-left-anterior', 'hip-right-anterior', 'glute-left', 'glute-right'],
    targetMuscles: ['Hip joint', 'Sacroiliac joint', 'Hip flexors'],
    instructions: [
      'Lie on your back',
      'Place one ankle on the opposite knee (figure-4 position)',
      'Let the bent knee fall out to the side',
      'Apply gentle pressure to the bent knee',
      'Note any pain in the hip, groin, or lower back'
    ],
    // TODO: Add YouTube URL for demonstration video
    demonstrationUrl: '',
    duration: 10,
    repetitions: 2,
    expectedFindings: {
      positive: 'Groin pain suggests hip joint pathology; back pain suggests SI joint dysfunction',
      negative: 'No pain with full range suggests healthy hip and SI joint'
    }
  },
  {
    id: 'thomas-test',
    name: 'Thomas Test',
    targetArea: ['hip-left-anterior', 'hip-right-anterior'],
    targetMuscles: ['Iliopsoas', 'Rectus femoris', 'Hip flexors'],
    instructions: [
      'Lie on your back at the edge of a bed or table',
      'Pull both knees to your chest',
      'Keep one knee held to your chest',
      'Let the other leg hang off the edge',
      'Note if the hanging thigh rises or stays flat'
    ],
    // TODO: Add YouTube URL for demonstration video
    demonstrationUrl: '',
    duration: 15,
    repetitions: 2,
    expectedFindings: {
      positive: 'Thigh rising off surface indicates tight hip flexors (iliopsoas)',
      negative: 'Thigh remaining flat indicates normal hip flexor length'
    }
  },

  // ============================================
  // KNEE TESTS
  // ============================================
  {
    id: 'mcmurray-test',
    name: "McMurray's Test",
    targetArea: ['knee-left-anterior', 'knee-right-anterior'],
    targetMuscles: ['Meniscus', 'Knee joint'],
    instructions: [
      'Lie on your back with knee bent',
      'Hold your heel and knee',
      'Rotate your foot outward, then straighten the knee',
      'Then rotate your foot inward and straighten again',
      'Note any clicking, catching, or pain'
    ],
    // TODO: Add YouTube URL for demonstration video
    demonstrationUrl: '',
    duration: 15,
    repetitions: 2,
    expectedFindings: {
      positive: 'Click or pain during rotation and extension suggests meniscal tear',
      negative: 'Smooth movement without pain or clicking suggests intact meniscus'
    }
  },
  {
    id: 'anterior-drawer',
    name: 'Anterior Drawer Test',
    targetArea: ['knee-left-anterior', 'knee-right-anterior'],
    targetMuscles: ['ACL', 'Knee joint'],
    instructions: [
      'Sit with your knee bent to 90 degrees',
      'Have someone stabilize your foot',
      'Try to slide your shin bone forward',
      'Note any excessive forward movement compared to the other knee'
    ],
    // TODO: Add YouTube URL for demonstration video
    demonstrationUrl: '',
    duration: 10,
    repetitions: 2,
    expectedFindings: {
      positive: 'Excessive forward translation suggests ACL laxity or tear',
      negative: 'Firm endpoint with minimal movement suggests intact ACL'
    }
  }
];

export function getTestsForRegions(regions: string[]): MovementTest[] {
  return movementTests.filter(test =>
    test.targetArea.some(area => regions.includes(area))
  );
}

export function getTestById(id: string): MovementTest | undefined {
  return movementTests.find(test => test.id === id);
}
