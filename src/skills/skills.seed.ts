import { PrismaClient } from '@prisma/client';

export const skills = [
  { code: 'adventure', icon: 'hiking', color: '#6366f1' },
  { code: 'anti-trafficking', icon: 'gavel', color: '#ef4444' },
  { code: 'bible', icon: 'book', color: '#eab308' },
  { code: 'business', icon: 'briefcase', color: '#3b82f6' },
  { code: 'children-and-youth', icon: 'human-child', color: '#22c55e' },
  { code: 'children-at-risk', icon: 'baby-face-outline', color: '#ec4899' },
  { code: 'cinematography', icon: 'video', color: '#a855f7' },
  { code: 'compassion', icon: 'hand-heart', color: '#14b8a6' },
  { code: 'community-development', icon: 'city', color: '#06b6d4' },
  { code: 'counseling', icon: 'head-heart', color: '#f97316' },
  { code: 'culture', icon: 'earth', color: '#84cc16' },
  { code: 'design', icon: 'pencil-ruler', color: '#d946ef' },
  { code: 'evangelism', icon: 'bullhorn', color: '#f43f5e' },
  { code: 'family', icon: 'account-group', color: '#f59e0b' },
  { code: 'fine-arts', icon: 'palette', color: '#10b981' },
  { code: 'frontiers', icon: 'compass', color: '#8b5cf6' },
  { code: 'healthcare', icon: 'hospital', color: '#ef4444' },
  { code: 'leadership', icon: 'account-tie', color: '#f97316' },
  { code: 'media', icon: 'television', color: '#0ea5e9' },
  { code: 'music', icon: 'music', color: '#14b8a6' },
  { code: 'performing-arts', icon: 'drama-masks', color: '#6366f1' },
  { code: 'photography', icon: 'camera', color: '#3b82f6' },
  { code: 'poor-and-marginalized', icon: 'hand-coin', color: '#eab308' },
  { code: 'reconciliation', icon: 'handshake', color: '#22c55e' },
  { code: 'refugees', icon: 'human-male-female', color: '#ec4899' },
  { code: 'revival', icon: 'flare', color: '#a855f7' },
  { code: 'science', icon: 'flask', color: '#14b8a6' },
  { code: 'social-justice', icon: 'scale-balance', color: '#06b6d4' },
  { code: 'spiritual-growth', icon: 'leaf', color: '#f97316' },
  { code: 'sports', icon: 'soccer', color: '#84cc16' },
  { code: 'teaching', icon: 'school', color: '#d946ef' },
  { code: 'technology', icon: 'laptop', color: '#f43f5e' },
  { code: 'the-unreached', icon: 'earth', color: '#f59e0b' },
  { code: 'urban', icon: 'city-variant', color: '#10b981' },
  { code: 'writing', icon: 'pencil', color: '#8b5cf6' },
  { code: 'worship', icon: 'music', color: '#84cc16' },
];

export async function seedSkills(prisma: PrismaClient) {
  await prisma.$transaction(
    skills.map((skill) =>
      prisma.skill.upsert({
        where: { code: skill.code },
        update: { color: skill.color, icon: skill.icon },
        create: skill,
      }),
    ),
  );
}
