export default function FailurePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold text-red-600 mb-4">Pago rechazado</h1>
      <p className="mb-2">Hubo un problema al procesar tu pago.</p>
      <p>Intenta nuevamente o utiliza otro método de pago.</p>
    </div>
  );
}
