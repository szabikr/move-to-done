const { MongoClient } = require('mongodb')

const getDbClient = () => new MongoClient(process.env.DB_CONNECTION_STRING)

async function createCompletedTodo(completedTodo) {
  const client = getDbClient()

  try {
    await client.connect()
    const collection = client.db('todos-db').collection('completed-todos')

    const result = await collection.insertOne(completedTodo)

    return result.acknowledged
  } catch (err) {
    console.log(err)
    return err
  } finally {
    await client.close()
  }
}

module.exports = {
  createCompletedTodo,
}
