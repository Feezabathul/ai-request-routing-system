import { Suspense } from 'react';
import RequestsPageContent from './RequestsPageContent';

function RequestsLoading() {
  return (
    <section className="max-w-7xl mx-auto p-4">
      <p className="text-sm text-gray-500">Loading requests...</p>
    </section>
  );
}

export default function RequestsPage() {
  return (
    <Suspense fallback={<RequestsLoading />}>
      <RequestsPageContent />
    </Suspense>
  );
}
