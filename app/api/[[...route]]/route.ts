// import { Hono } from "hono";
// import { env } from "hono/adapter";
// import { cors } from "hono/cors";

// import { performance } from 'perf_hooks';


// import { Redis } from '@upstash/redis'
// import { handle } from "hono/vercel";

// const app = new Hono().basePath('/api');

// type EnvConfig = {
//     UPSTASH_REDIS_REST_TOKEN: string;
//     UPSTASH_REDIS_REST_URL: string;
// }

// app.use('/*', cors());

// const MAX_SEARCHES = 20;
// const TIME_PERIOD:number = 10 * 60 * 1000;
// const count=0;

// const routes = app.get("/search", async (c) => {
//     try {
//         const { UPSTASH_REDIS_REST_TOKEN, UPSTASH_REDIS_REST_URL } = env<EnvConfig>(c);



//         const redis = new Redis({
//             token: UPSTASH_REDIS_REST_TOKEN,
//             url: UPSTASH_REDIS_REST_URL,
//         });

//         const start = performance.now();

//         const query = c.req.query('q')?.toUpperCase();

//         const header=c.req.header();

//         const headerId=(header['x-forwarded-for'])

//         const userKey = `search:${headerId}`;
        
//         const key=`${userKey}:request_count`

//         const requestCount=await redis.incr(key)

//         if(requestCount===1){

//             await redis.expire(key,300)
//         }

//         const remainingTime= await redis.ttl(key)

//         if(requestCount>80){
//             return c.json({ message: `Too many searches. Please wait${remainingTime}  seconds.` }, { status: 429 });
//         }
//         if (!query) {
//             return c.json({ message: 'Invalid search query' }, { status: 400 });
//         }
        
        

//         const res = []

//         const rank = await redis.zrank('2terms', query)
//         console.log(rank)


//         if (rank !== null && rank !== undefined) {
//             const temp = await redis.zrange<string[]>('2terms', rank, rank + 100)

//             for (const el of temp) {
//                 if (!el.startsWith(query)) {
//                     break
//                 }

//                 if (el.endsWith('*')) {
//                     res.push(el.substring(0, el.length - 1))
//                 }
//             }
//         }
//         const end = performance.now();

//         return c.json({
//             results: res,
//             duration: end - start,
//         })
//     } catch (err) {
//         console.error(err)

//         return c.json(

//             {
//                 status: 500,
//             }
//         )
//     }
// });

// export const GET = handle(app);
// export type AppType = typeof routes;


























import { Hono } from "hono";
import { env } from "hono/adapter";
import { cors } from "hono/cors";
import { Redis } from '@upstash/redis'
import { performance } from 'perf_hooks';
import Trie from 'trie-search';
import { handle } from "hono/vercel";
import { allCities, countryList } from "@/lib/city";

const app = new Hono().basePath('/api');

type EnvConfig = {
    UPSTASH_REDIS_REST_TOKEN: string;
    UPSTASH_REDIS_REST_URL: string;
}


app.use('/*', cors());

const trie = new Trie('name'); 
allCities.forEach((country, index) => {
    trie.add({ name: country.city, index }); 
});

const routes = app.get("/search", async (c) => {
    try {
        const { UPSTASH_REDIS_REST_TOKEN, UPSTASH_REDIS_REST_URL } = env<EnvConfig>(c);



        const redis = new Redis({
            token: UPSTASH_REDIS_REST_TOKEN,
            url: UPSTASH_REDIS_REST_URL,
        });
        const start = performance.now();
        const query = c.req.query('q');
 const header=c.req.header();

        const headerId=(header['x-forwarded-for'])

        const userKey = `search:${headerId}`;
        
        const key=`${userKey}:request_count`

        const requestCount=await redis.incr(key)

        if(requestCount===1){

            await redis.expire(key,300)
        }

        const remainingTime= await redis.ttl(key)

        if(requestCount>80){
            return c.json({ message: `Too many searches. Please wait${remainingTime}  seconds.` }, { status: 429 });
        }
        if (!query) {
            return c.json({ message: 'Invalid search query' }, { status: 400 });
        }
        console.log("Search Query:", query);
        const searchResults = trie.get(query) || [];
      
        const resultNames: string[] = (searchResults as { name: string }[]).map(result => result.name);


        const end = performance.now();

        return c.json({
            results: resultNames,
            duration: end - start,
        })
    } catch (err) {
        console.error(err)
        return c.json({ status: 500 });
    }
});

export const GET = handle(app);
export type AppType = typeof routes;

