import { registerBones } from 'boneyard-js/react';

import bones from './bones/world-card.bones.json';
import { BoneyardDemoContent } from './boneyard-demo-content';

registerBones({ 'world-card': bones });

export function BoneyardDemo() {
  return <BoneyardDemoContent />;
}
