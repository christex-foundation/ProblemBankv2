import { SignInTrigger } from './SignInPrompt';
import { SignedInComposer } from './SignedInComposer';

/**
 * Comment composer. When signed in, renders an inline textarea + submit.
 * When signed out, the whole card is a sign-in trigger opening the shared
 * auth modal. When closed (post-`submitted`), renders a quiet read-only
 * notice.
 */
export function CommentComposerStub({
  callbackPath,
  open,
  signedIn,
}: {
  callbackPath: string;
  /** When false, render a quiet closed-state notice instead of the composer. */
  open: boolean;
  signedIn: boolean;
}) {
  if (!open) {
    return (
      <div className="border border-foreground/15 bg-paper rounded-xl px-5 py-5 md:px-6 md:py-6">
        <p className="text-base md:text-lg text-foreground/55 leading-[1.55]">
          You can still read what was said while this was open. Comments are
          closed.
        </p>
      </div>
    );
  }

  if (signedIn) {
    return <SignedInComposer />;
  }

  return (
    <SignInTrigger
      callbackPath={callbackPath}
      ariaLabel="Sign in to comment"
      className="w-full text-left border border-foreground/15 bg-paper rounded-xl px-5 py-5 md:px-6 md:py-6 flex flex-col gap-8 transition-soft hover:border-foreground/40 focus-visible:outline-none focus-visible:border-foreground/40 cursor-text"
    >
      <span className="text-base md:text-lg text-foreground/40 leading-[1.55]">
        What do you think? ...
      </span>
      <span className="flex items-center justify-between gap-3">
        <span
          aria-hidden
          className="inline-flex w-9 h-9 items-center justify-center rounded-full border border-foreground/20 text-foreground/45 text-sm"
        >
          @
        </span>
        <span className="inline-flex items-center justify-center px-5 py-2.5 rounded-full border border-foreground/25 text-foreground/75 text-sm">
          Login to comment
        </span>
      </span>
    </SignInTrigger>
  );
}
