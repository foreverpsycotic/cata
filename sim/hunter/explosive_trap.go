package hunter

import (
	"time"

	"github.com/wowsims/cata/sim/core"
)

func (hunter *Hunter) registerExplosiveTrapSpell(timer *core.Timer) {
	bonusPeriodicDamageMultiplier := .10 * float64(hunter.Talents.TrapMastery)

	hunter.ExplosiveTrap = hunter.RegisterSpell(core.SpellConfig{
		ActionID:    core.ActionID{SpellID: 13812},
		SpellSchool: core.SpellSchoolFire,
		ProcMask:    core.ProcMaskSpellDamage,
		Flags:       core.SpellFlagAPL,

		FocusCost: core.FocusCostOptions{
			Cost: 0, // Todo: Verify focus cost https://warcraft.wiki.gg/index.php?title=Explosive_Trap&oldid=2963725
		},
		Cast: core.CastConfig{
			DefaultCast: core.Cast{
				GCD: time.Second,
			},
			CD: core.Cooldown{
				Timer:    timer,
				Duration: time.Second*30 - time.Second*2*time.Duration(hunter.Talents.Resourcefulness),
			},
		},

		DamageMultiplierAdditive: 1,
		CritMultiplier:           hunter.CritMultiplier(false, false, false),
		ThreatMultiplier:         1,

		Dot: core.DotConfig{
			IsAOE: true,
			Aura: core.Aura{
				Label: "Explosive Trap",
			},
			NumberOfTicks: 10,
			TickLength:    time.Second * 2,

			OnTick: func(sim *core.Simulation, target *core.Unit, dot *core.Dot) {
				baseDamage := 90 + 0.1*dot.Spell.RangedAttackPower(target) // Todo: Change this to use Cata calculations
				dot.Spell.DamageMultiplierAdditive += bonusPeriodicDamageMultiplier
				for _, aoeTarget := range sim.Encounter.TargetUnits {
					dot.Spell.CalcAndDealPeriodicDamage(sim, aoeTarget, baseDamage, dot.Spell.OutcomeRangedHitAndCritNoBlock)
				}
				dot.Spell.DamageMultiplierAdditive -= bonusPeriodicDamageMultiplier
			},
		},

		ApplyEffects: func(sim *core.Simulation, target *core.Unit, spell *core.Spell) {
			if sim.CurrentTime < 0 {
				// Traps only last 60s.
				if sim.CurrentTime < -time.Second*60 {
					return
				}

				// If using this on prepull, the trap effect will go off when the fight starts
				// instead of immediately.
				core.StartDelayedAction(sim, core.DelayedActionOptions{
					DoAt: 0,
					OnAction: func(sim *core.Simulation) {
						for _, aoeTarget := range sim.Encounter.TargetUnits {
							baseDamage := sim.Roll(523, 671) + 0.1*spell.RangedAttackPower(aoeTarget) // Todo: Change this to use Cata calculations
							baseDamage *= sim.Encounter.AOECapMultiplier()
							spell.CalcAndDealDamage(sim, aoeTarget, baseDamage, spell.OutcomeRangedHitAndCritNoBlock)
						}
						hunter.ExplosiveTrap.AOEDot().Apply(sim)
					},
				})
			} else {
				for _, aoeTarget := range sim.Encounter.TargetUnits {
					baseDamage := sim.Roll(523, 671) + 0.1*spell.RangedAttackPower(aoeTarget) // Todo: Change this to use Cata calculations
					baseDamage *= sim.Encounter.AOECapMultiplier()
					spell.CalcAndDealDamage(sim, aoeTarget, baseDamage, spell.OutcomeRangedHitAndCritNoBlock)
				}
				hunter.ExplosiveTrap.AOEDot().Apply(sim)
			}
		},
	})
	// Todo: Gonna leave the trap weave code for now since we have trap launcher, but it incurrs a Focus cost, so we might wanna sim in AOE situations what's better.
	timeToTrapWeave := time.Millisecond * time.Duration(hunter.Options.TimeToTrapWeaveMs)
	halfWeaveTime := timeToTrapWeave / 2
	hunter.TrapWeaveSpell = hunter.RegisterSpell(core.SpellConfig{
		ActionID: hunter.ExplosiveTrap.ActionID.WithTag(1),
		Flags:    core.SpellFlagNoOnCastComplete | core.SpellFlagNoMetrics | core.SpellFlagNoLogs | core.SpellFlagAPL,

		ExtraCastCondition: func(sim *core.Simulation, target *core.Unit) bool {
			return hunter.ExplosiveTrap.CanCast(sim, target)
		},

		ApplyEffects: func(sim *core.Simulation, target *core.Unit, spell *core.Spell) {
			if sim.CurrentTime < 0 {
				hunter.mayMoveAt = sim.CurrentTime
			}

			// Assume we started running after the most recent ranged auto, so that time
			// can be subtracted from the run in.
			reachLocationAt := hunter.mayMoveAt + halfWeaveTime
			layTrapAt := max(reachLocationAt, sim.CurrentTime)
			doneAt := layTrapAt + halfWeaveTime

			hunter.AutoAttacks.DelayRangedUntil(sim, doneAt+time.Millisecond*500)

			if layTrapAt == sim.CurrentTime {
				hunter.ExplosiveTrap.Cast(sim, target)
				if doneAt > hunter.GCD.ReadyAt() {
					hunter.GCD.Set(doneAt)
				}
			} else {
				// Make sure the GCD doesn't get used while we're waiting.
				hunter.WaitUntil(sim, doneAt)

				core.StartDelayedAction(sim, core.DelayedActionOptions{
					DoAt: layTrapAt,
					OnAction: func(sim *core.Simulation) {
						hunter.GCD.Reset()
						hunter.ExplosiveTrap.Cast(sim, target)
						if doneAt > hunter.GCD.ReadyAt() {
							hunter.GCD.Set(doneAt)
						}
					},
				})
			}
		},
	})
}
