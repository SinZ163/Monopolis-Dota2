import { BaseModifier, registerModifier } from "../lib/dota_ts_adapter";

@registerModifier()
export class modifier_movetotile extends BaseModifier {

    OnCreated( kv: any) {
        if (IsServer()) {
            this.StartIntervalThink(0.5);
        }
    }

    OnIntervalThink() {
        if (!IsServer()) return;

        let entities = FindUnitsInRadius(this.GetCaster()!.GetTeam(), this.GetParent().GetAbsOrigin(), undefined, 30, UnitTargetTeam.FRIENDLY, UnitTargetType.HERO, UnitTargetFlags.NONE, FindOrder.CLOSEST, false);
        if (entities.length > 0) {
            GameRules.Addon.FoundHero();
            this.Destroy();
        }
    }

    GetEffectAttachType() {
        return ParticleAttachment.ABSORIGIN_FOLLOW;
    }
    GetEffectName() {
        return "particles/customgames/capturepoints/cp_allied_fire.vpcf";
    }

    OnDestroy() {
        if (IsServer()) {
            UTIL_Remove(this.GetParent());
        }
    }
}