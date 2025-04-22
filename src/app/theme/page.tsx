'use client';

import {useRouter} from 'next/navigation';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Label} from '@/components/ui/label';
import {Checkbox} from '@/components/ui/checkbox';
import Link from 'next/link';

export default function ThemePage() {
  const router = useRouter();

  return (
    <div className="blue-black-theme container mx-auto p-4 transition-colors duration-500">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>New Theme</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="flex items-center space-x-2">
              <Label htmlFor="protein">Protein Checkbox</Label>
              <Checkbox id="protein" />
            </div>
            <Link href="/">
              <Button variant="outline">Switch to Previous Mode</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
