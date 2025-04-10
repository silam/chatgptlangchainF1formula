import PromptSuggestionButton from "./PromptSuggestionButton"

const SuggestionsRow = (onPromptClick) => {
    const prompts = [
        "Who is the head of racing for Aston Martin's F1 Academy team?",
        "Who is the highest paid F1 driver",
        "Who will be the newest driver for Ferrari?",
        "Who is the current Formula ONe World Driver's Champions"
    ]

    return (
        <div className="prompt-suggestion-row">
            {prompts.map((prompt, index)=>
                <PromptSuggestionButton 
                    key={`suggestion-${index}`}
                    text={prompt}
                    onClick={()=>onPromptClick(prompt)}>
                    {prompt}
                </PromptSuggestionButton>
            )}

        </div>
    )
}

export default SuggestionsRow