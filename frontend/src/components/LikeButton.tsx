// Boton de "me gusta" con contador. Actualiza al instante (optimista) y si la API falla vuelve atras.
// Sin sesion manda al login y despues vuelve a la pagina donde estaba.
import { useEffect, useState, type MouseEvent } from "react";
import { useLocation, useNavigate } from "react-router";
import { useSession } from "../lib/auth-client";
import { recipesService } from "../services/recipes";
import type { LikeStatus } from "../types/recipe";

interface LikeButtonProps {
  recipeId: string;
  initial: LikeStatus;
  size?: "sm" | "md";
}

export const LikeButton = ({ recipeId, initial, size = "sm" }: LikeButtonProps) => {
  const { data: session } = useSession();
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState<LikeStatus>(initial);
  const [busy, setBusy] = useState(false);

  // Si la receta se vuelve a cargar (ej: despues de loguearse) se toma el estado nuevo.
  useEffect(() => setStatus(initial), [initial.likesCount, initial.likedByMe]);

  const toggle = async (event: MouseEvent<HTMLButtonElement>) => {
    // La tarjeta entera es un link: que el clic en el corazon no abra el detalle.
    event.preventDefault();
    event.stopPropagation();

    if (!session) {
      navigate("/login", { state: { from: location.pathname + location.search } });
      return;
    }
    if (busy) return;

    const previous = status;
    const liked = !status.likedByMe;
    setStatus({ likedByMe: liked, likesCount: status.likesCount + (liked ? 1 : -1) });
    setBusy(true);
    try {
      setStatus(liked ? await recipesService.like(recipeId) : await recipesService.unlike(recipeId));
    } catch {
      setStatus(previous);
    } finally {
      setBusy(false);
    }
  };

  const label = status.likedByMe ? "Quitar me gusta" : "Me gusta";
  const sizes = size === "md" ? "px-4 py-2 text-sm" : "px-2.5 py-1 text-xs";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={status.likedByMe}
      aria-label={`${label} (${status.likesCount})`}
      title={session ? label : "Iniciá sesión para dar me gusta"}
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium transition ${sizes} ${
        status.likedByMe
          ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
          : "border-slate-200 bg-white text-slate-600 hover:border-red-200 hover:text-red-600"
      }`}
    >
      <svg viewBox="0 0 24 24" className={size === "md" ? "h-5 w-5" : "h-4 w-4"} aria-hidden="true">
        <path
          d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.9 4.5c2.1 0 3.6 1.1 5.1 3 1.5-1.9 3-3 5.1-3 3.9 0 6 3.9 4.5 7.3C19.5 16.4 12 21 12 21z"
          fill={status.likedByMe ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
      {status.likesCount}
    </button>
  );
};
