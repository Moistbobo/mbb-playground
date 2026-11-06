import { registerBones } from 'boneyard-js/native';

import bones from './bones/world-card.bones.json';
import { BoneyardDemoContent } from './boneyard-demo-content';

// Recapture with `pnpm exec boneyard-js build --native` while the app is open on this screen.
registerBones({ 'world-card': bones });

export function BoneyardDemo() {
  return <BoneyardDemoContent />;
}
