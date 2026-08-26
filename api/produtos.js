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
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const client = await getClient();
    const db = client.db('catalogo');
    const collection = db.collection('produtos');

    if (req.method === 'GET') {
      // Listar produtos
      const produtos = await collection.find({}).toArray();
      return res.status(200).json(produtos);
    }

    if (req.method === 'POST') {
      // Adicionar produto
      const produto = {
        ...req.body,
        createdAt: new Date().toISOString()
      };
      const result = await collection.insertOne(produto);
      return res.status(201).json({ ...produto, id: result.insertedId });
    }

    return res.status(405).json({ error: 'Método não permitido' });
  } catch (error) {
    console.error('Erro:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}
