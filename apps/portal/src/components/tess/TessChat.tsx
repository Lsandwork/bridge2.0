"use client";

import { type TessQuickAction } from "@family-support/core";
import { TessScreen } from "./TessScreen";

type InputMode = "text" | "talk";

type Props = {
  childProfileId?: string;
  userName?: string;
  role?: string;
  quickActions?: TessQuickAction[];
  placeholder?: string;
  header?: string;
  mode?: string;
  defaultInputMode?: InputMode;
  embedded?: boolean;
};

/** @deprecated Use TessScreen — kept for imports that expect TessChat */
export function TessChat({
  childProfileId = "cp1",
  userName = "friend",
  quickActions = [],
  placeholder,
  mode = "text",
  defaultInputMode = "talk",
  embedded = false,
}: Props) {
  return (
    <TessScreen
      childProfileId={childProfileId}
      userName={userName}
      quickActions={quickActions}
      placeholder={placeholder}
      mode={mode}
      defaultInputMode={defaultInputMode}
      embedded={embedded}
      initialViewMode={embedded ? "chat" : undefined}
    />
  );
}

export { TessScreen };
