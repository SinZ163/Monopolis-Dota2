import { BaseModifier, registerModifier } from "../lib/dota_ts_adapter";

@registerModifier()
export class modifier_vision extends BaseModifier {
    // Set state
    CheckState(): Partial<Record<modifierstate, boolean>> {
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
        ];
    }

    GetModifierMoveSpeedBonus_Constant = () => 800;

    GetBonusDayVision() {
        return 5000;
    }
    GetBonusNightVision() {
        return 5000;
    }
}
