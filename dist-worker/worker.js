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
const amqp = __importStar(require("amqplib"));
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({
    path: path_1.default.resolve(__dirname, '../.env.local'), // Ajusta el path si tu .env está en el root
});
// Supabase
const supabase = (0, supabase_js_1.createClient)(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
// Worker principal
async function startWorker() {
    try {
        const amqpUrl = process.env.CLOUDAMQP_URL;
        const connection = await amqp.connect(amqpUrl);
        const channel = await connection.createChannel();
        const queueName = `queue_event_${process.env.QUEUE_NAME}`;
        await channel.assertQueue(queueName, { durable: true });
        console.log(`🟢 Escuchando cola: ${queueName}`);
        channel.consume(queueName, async (msg) => {
            if (msg !== null) {
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
                    // Verificar si ya existe en la cola
                    const { data: existingEntry } = await supabase
                        .from('queue')
                        .select('id')
                        .eq('user_id', userId)
                        .eq('event_id', eventId)
                        .maybeSingle();
                    if (existingEntry) {
                        console.log(`⚠️ Usuario ya estaba en la cola: ${userId}`);
                        channel.ack(msg);
                        return;
                    }
                    // Insertar directamente (posición implícita por orden de llegada)
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
                    console.log(`✅ Usuario ${userId} agregado a la cola`);
                    channel.ack(msg);
                }
                catch (err) {
                    console.error('❌ Error procesando mensaje:', err);
                    // Si falla, no hacer ack => puede reintentarse
                }
            }
        }, {
            noAck: false,
        });
    }
    catch (err) {
        console.error('❌ Error al iniciar el worker:', err);
    }
}
startWorker();
