import type {
  ChatCounterpart,
  ChatLastMessage,
  ChatMessageSender,
} from "@/types/messaging";

type NameSource = ChatCounterpart | ChatMessageSender | null | undefined;

/** Nombre visible: "Nombre Apellido", o username, o el fallback dado. */
export function getDisplayName(
  source: NameSource,
  fallback = "Usuario"
): string {
  if (!source) return fallback;
  const full = [source.first_name, source.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();
  if (full) return full;
  if (source.username) return source.username;
  return fallback;
}

/** Iniciales para el avatar (máx. 2 letras). */
export function getInitials(
  source: NameSource,
  fallback = "Usuario"
): string {
  const name = getDisplayName(source, fallback);
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

/** Vista previa del último mensaje para la lista de chats. */
export function getLastMessagePreview(
  lastMessage: ChatLastMessage | null,
  labels: { noMessages: string; location: string }
): string {
  if (!lastMessage) return labels.noMessages;
  if (lastMessage.kind === "location") return `📍 ${labels.location}`;
  return lastMessage.body?.trim() || labels.noMessages;
}
