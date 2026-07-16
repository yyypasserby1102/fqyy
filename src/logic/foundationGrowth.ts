export interface FoundationGrowthAttributes {
  baseDamage: number;
  maxHealth: number;
  moveSpeed: number;
  magnetRadius: number;
}

export const FOUNDATION_GROWTH_PER_TRANSACTION: Readonly<FoundationGrowthAttributes> = {
  baseDamage: 1,
  maxHealth: 8,
  moveSpeed: 3,
  magnetRadius: 8
};

export function projectFoundationGrowth(transactions: number): FoundationGrowthAttributes {
  const count = Math.max(0, Math.floor(transactions));
  return {
    baseDamage: FOUNDATION_GROWTH_PER_TRANSACTION.baseDamage * count,
    maxHealth: FOUNDATION_GROWTH_PER_TRANSACTION.maxHealth * count,
    moveSpeed: FOUNDATION_GROWTH_PER_TRANSACTION.moveSpeed * count,
    magnetRadius: FOUNDATION_GROWTH_PER_TRANSACTION.magnetRadius * count
  };
}

export function formatFoundationGrowthPackage(): string {
  const growth = FOUNDATION_GROWTH_PER_TRANSACTION;
  return `+${growth.baseDamage} damage · +${growth.maxHealth} max HP · +${growth.moveSpeed} movement · +${growth.magnetRadius} orb radius`;
}
