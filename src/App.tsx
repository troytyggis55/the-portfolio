import {useState} from 'react'
import './App.css'
import Test from './test.mdx'

function App() {
    const [count, setCount] = useState(0)

    return (
        <>
            
            <header className="h-24 sm:h-header fixed top-0 left-0 w-full shadow-lg z-50 flex justify-center bg-linear-to-b from-accent/10 to-transparent border-b border-accent/40 backdrop-blur-2xl">
                <div className="flex flex-col gap-1 w-app p-8 justify-center">
                    <span className="text-4xl font-semibold">Trygve Jørgensen</span>
                    <span className="text-xl">Utvikler og Student</span>
                </div>
            </header>
            <div className="h-24 sm:h-header"></div>
            
            <Test/>
            <Test/>
            <Test/>
            <Test/>
            <div>
                <button onClick={() => setCount((count) => count + 1)}>
                    count is {count}
                </button>
                <p>
                    Edit <code>src/App.tsx</code> and save to test HMR
                </p>
            </div>
        </>
    )
}

export default App
