import { BaseModifier, registerModifier } from "../lib/dota_ts_adapter";

@registerModifier()
export class modifier_vision extends BaseModifier {
    // Set state
    CheckState() {
        return {
            [ModifierState.FORCED_FLYING_VISION]: true,
            [ModifierState.PROVIDES_VISION]: true
        };
    }

    DeclareFunctions() {
        return [
            ModifierFunction.BONUS_DAY_VISION,
            ModifierFunction.BONUS_NIGHT_VISION,
            ModifierFunction.MOVESPEED_BONUS_CONSTANT,
            ModifierFunction.IGNORE_MOVESPEED_LIMIT
        ];
    }

    GetModifierIgnoreMovespeedLimit = () => 1 as 1;

    GetModifierMoveSpeedBonus_Constant = () => 800;

    GetBonusDayVision() {
        return 5000;
    }
    GetBonusNightVision() {
        return 5000;
    }
}
