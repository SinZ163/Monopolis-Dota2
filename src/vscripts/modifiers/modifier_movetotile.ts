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
        let entities = FindUnitsInRadius(this.GetParent().GetTeam(), this.GetParent().GetAbsOrigin(), undefined, 30, UnitTargetTeam.FRIENDLY, UnitTargetType.HERO, UnitTargetFlags.NONE, FindOrder.CLOSEST, false);
        
        for (let entity of entities) {
            print(entity.GetUnitName(), entity.GetEntityIndex(), this.GetCaster()!.GetEntityIndex());
            if (entity.GetEntityIndex() === this.GetCaster()!.GetEntityIndex()) {
                try {
                    GameRules.Addon.FoundHero();
                } catch (e) {
                    print((e as Error).message);
                }
                this.Destroy();
            }
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