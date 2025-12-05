'use client';

export default function PredictionDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">Prediction Details</h1>
      <p>Viewing prediction: {params.id}</p>
      <p className="text-gray-600 mt-4">This page is under construction.</p>
    </div>
  );
}
