export default function PendingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold text-yellow-600 mb-4">
        Pago pendiente
      </h1>
      <p className="mb-2">Tu pago está siendo procesado.</p>
      <p>Te notificaremos cuando se confirme la transacción.</p>
    </div>
  );
}
