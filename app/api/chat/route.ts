import OpenAI from "openai"
import {OpenAIStream, StreamingTextResponse} from "ai"

import {DataAPIClient} from "@datastax/astra-db-ts"

const { 
    ASTRA_DB_NAMESPACE, 
    ASTRA_DB_COLLECTION, 
    ASTRA_DB_API_ENDPOINT, 
    OPENAI_KEY ,
    ASTRA_DB_KEY
} = process.env

const openai = new OpenAI({
    apiKey: OPENAI_KEY
})

const client = new DataAPIClient(ASTRA_DB_KEY)

const db = client.db(ASTRA_DB_API_ENDPOINT, {
    namespace: ASTRA_DB_NAMESPACE
})

export async function Post(req: Request) {
    try {
        const {messages} = await req.json()
        const latestMessage = messages[messages.length - 1]?.content
        let docContent = ""

        const embedding = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: latestMessage,
            encoding_format: "float"
        })

        try {
            const collection  = await db.collection(ASTRA_DB_COLLECTION)
            const cursor = collection.find(null, {
                sort: {
                    $vector: embedding.data[0].embedding,

                },
                limit: 10
            })
            const docs = await cursor.toArray()
            const docMap = docs?.map(doc => doc.text)
            docContent = JSON.stringify(docMap)
        }  
        catch (err)
        {
            console.log("Error queriry")
        }

        const template = {
            role: "system",
            content: `
                You are an AI assistant who knows all about Formula 1.
                ---------
                Start Context
                ${docContent}
                End Context
                ---------

                Question: ${latestMessage}

                ---------

            `
        }

        const res = await openai.chat.completions.create(
            {
                model: 'gpt-4',
                stream: true,
                messages: [template, ...message]
            }
        )

        const stream = OpenAIStream(response)
        return new StreamingTextResponse(stream)
    }
    catch (err)
    {
        console.log("Error db")
    }


}