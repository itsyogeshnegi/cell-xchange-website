import { store } from "@/lib/store";

export default function WhatsAppButton() {
  return <a href={store.whatsappUrl} target="_blank" rel="noreferrer" aria-label="Chat with cell.xchange on WhatsApp" className="group fixed bottom-5 right-5 z-[60] flex h-14 items-center justify-center rounded-full bg-[#25D366] px-4 text-white shadow-[0_12px_35px_rgba(0,0,0,.22)] transition hover:-translate-y-1 hover:bg-[#20bd5a] sm:bottom-7 sm:right-7">
    <svg aria-hidden="true" viewBox="0 0 32 32" className="h-7 w-7 fill-current"><path d="M16.04 3C8.84 3 3 8.73 3 15.8c0 2.25.6 4.45 1.74 6.37L3 28.5l6.58-1.69a13.18 13.18 0 0 0 6.46 1.65C23.24 28.46 29 22.74 29 15.8 29 8.73 23.24 3 16.04 3Zm0 23.3c-2.02 0-4-.53-5.72-1.54l-.41-.24-3.91 1 1.04-3.73-.27-.42a10.52 10.52 0 0 1-1.63-5.57c0-5.87 4.88-10.64 10.9-10.64 6 0 10.82 4.77 10.82 10.64 0 5.8-4.82 10.5-10.82 10.5Zm5.98-7.86c-.33-.16-1.95-.94-2.25-1.05-.3-.1-.52-.16-.74.16-.22.32-.85 1.05-1.04 1.26-.19.22-.38.24-.71.08-.33-.16-1.39-.5-2.65-1.6a9.83 9.83 0 0 1-1.84-2.24c-.19-.32-.02-.5.14-.66.15-.14.33-.37.49-.56.17-.18.22-.32.33-.53.11-.21.05-.4-.03-.56-.08-.16-.74-1.74-1.01-2.38-.27-.64-.54-.55-.74-.56h-.63c-.22 0-.57.08-.88.4-.3.32-1.15 1.1-1.15 2.67 0 1.58 1.18 3.1 1.34 3.31.17.21 2.32 3.46 5.62 4.85.79.33 1.4.53 1.88.68.79.24 1.5.21 2.07.13.63-.09 1.95-.78 2.22-1.53.28-.75.28-1.39.2-1.53-.08-.13-.3-.21-.63-.37Z"/></svg>
    <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-bold opacity-0 transition-all duration-300 group-hover:ml-2 group-hover:max-w-36 group-hover:opacity-100">WhatsApp us</span>
  </a>;
}
