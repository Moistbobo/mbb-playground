import { SymbolView } from 'expo-symbols';
import { Text } from 'react-native';

import { resolveListIcon } from '@/features/lists/lib/list-icon';

interface ListIconProps {
  icon: string | null;
  color: string;
  size?: number;
}

export function ListIcon({ icon, color, size = 20 }: ListIconProps) {
  const resolved = resolveListIcon(icon);

  if (resolved.kind === 'emoji') {
    return <Text style={{ fontSize: size, lineHeight: size + 2, color }}>{resolved.value}</Text>;
  }

  return <SymbolView name={resolved.name} size={size} tintColor={color} />;
}
