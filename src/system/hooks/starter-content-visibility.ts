// Constants
import { COMPENDIUMS, STORMLIGHT_HANDBOOK_MODULE_ID } from '@system/constants';

// Settings
import { getSystemSetting, SETTINGS } from '../settings';

/**
 * The system's own starter-kit compendiums. These duplicate/overlap with the
 * content provided by the official "Cosmere RPG: Stormlight Handbook" module,
 * so they are hidden automatically when that module is active (unless the GM
 * has disabled the `HIDE_STARTER_CONTENT_WITH_HANDBOOK` setting).
 *
 * NOTE: `starter-rules` (the rules-text journal) is intentionally excluded, as
 * it isn't character/item content and doesn't necessarily overlap 1:1 with the
 * handbook's own journal content.
 */
const STARTER_CONTENT_PACKS: string[] = [
    COMPENDIUMS.ACTIONS,
    COMPENDIUMS.ANCESTRIES,
    COMPENDIUMS.COMPANIONS_AND_ADVERSARIES,
    COMPENDIUMS.CULTURES,
    COMPENDIUMS.HEROIC_PATHS,
    COMPENDIUMS.ITEMS,
    COMPENDIUMS.ROLL_TABLES,
];

Hooks.once('ready', () => {
    if (!game.user.isGM) return;

    const handbookActive = !!game.modules.get(STORMLIGHT_HANDBOOK_MODULE_ID)
        ?.active;
    if (!handbookActive) return;

    if (!getSystemSetting<boolean>(SETTINGS.HIDE_STARTER_CONTENT_WITH_HANDBOOK))
        return;

    void hideStarterContentPacks();
});

async function hideStarterContentPacks() {
    for (const packId of STARTER_CONTENT_PACKS) {
        const pack = game.packs?.get(packId);
        if (!pack) continue;

        try {
            await pack.configure({
                ownership: {
                    ...pack.ownership,
                    PLAYER: 'NONE',
                    ASSISTANT: 'NONE',
                },
            });
        } catch (err) {
            console.warn(
                `${STORMLIGHT_HANDBOOK_MODULE_ID}: failed to hide starter compendium "${packId}".`,
                err,
            );
        }
    }
}
