import "./global.css"

export const metadata = {
    title: "F1GPT",
    description: "The place to go for all Formula 1 questions"
}


const RouteLayOut = ({children}) => {
    return (
        <html lang="en">
            <body>
                {children}
            </body>
        </html>
    )
} 

export default RouteLayOut