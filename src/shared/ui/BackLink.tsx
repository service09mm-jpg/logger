import Link from "next/link";
import { LinkPending } from "./LinkPending";

/**
 * Посилання «назад» у шапці екрана.
 *
 * `replace` тут принципове. Звичайне посилання **додає** запис в історію, і
 * тоді «назад» після натискання «назад» повертає юзера туди, звідки він щойно
 * пішов, — по цьому колу можна ходити нескінченно. `replace` натомість
 * **замінює** поточний запис: екран, з якого ми йдемо, зникає з історії, і стек
 * поводиться так, як у застосунку.
 *
 * Чому не `router.back()`, який справді знімає верхній запис: сторінку можна
 * відкрити й прямим посиланням, і тоді знімати нічого — юзер вилетів би із
 * застосунку. Явна адреса батьківського екрана працює однаково в обох випадках.
 */
export function BackLink({
  href,
  label,
}: {
  href: string;
  label: string;
}): React.ReactElement {
  return (
    <Link
      href={href}
      replace
      className="flex items-center gap-2 text-sm text-muted transition duration-100 hover:text-foreground active:scale-[0.97]"
    >
      {label}
      <LinkPending />
    </Link>
  );
}
