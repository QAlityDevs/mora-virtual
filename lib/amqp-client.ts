import amqp from 'amqplib';

// Estas variables se declaran fuera de la función exportada.
// En un entorno serverless como Vercel, estas variables persisten en memoria
// entre las invocaciones "cálidas" de la función.
let connection: amqp.Connection | null = null;
let channel: amqp.Channel | null = null;

/**
 * Obtiene un canal de comunicación con RabbitMQ usando un patrón Singleton.
 * Si ya existe una conexión y un canal, los reutiliza. Si no, los crea.
 * * @returns {Promise<amqp.Channel>} Una promesa que se resuelve con el canal de AMQP.
 */
export async function getAmqpChannel(): Promise<amqp.Channel> {
  // Si el canal ya existe y está disponible, lo devolvemos inmediatamente.
  // Esta es la ruta más rápida y la que se tomará en la mayoría de las solicitudes.
  if (channel) {
    return channel;
  }

  try {
    const amqpUrl = process.env.CLOUDAMQP_URL;
    if (!amqpUrl) {
      throw new Error("La variable de entorno CLOUDAMQP_URL no está definida.");
    }

    // --- Esta parte solo se ejecuta en un "arranque en frío" o si la conexión se pierde ---
    
    console.log('Estableciendo nueva conexión con RabbitMQ...');
    
    // 1. Conectar con el servidor de RabbitMQ.
    connection = await amqp.connect(amqpUrl);

    // 2. Añadir listeners para manejar errores o cierres inesperados.
    // Esto es crucial para la resiliencia del sistema.
    connection.on('error', (err) => {
      console.error('Error en la conexión de RabbitMQ:', err.message);
      // Al poner las variables en null, forzamos una reconexión en la próxima solicitud.
      connection = null;
      channel = null;
    });

    connection.on('close', () => {
      console.warn('La conexión de RabbitMQ se ha cerrado.');
      connection = null;
      channel = null;
    });
    
    // 3. Crear un canal sobre la conexión.
    channel = await connection.createChannel();
    console.log('Canal de RabbitMQ creado y listo para usar.');
    
    return channel;

  } catch (error) {
    console.error("Falló al conectar o crear el canal de RabbitMQ:", error);
    // Nos aseguramos de que las variables queden nulas si la conexión inicial falla.
    connection = null;
    channel = null;
    // Relanzamos el error para que el endpoint que llamó a esta función sepa que algo salió mal.
    throw error;
  }
}