import { Landing } from "@/features/landing/landing"

export function App() {
  return (
    <main className="min-h-dvh">
      <Landing aoComecar={() => console.log("começar")} />
    </main>
  )
}
