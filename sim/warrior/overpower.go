package warrior

import (
	"time"

	"github.com/wowsims/cata/sim/core"
)

func (warrior *Warrior) RegisterOverpowerSpell() {
	opAura := warrior.RegisterAura(core.Aura{
		ActionID: core.ActionID{SpellID: 7384},
		Tag:      EnableOverpowerTag,
		Label:    "Overpower Ready",
		Duration: time.Second * 5,
	})

	core.MakePermanent(warrior.RegisterAura(core.Aura{
		Label: "Overpower Trigger",
		OnSpellHitDealt: func(aura *core.Aura, sim *core.Simulation, spell *core.Spell, result *core.SpellResult) {
			// If TFB is already active and there's a dodge, the OP activation gets munched
			if result.Outcome.Matches(core.OutcomeDodge) && !warrior.HasActiveAuraWithTagExcludingAura(EnableOverpowerTag, opAura) {
				opAura.Activate(sim)
			}
		},
	}))

	warrior.Overpower = warrior.RegisterSpell(core.SpellConfig{
		ActionID:       core.ActionID{SpellID: 7384},
		SpellSchool:    core.SpellSchoolPhysical,
		ProcMask:       core.ProcMaskMeleeMHSpecial,
		Flags:          core.SpellFlagMeleeMetrics | core.SpellFlagIncludeTargetBonusDamage | core.SpellFlagAPL,
		ClassSpellMask: SpellMaskOverpower,

		RageCost: core.RageCostOptions{
			Cost:   5,
			Refund: 0.8,
		},
		Cast: core.CastConfig{
			DefaultCast: core.Cast{
				GCD: core.GCDDefault,
			},
			IgnoreHaste: true,
		},
		ExtraCastCondition: func(sim *core.Simulation, target *core.Unit) bool {
			return warrior.HasActiveAuraWithTag(EnableOverpowerTag)
		},

		CritMultiplier:   warrior.DefaultMeleeCritMultiplier(),
		ThreatMultiplier: 0.75,

		ApplyEffects: func(sim *core.Simulation, target *core.Unit, spell *core.Spell) {
			auras := warrior.GetAurasWithTag(EnableOverpowerTag)
			for _, aura := range auras {
				if aura.IsActive() {
					aura.Deactivate(sim)
				}
			}

			baseDamage := 0 +
				1.25*(spell.Unit.MHNormalizedWeaponDamage(sim, spell.MeleeAttackPower())+
					spell.BonusWeaponDamage())

			result := spell.CalcAndDealDamage(sim, target, baseDamage, spell.OutcomeMeleeSpecialNoBlockDodgeParry)
			if !result.Landed() {
				spell.IssueRefund(sim)
			}
		},
	})
}
