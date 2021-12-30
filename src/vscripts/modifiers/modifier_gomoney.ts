import { BaseModifier, registerModifier } from "../lib/dota_ts_adapter";

@registerModifier()
export class modifier_gomoney extends BaseModifier {

    OnCreated( kv: any) {
        if (IsServer()) {
            this.StartIntervalThink(0);
        }
    }

    OnIntervalThink() {
        if (!IsServer()) return;

        let entities = FindUnitsInRadius(this.GetCaster()!.GetTeam(), this.GetParent().GetAbsOrigin(), undefined, 100, UnitTargetTeam.FRIENDLY, UnitTargetType.HERO, UnitTargetFlags.NONE, FindOrder.CLOSEST, false); 
        
        for (let entity of entities) {
            print(entity.GetUnitName(), entity.GetEntityIndex(), this.GetCaster()!.GetEntityIndex());
            if (entity.GetEntityIndex() === this.GetCaster()!.GetEntityIndex()) {
                try {
                    GameRules.Addon.FoundHeroForGold();
                    EmitSoundOn("DOTA_Item.Hand_Of_Midas", entity);
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
        return "particles/customgames/capturepoints/cp_allied_metal.vpcf";
    }

    OnDestroy() {
        if (IsServer()) {
            UTIL_Remove(this.GetParent());
        }
    }
}