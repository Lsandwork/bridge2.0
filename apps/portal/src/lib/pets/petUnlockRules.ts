export function canUseItem(item: { unlockLevel?: number }, level: number) {
  return level >= (item.unlockLevel ?? 1);
}
