'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { SubmitModal } from './SubmitModal';
import SubmitForm from './SubmitForm';

type RaiseModalContextValue = {
  openRaiseModal: () => void;
  closeRaiseModal: () => void;
  isOpen: boolean;
};

const RaiseModalContext = createContext<RaiseModalContextValue | null>(null);

export function useRaiseModal(): RaiseModalContextValue {
  const ctx = useContext(RaiseModalContext);
  if (!ctx) {
    throw new Error('useRaiseModal must be used inside RaiseModalProvider');
  }
  return ctx;
}

export function RaiseModalProvider({
  children,
  signedIn = false,
}: {
  children: ReactNode;
  signedIn?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const openRaiseModal = useCallback(() => setIsOpen(true), []);
  const closeRaiseModal = useCallback(() => setIsOpen(false), []);

  const value = useMemo<RaiseModalContextValue>(
    () => ({ openRaiseModal, closeRaiseModal, isOpen }),
    [openRaiseModal, closeRaiseModal, isOpen],
  );

  return (
    <RaiseModalContext.Provider value={value}>
      {children}
      {isOpen && (
        <SubmitModal onClose={closeRaiseModal}>
          <SubmitForm signedIn={signedIn} />
        </SubmitModal>
      )}
    </RaiseModalContext.Provider>
  );
}
