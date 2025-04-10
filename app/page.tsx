"use client"


import Image from "next/image"

import F1GPTLogo from "./assets/1993-f1-logo.jpg"

import {useChat} from "ai/react"

import { Message } from "ai"
import Bubble from "./components/Bubble"
import SuggestionsRow from "./components/PromptSuggestionsRow"
import LoadingBubble from "./components/LoadingBubble"
const Home = () =>{

    const {append, isLoading, messages, input, handleInputChange, handleSubmit} = useChat()
    const noMesage = !messages || messages.length = 0;

    const handlePrompt = (promptText)=>{
        const msg : Message {
            id: crypto.randomUUID(),
            content: promptText
            role: "user"
        }

        append(msg)

    }
    return (
        <main>
            <Image src={F1GPTLogo} width="250" alt="F1 GPT">

            </Image>

            <section>
                {noMesage ? (
                        <>
                            <p className="starter-text">
                                The Ultimate place for Formula One Super Fan!

                            </p>
                            <br/>
                            <SuggestionsRow onPromptClick={handlePrompt}/>
                        </>
                ) : (
                        <>
                            {messages.map(message, index) => 
                            <Bubble key={`message-${index}` message={message}>
                                </Bubble>}
                            {isLoading && <LoadingBubble></LoadingBubble>}
                        </>
                )}

                
            </section>
            <form onSubmit={handleSubmit}>
                    <input className="question-box"
                        onChange={handleInputChange}
                        value = {input}
                        placeholder="Place to enter text"/>
                    <input type="submit" />
            </form>
            
        </main>
    )
}

export default Home