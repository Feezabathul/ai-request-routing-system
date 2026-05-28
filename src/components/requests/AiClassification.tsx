import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export interface ClassificationProps {
  classification?: {
    predictedCategory: string;
    confidenceScore: number;
    suggestedPriority: string;
    processingStatus: 'PROCESSING' | 'COMPLETED' | 'FAILED';
    processingTimeMs?: number;
  };
  onRetry?: () => void;
}

/**
 * Displays AI classification result with loading and error states.
 */
export const AiClassification: React.FC<ClassificationProps> = ({ classification, onRetry }) => {
  if (!classification) {
    return (
      <Card className="bg-white bg-opacity-10 backdrop-blur-sm border border-white/20 p-4">
        <p className="text-gray-300">Waiting for AI classification...</p>
      </Card>
    );
  }

  const { predictedCategory, confidenceScore, suggestedPriority, processingStatus, processingTimeMs } = classification;

  if (processingStatus === 'FAILED') {
    return (
      <Card className="bg-white bg-opacity-10 backdrop-blur-sm border border-white/20 p-4">
        <p className="mb-2 text-red-400">AI classification failed.</p>
        {onRetry && (
          <Button variant="outline" onClick={onRetry}>
            Retry
          </Button>
        )}
      </Card>
    );
  }

  return (
    <Card className="bg-white bg-opacity-10 backdrop-blur-sm border border-white/20 p-4">
      <h3 className="mb-2 text-lg font-medium text-white">AI Classification</h3>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="text-sm text-gray-300">Category</p>
          <Badge variant="status" className="mt-1">
            {predictedCategory}
          </Badge>
        </div>
        <div>
          <p className="text-sm text-gray-300">Confidence</p>
          <p className="mt-1 text-white">{(confidenceScore * 100).toFixed(1)}%</p>
        </div>
        <div>
          <p className="text-sm text-gray-300">Suggested Priority</p>
          <Badge variant="priority" className="mt-1">
            {suggestedPriority}
          </Badge>
        </div>
        <div>
          <p className="text-sm text-gray-300">Processing Time</p>
          <p className="mt-1 text-white">{processingTimeMs ? `${processingTimeMs} ms` : '—'}</p>
        </div>
      </div>
    </Card>
  );
};
