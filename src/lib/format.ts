export function formatPrice(value: number): string {
  return (
    value.toLocaleString('ru-RU', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }) + ' ₽'
  );
}
