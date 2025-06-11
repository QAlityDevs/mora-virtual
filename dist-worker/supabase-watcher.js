"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_js_1 = require("@supabase/supabase-js");
const cron_1 = require("cron");
const amqp = __importStar(require("amqplib"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({
    path: path_1.default.resolve(__dirname, '../.env.local'),
});
const supabase = (0, supabase_js_1.createClient)(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const jobs = new Map();
const activeWorkers = new Set();
// New maps to handle channels and connections per event
const channels = new Map();
const connections = new Map();
async function startWorker(eventId, retries = 3) {
    if (activeWorkers.has(eventId)) {
        console.log(`Worker already active for event ${eventId}`);
        return;
    }
    try {
        const amqpUrl = process.env.CLOUDAMQP_URL;
        const connection = await amqp.connect(amqpUrl);
        const channel = await connection.createChannel();
        const queueName = `queue_event_${eventId}`;
        await channel.assertQueue(queueName, { durable: true });
        console.log(`Listening to queue: ${queueName}`);
        activeWorkers.add(eventId);
        // Store channel and connection
        channels.set(eventId, channel);
        connections.set(eventId, connection);
        channel.consume(queueName, async (msg) => {
            if (!msg)
                return;
            try {
                const { eventId, userId, token } = JSON.parse(msg.content.toString());
                const { data: lastEntry, error: lastError } = await supabase
                    .from('queue')
                    .select('position')
                    .eq('event_id', eventId)
                    .order('position', { ascending: false })
                    .limit(1)
                    .maybeSingle();
                if (lastError)
                    throw lastError;
                const newPosition = lastEntry ? lastEntry.position + 1 : 1;
                const { data: existing } = await supabase
                    .from('queue')
                    .select('id')
                    .eq('user_id', userId)
                    .eq('event_id', eventId)
                    .maybeSingle();
                if (existing) {
                    console.log(`User already in queue: ${userId}`);
                    channel.ack(msg);
                    return;
                }
                const { error: insertError } = await supabase.from('queue').insert([
                    {
                        event_id: eventId,
                        user_id: userId,
                        token,
                        status: 'waiting',
                        position: newPosition,
                    },
                ]);
                if (insertError)
                    throw insertError;
                console.log(`User ${userId} added to queue`);
                channel.ack(msg);
            }
            catch (err) {
                console.error('Error processing message:', err);
            }
        }, { noAck: false });
    }
    catch (err) {
        console.error(`Error starting worker for ${eventId}:`, err);
        if (retries > 0) {
            console.log(`Retrying to start worker for ${eventId}...`);
            setTimeout(() => startWorker(eventId, retries - 1), 5000);
        }
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
