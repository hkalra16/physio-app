import { MuscleMapping } from '@/lib/types';

export const muscleRegionMap: Record<string, MuscleMapping> = {
  // Head & Neck
  'head': {
    primary: ['Temporalis', 'Masseter', 'Occipitalis'],
    secondary: ['Frontalis', 'Orbicularis'],
    nerves: ['Trigeminal nerve', 'Facial nerve']
  },
  'neck-anterior': {
    primary: ['Sternocleidomastoid', 'Scalenes'],
    secondary: ['Platysma', 'Longus colli'],
    nerves: ['Cervical plexus', 'Accessory nerve']
  },
  'neck-posterior': {
    primary: ['Trapezius (upper)', 'Splenius capitis', 'Semispinalis'],
    secondary: ['Levator scapulae', 'Suboccipitals'],
    nerves: ['Cervical plexus', 'Greater occipital nerve']
  },

  // Shoulders
  'shoulder-left-anterior': {
    primary: ['Deltoid (anterior)', 'Pectoralis major (clavicular)'],
    secondary: ['Biceps brachii (long head)', 'Coracobrachialis'],
    nerves: ['Axillary nerve', 'Musculocutaneous nerve']
  },
  'shoulder-right-anterior': {
    primary: ['Deltoid (anterior)', 'Pectoralis major (clavicular)'],
    secondary: ['Biceps brachii (long head)', 'Coracobrachialis'],
    nerves: ['Axillary nerve', 'Musculocutaneous nerve']
  },
  'shoulder-left-posterior': {
    primary: ['Deltoid (posterior)', 'Infraspinatus', 'Teres minor'],
    secondary: ['Supraspinatus', 'Teres major'],
    nerves: ['Axillary nerve', 'Suprascapular nerve']
  },
  'shoulder-right-posterior': {
    primary: ['Deltoid (posterior)', 'Infraspinatus', 'Teres minor'],
    secondary: ['Supraspinatus', 'Teres major'],
    nerves: ['Axillary nerve', 'Suprascapular nerve']
  },

  // Chest
  'chest-left': {
    primary: ['Pectoralis major', 'Pectoralis minor'],
    secondary: ['Serratus anterior', 'Intercostals'],
    nerves: ['Pectoral nerves', 'Long thoracic nerve']
  },
  'chest-right': {
    primary: ['Pectoralis major', 'Pectoralis minor'],
    secondary: ['Serratus anterior', 'Intercostals'],
    nerves: ['Pectoral nerves', 'Long thoracic nerve']
  },
  'chest-center': {
    primary: ['Pectoralis major (sternal)'],
    secondary: ['Intercostals'],
    nerves: ['Pectoral nerves', 'Intercostal nerves']
  },

  // Upper Back
  'upper-back-left': {
    primary: ['Trapezius (middle)', 'Rhomboids'],
    secondary: ['Latissimus dorsi (upper)', 'Serratus posterior superior'],
    nerves: ['Dorsal scapular nerve', 'Accessory nerve']
  },
  'upper-back-right': {
    primary: ['Trapezius (middle)', 'Rhomboids'],
    secondary: ['Latissimus dorsi (upper)', 'Serratus posterior superior'],
    nerves: ['Dorsal scapular nerve', 'Accessory nerve']
  },
  'upper-back-center': {
    primary: ['Trapezius', 'Erector spinae (thoracic)'],
    secondary: ['Multifidus', 'Rotatores'],
    nerves: ['Spinal nerves (thoracic)', 'Accessory nerve']
  },

  // Arms
  'upper-arm-left-anterior': {
    primary: ['Biceps brachii', 'Brachialis'],
    secondary: ['Coracobrachialis'],
    nerves: ['Musculocutaneous nerve']
  },
  'upper-arm-right-anterior': {
    primary: ['Biceps brachii', 'Brachialis'],
    secondary: ['Coracobrachialis'],
    nerves: ['Musculocutaneous nerve']
  },
  'upper-arm-left-posterior': {
    primary: ['Triceps brachii'],
    secondary: ['Anconeus'],
    nerves: ['Radial nerve']
  },
  'upper-arm-right-posterior': {
    primary: ['Triceps brachii'],
    secondary: ['Anconeus'],
    nerves: ['Radial nerve']
  },
  'forearm-left-anterior': {
    primary: ['Flexor carpi radialis', 'Flexor carpi ulnaris', 'Pronator teres'],
    secondary: ['Flexor digitorum superficialis', 'Palmaris longus'],
    nerves: ['Median nerve', 'Ulnar nerve']
  },
  'forearm-right-anterior': {
    primary: ['Flexor carpi radialis', 'Flexor carpi ulnaris', 'Pronator teres'],
    secondary: ['Flexor digitorum superficialis', 'Palmaris longus'],
    nerves: ['Median nerve', 'Ulnar nerve']
  },
  'forearm-left-posterior': {
    primary: ['Extensor carpi radialis', 'Extensor carpi ulnaris', 'Extensor digitorum'],
    secondary: ['Supinator', 'Brachioradialis'],
    nerves: ['Radial nerve', 'Posterior interosseous nerve']
  },
  'forearm-right-posterior': {
    primary: ['Extensor carpi radialis', 'Extensor carpi ulnaris', 'Extensor digitorum'],
    secondary: ['Supinator', 'Brachioradialis'],
    nerves: ['Radial nerve', 'Posterior interosseous nerve']
  },
  'hand-left': {
    primary: ['Thenar muscles', 'Hypothenar muscles', 'Lumbricals'],
    secondary: ['Interossei', 'Adductor pollicis'],
    nerves: ['Median nerve', 'Ulnar nerve']
  },
  'hand-right': {
    primary: ['Thenar muscles', 'Hypothenar muscles', 'Lumbricals'],
    secondary: ['Interossei', 'Adductor pollicis'],
    nerves: ['Median nerve', 'Ulnar nerve']
  },

  // Abdomen
  'abdomen-upper': {
    primary: ['Rectus abdominis (upper)', 'External oblique'],
    secondary: ['Internal oblique', 'Transversus abdominis'],
    nerves: ['Intercostal nerves', 'Subcostal nerve']
  },
  'abdomen-lower': {
    primary: ['Rectus abdominis (lower)', 'External oblique'],
    secondary: ['Internal oblique', 'Transversus abdominis'],
    nerves: ['Iliohypogastric nerve', 'Ilioinguinal nerve']
  },
  'abdomen-left': {
    primary: ['External oblique', 'Internal oblique'],
    secondary: ['Transversus abdominis'],
    nerves: ['Intercostal nerves', 'Subcostal nerve']
  },
  'abdomen-right': {
    primary: ['External oblique', 'Internal oblique'],
    secondary: ['Transversus abdominis'],
    nerves: ['Intercostal nerves', 'Subcostal nerve']
  },

  // Lower Back
  'lower-back-left': {
    primary: ['Erector spinae', 'Quadratus lumborum'],
    secondary: ['Multifidus', 'Latissimus dorsi'],
    nerves: ['Lumbar spinal nerves', 'Subcostal nerve']
  },
  'lower-back-right': {
    primary: ['Erector spinae', 'Quadratus lumborum'],
    secondary: ['Multifidus', 'Latissimus dorsi'],
    nerves: ['Lumbar spinal nerves', 'Subcostal nerve']
  },
  'lower-back-center': {
    primary: ['Erector spinae', 'Multifidus'],
    secondary: ['Interspinales', 'Rotatores'],
    nerves: ['Lumbar spinal nerves']
  },

  // Hips & Glutes
  'hip-left-anterior': {
    primary: ['Iliopsoas', 'Rectus femoris'],
    secondary: ['Tensor fasciae latae', 'Sartorius'],
    nerves: ['Femoral nerve', 'Lumbar plexus']
  },
  'hip-right-anterior': {
    primary: ['Iliopsoas', 'Rectus femoris'],
    secondary: ['Tensor fasciae latae', 'Sartorius'],
    nerves: ['Femoral nerve', 'Lumbar plexus']
  },
  'glute-left': {
    primary: ['Gluteus maximus', 'Gluteus medius'],
    secondary: ['Gluteus minimus', 'Piriformis'],
    nerves: ['Superior gluteal nerve', 'Inferior gluteal nerve', 'Sciatic nerve']
  },
  'glute-right': {
    primary: ['Gluteus maximus', 'Gluteus medius'],
    secondary: ['Gluteus minimus', 'Piriformis'],
    nerves: ['Superior gluteal nerve', 'Inferior gluteal nerve', 'Sciatic nerve']
  },

  // Thighs
  'thigh-left-anterior': {
    primary: ['Quadriceps (rectus femoris, vastus lateralis, vastus medialis, vastus intermedius)'],
    secondary: ['Sartorius', 'Tensor fasciae latae'],
    nerves: ['Femoral nerve']
  },
  'thigh-right-anterior': {
    primary: ['Quadriceps (rectus femoris, vastus lateralis, vastus medialis, vastus intermedius)'],
    secondary: ['Sartorius', 'Tensor fasciae latae'],
    nerves: ['Femoral nerve']
  },
  'thigh-left-posterior': {
    primary: ['Hamstrings (biceps femoris, semitendinosus, semimembranosus)'],
    secondary: ['Adductor magnus'],
    nerves: ['Sciatic nerve']
  },
  'thigh-right-posterior': {
    primary: ['Hamstrings (biceps femoris, semitendinosus, semimembranosus)'],
    secondary: ['Adductor magnus'],
    nerves: ['Sciatic nerve']
  },
  'thigh-left-inner': {
    primary: ['Adductor longus', 'Adductor brevis', 'Gracilis'],
    secondary: ['Pectineus', 'Adductor magnus'],
    nerves: ['Obturator nerve']
  },
  'thigh-right-inner': {
    primary: ['Adductor longus', 'Adductor brevis', 'Gracilis'],
    secondary: ['Pectineus', 'Adductor magnus'],
    nerves: ['Obturator nerve']
  },

  // Knees
  'knee-left-anterior': {
    primary: ['Quadriceps tendon', 'Patellar tendon'],
    secondary: ['Patella', 'Knee joint capsule'],
    nerves: ['Femoral nerve', 'Saphenous nerve']
  },
  'knee-right-anterior': {
    primary: ['Quadriceps tendon', 'Patellar tendon'],
    secondary: ['Patella', 'Knee joint capsule'],
    nerves: ['Femoral nerve', 'Saphenous nerve']
  },
  'knee-left-posterior': {
    primary: ['Popliteus', 'Gastrocnemius (origin)'],
    secondary: ['Hamstring insertions', 'Popliteal fossa'],
    nerves: ['Tibial nerve', 'Common peroneal nerve']
  },
  'knee-right-posterior': {
    primary: ['Popliteus', 'Gastrocnemius (origin)'],
    secondary: ['Hamstring insertions', 'Popliteal fossa'],
    nerves: ['Tibial nerve', 'Common peroneal nerve']
  },

  // Lower Legs
  'calf-left': {
    primary: ['Gastrocnemius', 'Soleus'],
    secondary: ['Plantaris', 'Tibialis posterior'],
    nerves: ['Tibial nerve']
  },
  'calf-right': {
    primary: ['Gastrocnemius', 'Soleus'],
    secondary: ['Plantaris', 'Tibialis posterior'],
    nerves: ['Tibial nerve']
  },
  'shin-left': {
    primary: ['Tibialis anterior', 'Extensor digitorum longus'],
    secondary: ['Extensor hallucis longus', 'Peroneus tertius'],
    nerves: ['Deep peroneal nerve']
  },
  'shin-right': {
    primary: ['Tibialis anterior', 'Extensor digitorum longus'],
    secondary: ['Extensor hallucis longus', 'Peroneus tertius'],
    nerves: ['Deep peroneal nerve']
  },

  // Ankles & Feet
  'ankle-left': {
    primary: ['Achilles tendon', 'Tibialis anterior tendon'],
    secondary: ['Peroneal tendons', 'Ankle joint capsule'],
    nerves: ['Tibial nerve', 'Deep peroneal nerve']
  },
  'ankle-right': {
    primary: ['Achilles tendon', 'Tibialis anterior tendon'],
    secondary: ['Peroneal tendons', 'Ankle joint capsule'],
    nerves: ['Tibial nerve', 'Deep peroneal nerve']
  },
  'foot-left': {
    primary: ['Plantar fascia', 'Intrinsic foot muscles'],
    secondary: ['Flexor hallucis brevis', 'Abductor hallucis'],
    nerves: ['Tibial nerve', 'Plantar nerves']
  },
  'foot-right': {
    primary: ['Plantar fascia', 'Intrinsic foot muscles'],
    secondary: ['Flexor hallucis brevis', 'Abductor hallucis'],
    nerves: ['Tibial nerve', 'Plantar nerves']
  }
};

export function getMusclesForRegion(regionId: string): MuscleMapping | null {
  return muscleRegionMap[regionId] || null;
}

export function getAllMusclesForMarkers(regionIds: string[]): string[] {
  const allMuscles = new Set<string>();

  regionIds.forEach(regionId => {
    const mapping = muscleRegionMap[regionId];
    if (mapping) {
      mapping.primary.forEach(m => allMuscles.add(m));
      mapping.secondary.forEach(m => allMuscles.add(m));
    }
  });

  return Array.from(allMuscles);
}
