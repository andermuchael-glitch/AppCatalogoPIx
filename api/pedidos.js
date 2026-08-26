import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
let client = null;

async function getClient() {
  if (!uri) throw new Error('MONGODB_URI não configurada');
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
  }
  return client;
}

function normalizarPedido(doc) {
  return { ...doc, id: doc._id?.toString?.() || doc.id, _id: doc._id?.toString?.() || doc._id };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const mongo = await getClient();
    const collection = mongo.db('catalogo').collection('pedidos');

    if (req.method === 'POST') {
      const { clienteId = null, itens, total } = req.body || {};
      const valor = Number(total);
      if (!Array.isArray(itens) || itens.length === 0 || !Number.isFinite(valor) || valor < 0) {
        return res.status(400).json({ error: 'Itens e total válido são obrigatórios' });
      }
      const pedido = { clienteId, itens, total: valor, status: 'PENDING', pix: { status: 'pending' }, createdAt: new Date().toISOString() };
      const result = await collection.insertOne(pedido);
      return res.status(201).json(normalizarPedido({ ...pedido, _id: result.insertedId }));
    }

    if (req.method === 'GET') {
      const pedidos = await collection.find({}).sort({ createdAt: -1 }).toArray();
      return res.status(200).json(pedidos.map(normalizarPedido));
    }

    return res.status(405).json({ error: 'Método não permitido' });
  } catch (error) {
    console.error('Erro:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}
