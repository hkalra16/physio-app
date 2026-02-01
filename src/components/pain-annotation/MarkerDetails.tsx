'use client';

import { usePainStore } from '@/store/painStore';
import { getMusclesForRegion } from '@/data/muscle-map';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit2, X } from 'lucide-react';

const painTypeLabels = {
  point: 'Point Pain',
  radiating: 'Radiating',
  diffuse: 'Diffuse',
  referred: 'Referred'
};

export default function MarkerDetails() {
  const { currentSession, selectedMarkerId, selectMarker, removePainMarker, startEditingMarker } = usePainStore();

  const selectedMarker = currentSession?.painMarkers.find(m => m.id === selectedMarkerId);

  if (!selectedMarker) {
    return null;
  }

  const muscles = getMusclesForRegion(selectedMarker.region);

  const handleDelete = () => {
    removePainMarker(selectedMarker.id);
  };

  const handleEdit = () => {
    startEditingMarker(selectedMarker.id);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Pain Point Details</CardTitle>
          <Button variant="ghost" size="icon" onClick={() => selectMarker(null)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Region */}
        <div>
          <p className="text-sm text-gray-500">Location</p>
          <p className="font-medium capitalize">{selectedMarker.region.replace(/-/g, ' ')}</p>
        </div>

        {/* Pain Type & Intensity */}
        <div className="flex gap-4">
          <div>
            <p className="text-sm text-gray-500">Type</p>
            <Badge variant="outline">{painTypeLabels[selectedMarker.painType]}</Badge>
          </div>
          <div>
            <p className="text-sm text-gray-500">Intensity</p>
            <Badge
              className={
                selectedMarker.intensity >= 7
                  ? 'bg-red-500'
                  : selectedMarker.intensity >= 4
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
              }
            >
              {selectedMarker.intensity}/10
            </Badge>
          </div>
        </div>

        {/* Notes */}
        {selectedMarker.notes && (
          <div>
            <p className="text-sm text-gray-500">Notes</p>
            <p className="text-sm italic">{selectedMarker.notes}</p>
          </div>
        )}

        {/* Images */}
        {selectedMarker.images && selectedMarker.images.length > 0 && (
          <div>
            <p className="text-sm text-gray-500 mb-2">Photos</p>
            <div className="flex flex-wrap gap-2">
              {selectedMarker.images.map((img, index) => (
                <img
                  key={index}
                  src={img.previewUrl}
                  alt={`Pain location ${index + 1}`}
                  className="h-16 w-16 object-cover rounded-lg border"
                />
              ))}
            </div>
          </div>
        )}

        {/* Affected Muscles */}
        {muscles && (
          <div>
            <p className="text-sm text-gray-500 mb-1">Likely Affected Muscles</p>
            <div className="flex flex-wrap gap-1">
              {muscles.primary.slice(0, 3).map(m => (
                <Badge key={m} className="bg-blue-100 text-blue-700 text-xs">
                  {m}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button variant="outline" size="sm" className="flex-1" onClick={handleEdit}>
            <Edit2 className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button variant="destructive" size="sm" className="flex-1" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-1" />
            Remove
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
