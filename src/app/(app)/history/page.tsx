'use client';

import Image from 'next/image'; 
// image optimazation
import { useHistoryStore } from '@/store/history';
import { Card, CardContent } from '@/components/ui/card';
import { Sprout, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HistoryPage() {
  const { history, removeHistoryItem, clearHistory } = useHistoryStore();

  

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold font-headline">Identification History</h1>
        {history.length > 0 && (
            <Button variant="destructive" size="sm" onClick={clearHistory}>
              <Trash2 className="w-4 h-4 mr-2"/>
              Clear All
            </Button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="text-center text-muted-foreground mt-20 flex flex-col items-center gap-4">
          <Sprout className="w-16 h-16 text-secondary"/>
          <p>You haven&apos;t identified any plants yet.</p>
          <p className="text-sm">Your past discoveries will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4 flex items-center gap-4">
                <Image
                  src={item.imageUrl}
                  alt={item.plantName}
                  width={64}
                  height={64}
                  className="rounded-lg object-cover aspect-square"
                  data-ai-hint="plant leaf"
                />
                <div className="flex-1">
                  <p className="font-bold text-lg">{item.plantName}</p>
                  <p className="text-sm text-muted-foreground">{item.speciesName}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.timestamp}</p>
                </div>
                <Button variant="ghost" className='hover:bg-red-100' size="icon" onClick={() => removeHistoryItem(item.id)}>
                    <Trash2 className="w-5 h-5 text-destructive"/>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
