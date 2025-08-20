export default function TypingDots() {
  return (
    <span className="inline-flex gap-1">
      <span className="size-2 rounded-full bg-zinc-400 animate-bounce [animation-delay:-0.2s]" />
      <span className="size-2 rounded-full bg-zinc-400 animate-bounce" />
      <span className="size-2 rounded-full bg-zinc-400 animate-bounce [animation-delay:0.2s]" />
    </span>
  )
}