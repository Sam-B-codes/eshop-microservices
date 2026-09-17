"use client";

import {
  useState,
} from "react";

import {
  Loader2,
  MessageCircle,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  createUserConversation,
} from "@/services/chat.service";

interface ContactSellerButtonProps {
  orderId: string;
  sellerId: string;
  disabled?: boolean;
}

export default function ContactSellerButton({
  orderId,
  sellerId,
  disabled = false,
}: ContactSellerButtonProps) {
  const router =
    useRouter();

  const [
    opening,
    setOpening,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const openConversation =
    async () => {
      if (
        disabled ||
        opening
      ) {
        return;
      }

      try {
        setOpening(true);
        setError("");

        const response =
          await createUserConversation({
            orderId,
            sellerId,
          });

        router.push(
          `/profile/messages?conversation=${encodeURIComponent(
            response
              .conversation
              .id
          )}`
        );
      } catch (
        conversationError
      ) {
        console.error(
          "Unable to open conversation:",
          conversationError
        );

        setError(
          conversationError instanceof
            Error
            ? conversationError.message
            : "Unable to contact this seller."
        );
      } finally {
        setOpening(false);
      }
    };

  return (
    <div>
      <button
        type="button"
        onClick={() =>
          void openConversation()
        }
        disabled={
          disabled ||
          opening
        }
        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-black/[0.08] bg-white px-4 text-xs font-semibold text-neutral-700 transition hover:border-black/[0.14] hover:bg-[#f7f5f1] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {opening ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <MessageCircle
            className="h-4 w-4"
            strokeWidth={1.8}
          />
        )}

        {opening
          ? "Opening..."
          : "Contact seller"}
      </button>

      {error && (
        <p className="mt-2 max-w-[220px] text-xs leading-5 text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}