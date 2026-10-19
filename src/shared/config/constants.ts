export const TIME_SLOTS = [
  '12:00', '13:00', '14:00', '15:00', '16:00',
  '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'
];

// TODO: заменить на реальную страницу политики (например, '/privacy')
export const PRIVACY_POLICY_URL = '#';

export interface GuestOption {
  value: number;
  label: string;
}

export const GUEST_OPTIONS: GuestOption[] = Array.from({ length: 12 }, (_, i) => {
  const count = i + 1;
  let label = `${count} гостей`;

  if (count === 1) {
    label = '1 гость';
  } else if (count >= 2 && count <= 4) {
    label = `${count} гостя`;
  }

  return { value: count, label };
});