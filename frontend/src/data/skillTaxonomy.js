/**
 * Standardized Skill Taxonomy for BuildForYou Platform
 * This file defines the complete skill structure that both workers and clients use.
 * Workers select skills from these categories, and clients create jobs using the same taxonomy.
 */

// Primary service categories that align with ServiceRequest model
export const SERVICE_CATEGORIES = [
  'Renovation',
  'Repair', 
  'Installation',
  'Maintenance',
  'Landscaping',
  'Painting',
  'Cleaning',
  'Electrical',
  'Plumbing',
  'Flooring',
  'Roofing',
  'Carpentry'
];

// Detailed skills organized by category for better job-worker matching
export const SKILL_TAXONOMY = {
  'Renovation': [
    'Bathroom Renovation',
    'Kitchen Renovation',
    'Basement Finishing',
    'Attic Conversion',
    'Home Extensions',
    'Whole House Renovation',
    'Commercial Renovation',
    'Historic Restoration'
  ],
  'Repair': [
    'Appliance Repair',
    'Furniture Repair',
    'Door Repair',
    'Window Repair',
    'Drywall Repair',
    'Fixture Repair',
    'Hardware Repair',
    'General Handyman'
  ],
  'Installation': [
    'Fixture Installation',
    'Appliance Installation',
    'Hardware Installation',
    'System Installation',
    'Security System Installation',
    'Home Theater Installation',
    'Smart Home Installation',
    'HVAC Installation'
  ],
  'Maintenance': [
    'Preventive Maintenance',
    'HVAC Maintenance',
    'Appliance Maintenance',
    'Seasonal Maintenance',
    'Property Maintenance',
    'Equipment Maintenance',
    'System Maintenance',
    'General Maintenance'
  ],
  'Landscaping': [
    'Garden Design',
    'Lawn Care',
    'Tree Service',
    'Irrigation Systems',
    'Hardscaping',
    'Landscape Lighting',
    'Seasonal Cleanup',
    'Pest Control'
  ],
  'Painting': [
    'Interior Painting',
    'Exterior Painting',
    'Cabinet Painting',
    'Deck Staining',
    'Wallpaper Installation',
    'Pressure Washing',
    'Paint Removal',
    'Commercial Painting'
  ],
  'Cleaning': [
    'Deep Cleaning',
    'Move-in/Move-out Cleaning',
    'Post-Construction Cleaning',
    'Carpet Cleaning',
    'Window Cleaning',
    'Pressure Washing',
    'Organizing Services',
    'Commercial Cleaning'
  ],
  'Electrical': [
    'Wiring Installation',
    'Outlet Installation',
    'Light Fixture Installation',
    'Electrical Panel Upgrade',
    'Circuit Installation',
    'Electrical Troubleshooting',
    'Smart Switch Installation',
    'Electrical Safety Inspection'
  ],
  'Plumbing': [
    'Pipe Installation',
    'Fixture Installation',
    'Drain Cleaning',
    'Water Heater Service',
    'Leak Repair',
    'Toilet Repair',
    'Faucet Installation',
    'Emergency Plumbing'
  ],
  'Flooring': [
    'Hardwood Installation',
    'Tile Installation',
    'Carpet Installation',
    'Laminate Installation',
    'Vinyl Installation',
    'Floor Refinishing',
    'Subfloor Repair',
    'Floor Removal'
  ],
  'Roofing': [
    'Roof Repair',
    'Roof Installation',
    'Gutter Installation',
    'Roof Inspection',
    'Shingle Replacement',
    'Roof Cleaning',
    'Skylight Installation',
    'Emergency Roof Repair'
  ],
  'Carpentry': [
    'Custom Cabinetry',
    'Trim Installation',
    'Deck Building',
    'Furniture Building',
    'Framing',
    'Finish Carpentry',
    'Stair Installation',
    'Custom Millwork'
  ]
};

// Flattened array of all skills for easy searching and filtering
export const ALL_SKILLS = Object.values(SKILL_TAXONOMY).flat();

// Helper function to get skills by category
export const getSkillsByCategory = (category) => {
  return SKILL_TAXONOMY[category] || [];
};

// Helper function to search skills across all categories
export const searchSkills = (searchTerm) => {
  if (!searchTerm) return [];
  const term = searchTerm.toLowerCase();
  return ALL_SKILLS.filter(skill => 
    skill.toLowerCase().includes(term)
  );
};

// Helper function to get category for a specific skill
export const getCategoryForSkill = (skill) => {
  for (const [category, skills] of Object.entries(SKILL_TAXONOMY)) {
    if (skills.includes(skill)) {
      return category;
    }
  }
  return null;
};

// Helper function to validate skills
export const validateSkills = (skills) => {
  if (!Array.isArray(skills)) return false;
  return skills.every(skill => ALL_SKILLS.includes(skill));
};

// Popular skills for quick selection
export const POPULAR_SKILLS = [
  'General Handyman',
  'Interior Painting',
  'Plumbing Repair',
  'Electrical Troubleshooting',
  'Lawn Care',
  'Deep Cleaning',
  'Appliance Repair',
  'Tile Installation',
  'Deck Building',
  'HVAC Maintenance'
];

export default {
  SERVICE_CATEGORIES,
  SKILL_TAXONOMY,
  ALL_SKILLS,
  POPULAR_SKILLS,
  getSkillsByCategory,
  searchSkills,
  getCategoryForSkill,
  validateSkills
};
