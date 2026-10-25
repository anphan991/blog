'use client';

import dynamic from 'next/dynamic';

const BrainrotSuite = dynamic(() => import('@/components/BrainrotSuite'), {
  ssr: false,
});

export default function BrainrotLoader() {
  return <BrainrotSuite />;
}
