"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_js_1 = require("@supabase/supabase-js");
const cron_1 = require("cron");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const amqp_client_1 = require("../lib/amqp-client");
dotenv_1.default.config({
    path: path_1.default.resolve(__dirname, '../.env.local'),
});
const supabase = (0, supabase_js_1.createClient)(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY);
const jobs = new Map();
const activeWorkers = new Set();
// New maps to handle channels and connections per event
const channels = new Map();
const connections = new Map();
async function startWorker(eventId) {
    if (activeWorkers.has(eventId)) {
        console.log(`Worker para el evento ${eventId} ya está activo.`);
        return;
    }
    try {
        const channel = await (0, amqp_client_1.getAmqpChannel)(); // Usando el cliente Singleton
        const queueName = `queue_event_${eventId}`;
        await channel.assertQueue(queueName, { durable: true });
        activeWorkers.add(eventId);
        console.log(`Escuchando en la cola: ${queueName}`);
        channel.consume(queueName, async (msg) => {
            if (!msg)
                return;
            try {
                const { userId, eventId, queueToken } = JSON.parse(msg.content.toString());
                // --- (CAMBIO CLAVE): LA LÓGICA DEL WORKER AHORA ES MÁS SIMPLE ---
                // 1. Calcular la posición correcta y final
                const { data: lastEntry, error: lastError } = await supabase
                    .from('queue')
                    .select('position')
                    .eq('event_id', eventId)
                    .lt('position', 999999) // Ignoramos las posiciones temporales
                    .order('position', { ascending: false })
                    .limit(1)
                    .maybeSingle();
                if (lastError)
                    throw lastError;
                const finalPosition = lastEntry ? lastEntry.position + 1 : 1;
                // 2. Actualizar la fila que ya existe
                const { error: updateError } = await supabase
                    .from('queue')
                    .update({
                    position: finalPosition,
                    status: 'waiting' // Cambiamos el estado a 'waiting'
                })
                    .eq('token', queueToken); // Usamos el token para encontrar la fila
                if (updateError)
                    throw updateError;
                console.log(`Usuario ${userId} procesado. Posición asignada: ${finalPosition}`);
                channel.ack(msg);
            }
            catch (err) {
                console.error('Error procesando mensaje:', err);
                // Considera reenviar el mensaje (nack) si el error es recuperable
                channel.nack(msg, false, false); // false para no reencolar y evitar bucles infinitos
            }
        }, { noAck: false });
    }
    catch (err) {
        console.error(`Error iniciando el worker para ${eventId}:`, err);
    }
}
// New function to stop a worker and close resources
async function stopWorker(eventId) {
    try {
        const channel = channels.get(eventId);
        const connection = connections.get(eventId);
        const queueName = `queue_event_${eventId}`;
        if (channel) {
            await channel.deleteQueue(queueName);
            await channel.close();
            channels.delete(eventId);
        }
        if (connection) {
            await connection.close();
            connections.delete(eventId);
        }
        activeWorkers.delete(eventId);
        console.log(`Worker and connection closed for event ${eventId}`);
    }
    catch (err) {
        console.error(`Error closing worker for ${eventId}:`, err);
    }
}
function scheduleQueueCreation(eventId, startTime) {
    // If a job for this event already exists, stop and replace it
    if (jobs.has(eventId)) {
        jobs.get(eventId).stop();
        jobs.delete(eventId);
        console.log(`Updating cron job for event ${eventId}`);
    }
    const utcDate = new Date(startTime);
    utcDate.setMinutes(utcDate.getMinutes() - 10);
    if (isNaN(utcDate.getTime())) {
        console.error(`Invalid date for event ${eventId}: ${startTime}`);
        return;
    }
    if (utcDate.getTime() <= Date.now()) {
        console.log(`Event ${eventId} is already active or within 10-minute window. Starting worker immediately.`);
        startWorker(eventId);
        return;
    }
    const job = new cron_1.CronJob(utcDate, () => {
        console.log(`Launching worker for event ${eventId} at ${startTime}`);
        startWorker(eventId);
        job.stop();
        jobs.delete(eventId);
    }, null, true, 'Etc/UTC');
    job.start();
    jobs.set(eventId, job);
    console.log(`Cron job scheduled for event ${eventId} at ${utcDate.toISOString()}`);
}
async function initActiveEvents() {
    const { data, error } = await supabase
        .from('events')
        .select('id, sale_start_time, status')
        .eq('status', 'active');
    if (error) {
        console.error('Error loading active events:', error);
        return;
    }
    data?.forEach(event => {
        scheduleQueueCreation(event.id, event.sale_start_time);
    });
}
// Listener for changes in the `events` table
supabase
    .channel('events-db-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, async (payload) => {
    const newEvent = payload.new;
    const oldEvent = payload.old;
    // If event becomes active → schedule a worker
    if (newEvent?.status === 'active') {
        scheduleQueueCreation(newEvent.id, newEvent.sale_start_time);
    }
    // If event is no longer active → cancel cron and stop worker
    if (oldEvent && (!newEvent || newEvent.status !== 'active')) {
        if (jobs.has(oldEvent.id)) {
            jobs.get(oldEvent.id).stop();
            jobs.delete(oldEvent.id);
            console.log(`Cron job cancelled for event ${oldEvent.id}`);
        }
        if (activeWorkers.has(oldEvent.id)) {
            await stopWorker(oldEvent.id);
        }
    }
})
    .subscribe();
initActiveEvents();
