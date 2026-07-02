// Constants
import { COMPENDIUMS, STORMLIGHT_HANDBOOK_MODULE_ID } from '@system/constants';

// Settings
import { getSystemSetting, SETTINGS } from '../settings';

/**
 * The system's own starter-kit compendiums. These duplicate/overlap with the
 * content provided by the official "Cosmere RPG: Stormlight Handbook" module,
 * so they are hidden automatically from the Compendium sidebar when that
 * module is active (unless the GM has disabled the
 * `HIDE_STARTER_CONTENT_WITH_HANDBOOK` setting).
 *
 * NOTE 1: `starter-rules` (the rules-text journal) is intentionally excluded,
 * as it isn't character/item content and doesn't necessarily overlap 1:1 with
 * the handbook's own journal content.
 *
 * NOTE 2: This purely hides the entries from the sidebar UI on the client. It
 * does NOT touch compendium ownership/permissions: Foundry hard-codes the
 * GAMEMASTER role's ownership of every compendium to "OWNER" (it cannot be
 * revoked, even programmatically), so an ownership-based approach can only
 * ever hide content from Player/Trusted/Assistant roles — never from the GM
 * account itself. A UI-level hide is the only way to also declutter the GM's
 * own view, which is the actual goal here.
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

function shouldHideStarterContent(): boolean {
    const handbookActive = !!game.modules.get(STORMLIGHT_HANDBOOK_MODULE_ID)
        ?.active;
    if (!handbookActive) return false;

    return getSystemSetting<boolean>(
        SETTINGS.HIDE_STARTER_CONTENT_WITH_HANDBOOK,
    );
}

/**
 * Hides the starter-kit compendium entries (and their pack-folder, once
 * empty) from a rendered Compendium directory element.
 */
function hideStarterContentEntries(html: HTMLElement) {
    STARTER_CONTENT_PACKS.forEach((packId) => {
        html.querySelectorAll(`[data-pack="${packId}"]`).forEach((el) =>
            el.remove(),
        );
    });

    // If the "Stormlight Starter Rules" pack-folder is now empty (all of its
    // packs were starter-content and got removed above), hide it too so we
    // don't leave a dangling, empty folder in the sidebar.
    html.querySelectorAll('.directory-item.folder').forEach((folder) => {
        const hasPacks = folder.querySelector('[data-pack]');
        const hasSubfolders = folder.querySelector('.directory-item.folder');
        if (!hasPacks && !hasSubfolders) folder.remove();
    });
}

// TODO: Resolve typing issue
Hooks.on('renderCompendiumDirectory', (_app: unknown, html: HTMLElement) => {
    if (!shouldHideStarterContent()) return;
    hideStarterContentEntries(html);
});
