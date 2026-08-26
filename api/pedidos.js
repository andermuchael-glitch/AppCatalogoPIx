import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
let client = null;

async function getClient() {
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
  }
  return client;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const client = await getClient();
    const db = client.db('catalogo');
    const collection = db.collection('pedidos');

    if (req.method === 'POST') {
      const { clienteId, itens, total } = req.body;

      const pedido = {
        clienteId,
        itens,
        total,
        status: 'PENDING',
        pix: {
          qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${Date.now()}`,
          key: `pix-${Date.now()}`,
          status: 'pending'
        },
        createdAt: new Date().toISOString()
      };

      const result = await collection.insertOne(pedido);
      return res.status(201).json({ ...pedido, id: result.insertedId });
    }

    if (req.method === 'GET') {
      const pedidos = await collection.find({}).toArray();
      return res.status(200).json(pedidos);
    }

    return res.status(405).json({ error: 'Método não permitido' });
  } catch (error) {
    console.error('Erro:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}
