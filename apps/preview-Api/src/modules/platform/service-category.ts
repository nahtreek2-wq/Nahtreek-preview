import {NotFoundException} from '@nestjs/common';
import type {Prisma} from '@prisma/client';

// Older profiles store catalogue IDs; current forms store slugs. Resolve both
// against the active server catalogue instead of guessing from string prefixes.
export async function resolveServiceCategory(
  db: Pick<Prisma.TransactionClient, 'serviceCategory'>,
  value: string,
) {
  const category = await db.serviceCategory.findFirst({
    where: {isActive: true, OR: [{slug: value}, {id: value}]},
  });
  if (!category) throw new NotFoundException('Service unavailable');
  return category;
}

export function serviceCategoryKeys(category: {id: string; slug: string}) {
  return [...new Set([category.id, category.slug])];
}
