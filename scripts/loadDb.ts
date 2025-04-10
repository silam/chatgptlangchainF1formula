import {DataAPIClient} from "@datastax/astra-db-ts"
import { PuppeteerWebBaseLoader } from "@langchain/community/document_loaders/web/puppeteer";
import OpenAI from "openai"

import "dotenv/config" 

import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters"


type SimilarityMetric = "dot_product" | // 50% faster than cosine
                        "cosine" | // how similar
                        "euclidean" // intuitive, most used
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

const f1Data = [
    'https://en.wikipedia.org/wiki/2024_Formula_One_World_Championship',
    'https://www.skysports.com/f1/news/12433/13339705/f1-team-mate-head-to-head-qualifying-race-sprint-latest-scores-results-from-2025-season',
    'https://en.wikipedia.org/wiki/2023_Las_Vegas_Grand_Prix#:~:text=The%202023%20Las%20Vegas%20Grand%20Prix%20%28officially%20known,Vegas%20Strip%20Circuit%20in%20Paradise%2C%20Nevada%2C%20United%20States.'
]

const client = new DataAPIClient(ASTRA_DB_KEY)

const db = client.db(ASTRA_DB_API_ENDPOINT, {
    namespace: ASTRA_DB_NAMESPACE
})

const splitter = new RecursiveCharacterTextSplitter(
    {
        chunkSize: 512,
        chunkOverlap: 100
    }
)

const createCollection = async(similarityMetric: SimilarityMetric = 'dot_product') => {
    const res = await db.createCollection(ASTRA_DB_COLLECTION,
        {
            vector: {
                dimension: 1536, // text-dimension
                metric: similarityMetric
            } 
        }
    )

    console.log(res)
}


const loadSampleData = async() => {
    const collection = await db.collection(ASTRA_DB_COLLECTION)

    for await (const url of f1Data)
    {
        const content = await scrapePage(url)

        const chunks = await splitter.splitText(content)

        for await ( const chunk of chunks)
        {
            const embedding = await openai.embeddings.create(
                {
                    model: "text-embedding-3-small",
                    input : chunk,
                    encoding_format: "float"
                }
            )

            const vector = embedding.data[0].embedding

            const res =  await collection.insertOne(
                {
                    $vector: vector,
                    text: chunk
                }
            );

            console.log(res)
        }
    }
}

const scrapePage = async(url: string) => {
    const loader = new PuppeteerWebBaseLoader(url, {
        launchOptions: {
            headless: true
        },
        gotoOptions: {
            waitUntil: "domcontentloaded"
        },
        evaluate: async(page, browser) => {
            const result = await page.evaluate(()=> 
                document.body.innerHTML 
            )

            await browser.close()

            return result
        }
    })

    return ( await loader.scrape())?.replace(/<[^>]*>?/gm, '')


}

createCollection().then(() => {
    loadSampleData()
})