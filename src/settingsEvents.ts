export interface SettingsPanelState {
  open: boolean;
}

const settingsPanelEventName = "fqyy-settings-panel";

export function dispatchSettingsPanelState(open: boolean): void {
  window.dispatchEvent(new CustomEvent<SettingsPanelState>(settingsPanelEventName, { detail: { open } }));
}

export function subscribeSettingsPanelState(listener: (state: SettingsPanelState) => void): () => void {
  const receive = (event: Event): void => {
    const detail = (event as CustomEvent<SettingsPanelState>).detail;
    if (typeof detail?.open === "boolean") listener(detail);
  };
  window.addEventListener(settingsPanelEventName, receive);
  return () => window.removeEventListener(settingsPanelEventName, receive);
}
