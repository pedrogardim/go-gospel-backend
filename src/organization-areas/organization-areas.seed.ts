import { PrismaClient } from '@prisma/client';

export const organizationAreas = [
  {
    code: 'volunteer',
    icon: 'account',
    color: '#22c55e',
    category: 'individual',
  },
  {
    code: 'missionary',
    icon: 'earth',
    color: '#06b6d4',
    category: 'individual',
  },
  {
    code: 'evangelist',
    icon: 'bullhorn',
    color: '#ef4444',
    category: 'individual',
  },
  {
    code: 'church',
    icon: 'church',
    color: '#3b82f6',
    category: 'mission-spiritual',
  },
  {
    code: 'association',
    icon: 'account-group',
    color: '#22c55e',
    category: 'organization-community',
  },
  {
    code: 'foundation',
    icon: 'domain',
    color: '#14b8a6',
    category: 'organization-community',
  },
  {
    code: 'ngo',
    icon: 'charity',
    color: '#a855f7',
    category: 'organization-community',
  },
  {
    code: 'ministry',
    icon: 'cross',
    color: '#ef4444',
    category: 'mission-spiritual',
  },
  {
    code: 'rehab',
    icon: 'hospital',
    color: '#f97316',
    category: 'health-wellness',
  },
  {
    code: 'women',
    icon: 'face-woman',
    color: '#ec4899',
    category: 'health-wellness',
  },
  {
    code: 'media',
    icon: 'radio',
    color: '#f59e0b',
    category: 'media-communication',
  },
  {
    code: 'mission-agency',
    icon: 'earth',
    color: '#06b6d4',
    category: 'mission-spiritual',
  },
  {
    code: 'fraternity',
    icon: 'account-multiple',
    color: '#ec4899',
    category: 'organization-community',
  },
  {
    code: 'denomination',
    icon: 'church',
    color: '#3b82f6',
    category: 'mission-spiritual',
  },
  {
    code: 'organization',
    icon: 'domain',
    color: '#ef4444',
    category: 'organization-community',
  },
  {
    code: 'bookstore',
    icon: 'book-open',
    color: '#f59e0b',
    category: 'education-literature',
  },
  {
    code: 'record-label',
    icon: 'music-note',
    color: '#a855f7',
    category: 'arts-entertainment',
  },
  {
    code: 'business',
    icon: 'storefront',
    color: '#3b82f6',
    category: 'business-science',
  },
  {
    code: 'school-university',
    icon: 'school',
    color: '#6366f1',
    category: 'education-literature',
  },
  {
    code: 'seminary',
    icon: 'library',
    color: '#f97316',
    category: 'education-literature',
  },
  { code: 'sports', icon: 'soccer', color: '#84cc16', category: 'sports' },
];

export async function seedOrganizationAreas(prisma: PrismaClient) {
  await prisma.$transaction(
    organizationAreas.map((organizationArea) =>
      prisma.organizationArea.upsert({
        where: { code: organizationArea.code },
        update: {
          color: organizationArea.color,
          icon: organizationArea.icon,
          category: organizationArea.category,
        },
        create: organizationArea,
      }),
    ),
  );
}
