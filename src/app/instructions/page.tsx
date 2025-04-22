'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function InstructionsPage() {
  return (
    <div className="container mx-auto p-4">
      <h1>Instructions for Food</h1>
      <p>This page will provide instructions for preparing and enjoying specific food items.</p>

      {/* Add more content here as needed */}
      <Link href="/theme">
        <Button variant="outline">Switch to Previous Mode</Button>
      </Link>
    </div>
  );
}
