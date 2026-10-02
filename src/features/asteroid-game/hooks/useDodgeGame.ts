import { useCallback, useEffect, useMemo, useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import { Gesture } from 'react-native-gesture-handler';
import {
  useAnimatedReaction,
  useFrameCallback,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN, scheduleOnUI } from 'react-native-worklets';

import { rectsOverlap } from '../collision';
import {
  ASTEROID_SIZE,
  ASTEROID_SPEED,
  ASTEROID_SPEED_JITTER,
  MAX_FRAME_DT_MS,
  POOL_SIZE,
  SHIP_BOTTOM_OFFSET,
  SHIP_HEIGHT,
  SHIP_WIDTH,
  SPAWN_INTERVAL_MS,
  WIN_TIME_MS,
} from '../constants';

export type GameStatus = 'idle' | 'playing' | 'over' | 'won';

export type AsteroidSlot = {
  active: boolean;
  x: number;
  y: number;
  speed: number;
};

export type World = {
  status: GameStatus;
  width: number;
  height: number;
  bottomInset: number;
  shipX: number;
  spawnCooldownMs: number;
  elapsedMs: number;
  asteroids: AsteroidSlot[];
};

function clamp(value: number, min: number, max: number): number {
  'worklet';
  return Math.min(Math.max(value, min), max);
}

function createWorld(): World {
  'worklet';
  return {
    status: 'idle',
    width: 0,
    height: 0,
    bottomInset: 0,
    shipX: 0,
    spawnCooldownMs: SPAWN_INTERVAL_MS,
    elapsedMs: 0,
    asteroids: Array.from({ length: POOL_SIZE }, () => ({
      active: false,
      x: 0,
      y: 0,
      speed: 0,
    })),
  };
}

function spawnAsteroid(w: World): void {
  'worklet';
  const slot = w.asteroids.find((asteroid) => !asteroid.active);
  if (slot === undefined) {
    return;
  }
  slot.active = true;
  slot.x = Math.random() * (w.width - ASTEROID_SIZE);
  slot.y = -ASTEROID_SIZE;
  slot.speed = ASTEROID_SPEED + (Math.random() * 2 - 1) * ASTEROID_SPEED_JITTER;
}

function stepWorld(w: World, dtMs: number): void {
  'worklet';
  w.elapsedMs += dtMs;
  w.spawnCooldownMs -= dtMs;
  if (w.spawnCooldownMs <= 0) {
    spawnAsteroid(w);
    w.spawnCooldownMs = SPAWN_INTERVAL_MS;
  }

  const ship = {
    x: w.shipX,
    y: w.height - SHIP_BOTTOM_OFFSET - SHIP_HEIGHT - w.bottomInset,
    width: SHIP_WIDTH,
    height: SHIP_HEIGHT,
  };

  for (const asteroid of w.asteroids) {
    if (!asteroid.active) {
      continue;
    }
    asteroid.y += (asteroid.speed * dtMs) / 1000;
    if (asteroid.y > w.height) {
      asteroid.active = false;
      continue;
    }
    const box = {
      x: asteroid.x,
      y: asteroid.y,
      width: ASTEROID_SIZE,
      height: ASTEROID_SIZE,
    };
    if (rectsOverlap(ship, box)) {
      w.status = 'over';
      return;
    }
  }

  if (w.elapsedMs >= WIN_TIME_MS) {
    w.status = 'won';
  }
}

function resetWorld(w: World): World {
  'worklet';
  w.status = 'playing';
  for (const asteroid of w.asteroids) {
    asteroid.active = false;
  }
  w.shipX = (w.width - SHIP_WIDTH) / 2;
  w.spawnCooldownMs = SPAWN_INTERVAL_MS;
  w.elapsedMs = 0;
  return w;
}

export function useDodgeGame(bottomInset: number): {
  world: SharedValue<World>;
  status: GameStatus;
  panGesture: ReturnType<typeof Gesture.Pan>;
  onLayout: (event: LayoutChangeEvent) => void;
  onStart: () => void;
  secondsLeft: number;
} {
  const world = useSharedValue<World>(createWorld());
  const [status, setStatus] = useState<GameStatus>('idle');
  const [secondsLeft, setSecondsLeft] = useState(WIN_TIME_MS / 1000);

  useEffect(() => {
    world.modify((value) => {
      'worklet';
      value.bottomInset = bottomInset;
      return value;
    });
  }, [world, bottomInset]);

  useFrameCallback((frameInfo) => {
    'worklet';
    const current = world.value;
    if (current.status !== 'playing' || current.width === 0) {
      return;
    }
    const dt = Math.min(frameInfo.timeSincePreviousFrame ?? 0, MAX_FRAME_DT_MS);
    world.modify((value) => {
      'worklet';
      stepWorld(value, dt);
      return value;
    });
  });

  const panGesture = useMemo(
    () =>
      Gesture.Pan().onChange((event) => {
        'worklet';
        world.modify((value) => {
          'worklet';
          if (value.width > 0 && value.status === 'playing') {
            value.shipX = clamp(value.shipX + event.changeX, 0, value.width - SHIP_WIDTH);
          }
          return value;
        });
      }),
    [world],
  );

  useAnimatedReaction(
    () => world.value.status,
    (next, previous) => {
      if (next !== previous) {
        scheduleOnRN(setStatus, next);
      }
    },
  );

  useAnimatedReaction(
    () => Math.ceil((WIN_TIME_MS - world.value.elapsedMs) / 1000),
    (next, previous) => {
      if (next !== previous) {
        scheduleOnRN(setSecondsLeft, next);
      }
    },
  );

  const onLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { width, height } = event.nativeEvent.layout;
      world.modify((value) => {
        'worklet';
        if (value.width !== 0) {
          return value;
        }
        return {
          ...value,
          width,
          height,
          shipX: (width - SHIP_WIDTH) / 2,
        };
      });
    },
    [world],
  );

  const onStart = useCallback(() => {
    scheduleOnUI(() => {
      'worklet';
      if (world.value.status === 'playing') {
        return;
      }
      world.modify(resetWorld);
    });
  }, [world]);

  return { world, status, panGesture, onLayout, onStart, secondsLeft };
}
