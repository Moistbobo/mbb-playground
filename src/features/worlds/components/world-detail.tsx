import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, Pressable, Share, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { useLists } from '@/features/lists/ListsContext';
import { SaveToListDialog } from '@/features/lists/components/save-to-list-dialog';
import { PlatformBadge } from '@/features/worlds/components/platform-badge';
import { TagBadge } from '@/features/worlds/components/tag-badge';
import { createWSRVUrl } from '@/features/worlds/lib/world-image';
import type { World, WorldTag } from '@/features/worlds/types';

interface WorldDetailProps {
  world: World;
  tagMap: ReadonlyMap<string, WorldTag>;
}

export function WorldDetail({ world, tagMap }: WorldDetailProps) {
  const { theme } = useUnistyles();
  const { t } = useTranslation();
  const { isWorldInAnyList } = useLists();
  const [saveOpen, setSaveOpen] = useState(false);

  const saved = isWorldInAnyList(world.worldId);

  const canOpen = world.vrchatUrl.length > 0;
  const addDate = new Date(world.internalAddDate ?? world.createdAt);
  const author = world.authorName || t('worlds.unknown');

  return (
    <View style={styles.card}>
      <View style={styles.imageWrap}>
        {world.imageUrl ? (
          <Image
            source={{ uri: createWSRVUrl(world.imageUrl, 800, 80) }}
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
      </View>

      <View style={styles.body}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.name}>{world.name}</Text>
            <Text style={styles.author}>{t('worlds.byAuthor', { author })}</Text>
          </View>

          <View style={styles.badgeRow}>
            {world.quality === 'good' ? (
              <View style={[styles.qualityBadge, styles.qualityGood]}>
                <Text style={[styles.qualityLabel, styles.qualityGoodLabel]}>
                  {t('worlds.qualityGood')}
                </Text>
              </View>
            ) : null}
            {world.quality === 'bad' ? (
              <View style={[styles.qualityBadge, styles.qualityBad]}>
                <Text style={[styles.qualityLabel, styles.qualityBadLabel]}>
                  {t('worlds.qualityBad')}
                </Text>
              </View>
            ) : null}
            {world.quality === null ? (
              <View style={[styles.qualityBadge, styles.qualityNone]}>
                <Text style={[styles.qualityLabel, styles.qualityNoneLabel]}>
                  {t('worlds.qualityNone')}
                </Text>
              </View>
            ) : null}
            {world.highPriority === true ? (
              <View style={[styles.qualityBadge, styles.qualityPriority]}>
                <Text style={[styles.qualityLabel, styles.qualityPriorityLabel]}>
                  {t('worlds.highPriority')}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.metaList}>
          <View style={styles.metaRow}>
            <SymbolView
              name={{ ios: 'person.2.fill', android: 'group' }}
              size={15}
              tintColor={theme.colors.textSubtle}
            />
            <Text style={styles.metaText}>
              <Text style={styles.metaLabel}>{t('worlds.capacityLabel')}</Text> {String(world.capacity)}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <SymbolView
              name={{ ios: 'number', android: 'tag' }}
              size={15}
              tintColor={theme.colors.textSubtle}
            />
            <Text style={styles.metaText}>
              <Text style={styles.metaLabel}>{t('worlds.idLabel')}</Text>{' '}
              <Text style={styles.mono}>{world.worldId}</Text>
            </Text>
          </View>
          {Number.isNaN(addDate.getTime()) ? null : (
            <View style={styles.metaRow}>
              <SymbolView
                name={{ ios: 'calendar', android: 'calendar_today' }}
                size={15}
                tintColor={theme.colors.textSubtle}
              />
              <Text style={styles.metaText}>
                <Text style={styles.metaLabel}>{t('worlds.taggedOn')}</Text>{' '}
                {addDate.toLocaleString()}
              </Text>
            </View>
          )}
        </View>

        {world.platforms.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{t('worlds.platforms')}</Text>
            <View style={styles.badgeGroup}>
              {world.platforms.map((platform) => (
                <PlatformBadge key={platform} platform={platform} />
              ))}
            </View>
          </View>
        ) : null}

        {world.tags.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{t('worlds.tags')}</Text>
            <View style={styles.badgeGroup}>
              {world.tags.map((tag) => {
                const meta = tagMap.get(tag);
                return meta ? (
                  <TagBadge key={tag} tag={tag} emoji={meta.emoji} color={meta.hexColor} full />
                ) : (
                  <TagBadge key={tag} tag={tag} full />
                );
              })}
            </View>
          </View>
        ) : null}

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('worlds.openInVrchat')}
            disabled={!canOpen}
            onPress={() => Linking.openURL(world.vrchatUrl)}
            style={[styles.primaryButton, canOpen ? null : styles.disabled]}>
            <SymbolView
              name={{ ios: 'arrow.up.right.square', android: 'open_in_new' }}
              size={16}
              tintColor={theme.colors.onPrimary}
            />
            <Text style={styles.primaryLabel}>{t('worlds.openInVrchat')}</Text>
          </Pressable>

          <View style={styles.secondaryRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('worlds.share')}
              disabled={!canOpen}
              onPress={() => Share.share({ message: world.vrchatUrl })}
              style={[styles.secondaryButton, canOpen ? null : styles.disabled]}>
              <SymbolView
                name={{ ios: 'square.and.arrow.up', android: 'share' }}
                size={18}
                tintColor={theme.colors.text}
              />
              <Text style={styles.secondaryLabel}>{t('worlds.share')}</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('worlds.saveToList')}
              accessibilityState={{ selected: saved }}
              onPress={() => setSaveOpen(true)}
              style={styles.secondaryButton}>
              <SymbolView
                name={{ ios: saved ? 'star.fill' : 'star', android: 'star' }}
                size={18}
                tintColor={saved ? theme.colors.primary : theme.colors.text}
              />
              <Text style={styles.secondaryLabel}>{t('worlds.saveToList')}</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <SaveToListDialog worldId={world.worldId} open={saveOpen} onOpenChange={setSaveOpen} />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  card: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    overflow: 'hidden',
  },
  imageWrap: {
    height: 200,
    backgroundColor: theme.colors.surfaceMuted,
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
  body: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  header: {
    gap: theme.spacing.sm,
  },
  headerText: {
    gap: theme.spacing.xs,
  },
  name: {
    ...theme.typography.title,
    color: theme.colors.text,
  },
  author: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  qualityBadge: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
  },
  qualityLabel: {
    ...theme.typography.caption,
  },
  qualityGood: {
    borderColor: theme.colors.success,
  },
  qualityGoodLabel: {
    color: theme.colors.success,
  },
  qualityBad: {
    borderColor: theme.colors.danger,
  },
  qualityBadLabel: {
    color: theme.colors.danger,
  },
  qualityNone: {
    borderColor: theme.colors.borderStrong,
  },
  qualityNoneLabel: {
    color: theme.colors.textMuted,
  },
  qualityPriority: {
    borderColor: theme.colors.warning,
  },
  qualityPriorityLabel: {
    color: theme.colors.warning,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
  },
  metaList: {
    gap: theme.spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  metaText: {
    ...theme.typography.body,
    flexShrink: 1,
    color: theme.colors.text,
  },
  metaLabel: {
    color: theme.colors.textMuted,
  },
  mono: {
    ...theme.typography.mono,
    fontFamily: theme.fonts.mono,
    color: theme.colors.text,
  },
  section: {
    gap: theme.spacing.sm,
  },
  sectionLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSubtle,
    letterSpacing: 0.5,
  },
  badgeGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  actions: {
    gap: theme.spacing.sm,
    marginTop: theme.spacing.xs,
  },
  primaryButton: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primary,
  },
  primaryLabel: {
    ...theme.typography.label,
    color: theme.colors.onPrimary,
  },
  secondaryRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  secondaryButton: {
    flex: 1,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  secondaryLabel: {
    ...theme.typography.label,
    color: theme.colors.text,
  },
  disabled: {
    opacity: 0.5,
  },
}));
