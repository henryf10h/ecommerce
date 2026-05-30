'use client';
import { VERSION } from '@app/core';
import OnchainStore from '../components/OnchainStore';

export default function Page() {
  return (
    <>
      <OnchainStore />
      <div className="fixed bottom-1 right-1 z-50 text-[8px] text-gray-400">
        v{VERSION}
      </div>
    </>
  );
}
