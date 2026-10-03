import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import { Linking, Pressable, Share, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { PlatformBadge } from '@/features/worlds/components/platform-badge';
import { TagBadge } from '@/features/worlds/components/tag-badge';
import { getPlatformLabel } from '@/features/worlds/lib/platform-label';
import { createWSRVUrl } from '@/features/worlds/lib/world-image';
import type { World } from '@/features/worlds/types';

const MAX_TAGS = 4;

interface WorldCardProps {
  world: World;
  onSelect: (world: World) => void;
  selected?: boolean;
  compact?: boolean;
  saved?: boolean;
  onOpenSave?: () => void;
  onRemove?: () => void;
}

export function WorldCard({
  world,
  onSelect,
  selected = false,
  compact = false,
  saved = false,
  onOpenSave,
  onRemove,
}: WorldCardProps) {
  const { theme } = useUnistyles();
  const { t } = useTranslation();

  const addDate = new Date(world.internalAddDate ?? world.createdAt);
  const visibleTags = world.tags.slice(0, compact ? 1 : MAX_TAGS);
  const extraTagCount = world.tags.length - visibleTags.length;
  const canOpen = world.vrchatUrl.length > 0;
  const author = world.authorName || t('worlds.unknown');
  const accessibilityLabel = [
    world.name,
    t('worlds.byAuthor', { author }),
    t('worlds.capacity', { capacity: world.capacity }),
    ...world.platforms.map(getPlatformLabel),
    ...world.tags,
  ].join(', ');

  return (
    <View style={[styles.card, compact ? styles.cardCompact : null, selected ? styles.cardSelected : null]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={t('worlds.showsDetails')}
        accessibilityState={{ selected }}
        onPress={() => onSelect(world)}>
        <View style={[styles.imageWrap, compact ? styles.imageWrapCompact : null]}>
          {world.imageUrl ? (
            <Image
              source={{ uri: createWSRVUrl(world.imageUrl, 280, 65) }}
              style={styles.image}
              contentFit="cover"
              transition={150}
              accessible={false}
            />
          ) : (
            <View style={styles.imageFallback}>
              <SymbolView
                name={{ ios: 'globe', android: 'public' }}
                size={36}
                tintColor={theme.colors.textSubtle}
              />
            </View>
          )}

          {world.quality === 'good' || world.quality === 'bad' || world.highPriority === true ? (
            <View style={styles.badgeRow}>
              {world.quality === 'good' ? (
                <View style={[styles.badge, styles.badgeGood]}>
                  <Text style={styles.badgeLabel}>{t('worlds.qualityGood')}</Text>
                </View>
              ) : null}
              {world.quality === 'bad' ? (
                <View style={[styles.badge, styles.badgeBad]}>
                  <Text style={styles.badgeLabel}>{t('worlds.qualityBad')}</Text>
                </View>
              ) : null}
              {world.highPriority === true ? (
                <View style={[styles.badge, styles.badgePriority]}>
                  <Text style={styles.badgeLabel}>{t('worlds.highPriority')}</Text>
                </View>
              ) : null}
            </View>
          ) : null}
        </View>

        <View style={[styles.body, compact ? styles.bodyCompact : null]}>
          <Text numberOfLines={1} style={styles.name}>
            {world.name}
          </Text>
          <Text numberOfLines={1} style={styles.author}>
            {t('worlds.byAuthor', { author })}
          </Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <SymbolView
                name={{ ios: 'person.2.fill', android: 'group' }}
                size={13}
                tintColor={theme.colors.textSubtle}
              />
              <Text style={styles.metaLabel}>{world.capacity}</Text>
            </View>
            {Number.isNaN(addDate.getTime()) ? null : (
              <View style={styles.metaItem}>
                <SymbolView
                  name={{ ios: 'calendar', android: 'calendar_today' }}
                  size={13}
                  tintColor={theme.colors.textSubtle}
                />
                <Text style={styles.metaLabel}>{addDate.toLocaleDateString()}</Text>
              </View>
            )}
          </View>

          {world.platforms.length > 0 ? (
            <View style={styles.badgeGroup}>
              {world.platforms.map((platform) => (
                <PlatformBadge key={platform} platform={platform} />
              ))}
            </View>
          ) : null}

          {world.tags.length > 0 ? (
            <View style={styles.badgeGroup}>
              {visibleTags.map((tag) => (
                <TagBadge key={tag} tag={tag} />
              ))}
              {extraTagCount > 0 ? (
                <Text style={styles.moreLabel}>
                  {compact
                    ? t('worlds.moreCount', { count: extraTagCount })
                    : t('worlds.more', { count: extraTagCount })}
                </Text>
              ) : null}
            </View>
          ) : null}
        </View>
      </Pressable>

      <View style={styles.topActions}>
        {onRemove ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('lists.removeWorld')}
            onPress={onRemove}
            hitSlop={8}
            style={styles.saveButton}>
            <SymbolView
              name={{ ios: 'trash', android: 'delete' }}
              size={18}
              tintColor={theme.colors.danger}
            />
          </Pressable>
        ) : null}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={saved ? t('worlds.savedToList') : t('worlds.saveToList')}
          accessibilityState={{ selected: saved }}
          onPress={onOpenSave}
          hitSlop={8}
          style={styles.saveButton}>
          <SymbolView
            name={{ ios: saved ? 'star.fill' : 'star', android: 'star' }}
            size={18}
            tintColor={saved ? theme.colors.primary : theme.colors.textMuted}
          />
        </Pressable>
      </View>

      <View style={[styles.actions, compact ? styles.actionsCompact : null]}>
        {compact ? (
          <>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('worlds.openInVrchat')}
              disabled={!canOpen}
              onPress={() => Linking.openURL(world.vrchatUrl)}
              style={[
                styles.iconButton,
                styles.iconButtonPrimary,
                canOpen ? null : styles.actionDisabled,
              ]}>
              <SymbolView
                name={{ ios: 'arrow.up.right.square', android: 'open_in_new' }}
                size={18}
                tintColor={theme.colors.onPrimary}
              />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('worlds.share')}
              disabled={!canOpen}
              onPress={() => Share.share({ message: world.vrchatUrl })}
              style={[
                styles.iconButton,
                styles.iconButtonSecondary,
                canOpen ? null : styles.actionDisabled,
              ]}>
              <SymbolView
                name={{ ios: 'square.and.arrow.up', android: 'share' }}
                size={18}
                tintColor={theme.colors.text}
              />
            </Pressable>
          </>
        ) : (
          <>
            <Pressable
              accessibilityRole="button"
              disabled={!canOpen}
              onPress={() => Linking.openURL(world.vrchatUrl)}
              style={[styles.vrchatButton, canOpen ? null : styles.actionDisabled]}>
              <SymbolView
                name={{ ios: 'arrow.up.right.square', android: 'open_in_new' }}
                size={16}
                tintColor={theme.colors.onPrimary}
              />
              <Text style={styles.vrchatLabel}>{t('worlds.openInVrchat')}</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('worlds.share')}
              disabled={!canOpen}
              onPress={() => Share.share({ message: world.vrchatUrl })}
              style={[styles.shareButton, canOpen ? null : styles.actionDisabled]}>
              <SymbolView
                name={{ ios: 'square.and.arrow.up', android: 'share' }}
                size={18}
                tintColor={theme.colors.text}
              />
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  card: {
    flex: 1,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    overflow: 'hidden',
  },
  cardSelected: {
    borderColor: theme.colors.primary,
  },
  cardCompact: {
    maxHeight: 340,
  },
  imageWrap: {
    height: 160,
    backgroundColor: theme.colors.surfaceMuted,
  },
  imageWrapCompact: {
    height: 110,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeRow: {
    position: 'absolute',
    top: theme.spacing.sm,
    left: theme.spacing.sm,
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  badge: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.radius.sm,
  },
  badgeGood: {
    backgroundColor: theme.colors.success,
  },
  badgeBad: {
    backgroundColor: theme.colors.danger,
  },
  badgePriority: {
    backgroundColor: theme.colors.warning,
  },
  badgeLabel: {
    ...theme.typography.caption,
    color: theme.colors.background,
    textTransform: 'uppercase',
  },
  saveButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  topActions: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  body: {
    paddingTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  bodyCompact: {
    paddingTop: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  name: {
    ...theme.typography.heading,
    color: theme.colors.text,
  },
  author: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  metaLabel: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
  badgeGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  moreLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSubtle,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
  },
  actionsCompact: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
  },
  iconButton: {
    flex: 1,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.md,
  },
  iconButtonPrimary: {
    backgroundColor: theme.colors.primary,
  },
  iconButtonSecondary: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  vrchatButton: {
    flex: 1,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primary,
  },
  vrchatLabel: {
    ...theme.typography.label,
    color: theme.colors.onPrimary,
  },
  shareButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  actionDisabled: {
    opacity: 0.5,
  },
}));
