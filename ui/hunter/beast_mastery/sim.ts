import * as BuffDebuffInputs from '../../core/components/inputs/buffs_debuffs';
import * as ConsumablesInputs from '../../core/components/inputs/consumables';
import * as OtherInputs from '../../core/components/other_inputs';
import { IndividualSimUI, registerSpecConfig } from '../../core/individual_sim_ui';
import { Player } from '../../core/player';
import { PlayerClasses } from '../../core/player_classes';
import { PlayerSpecs } from '../../core/player_specs';
import { APLListItem, APLRotation } from '../../core/proto/apl';
import { Cooldowns, Debuffs, Faction, IndividualBuffs, PartyBuffs, PseudoStat, Race, RaidBuffs, Spec, Stat, TristateEffect } from '../../core/proto/common';
import { BeastMasteryHunter_Rotation } from '../../core/proto/hunter';
import * as AplUtils from '../../core/proto_utils/apl_utils';
import { Stats } from '../../core/proto_utils/stats';
import * as HunterInputs from './inputs';
import * as Presets from './presets';

const SPEC_CONFIG = registerSpecConfig(Spec.SpecBeastMasteryHunter, {
	cssClass: 'hunter-sim-ui',
	cssScheme: PlayerClasses.getCssClass(PlayerClasses.Hunter),
	// List any known bugs / issues here and they'll be shown on the site.
	knownIssues: [],
	warnings: [],

	// All stats for which EP should be calculated.
	epStats: [
		Stat.StatStamina,
		Stat.StatIntellect,
		Stat.StatAgility,
		Stat.StatRangedAttackPower,
		Stat.StatMeleeHit,
		Stat.StatMeleeCrit,
		Stat.StatMeleeHaste,
		Stat.StatArmorPenetration,
		Stat.StatMP5,
	],
	epPseudoStats: [PseudoStat.PseudoStatRangedDps],
	// Reference stat against which to calculate EP.
	epReferenceStat: Stat.StatRangedAttackPower,
	// Which stats to display in the Character Stats section, at the bottom of the left-hand sidebar.
	displayStats: [
		Stat.StatHealth,
		Stat.StatStamina,
		Stat.StatAgility,
		Stat.StatIntellect,
		Stat.StatRangedAttackPower,
		Stat.StatMeleeHit,
		Stat.StatMeleeCrit,
		Stat.StatMeleeHaste,
		Stat.StatArmorPenetration,
		Stat.StatMP5,
	],

	defaults: {
		// Default equipped gear.
		gear: Presets.SV_P1_PRESET.gear,
		// Default EP weights for sorting gear in the gear picker.
		epWeights: Stats.fromMap(
			{
				[Stat.StatStamina]: 0.5,
				[Stat.StatAgility]: 2.65,
				[Stat.StatIntellect]: 1.1,
				[Stat.StatRangedAttackPower]: 1.0,
				[Stat.StatMeleeHit]: 2,
				[Stat.StatMeleeCrit]: 1.5,
				[Stat.StatMeleeHaste]: 1.39,
				[Stat.StatArmorPenetration]: 1.32,
			},
			{
				[PseudoStat.PseudoStatRangedDps]: 6.32,
			},
		),
		// Default consumes settings.
		consumes: Presets.DefaultConsumes,
		// Default talents.
		talents: Presets.SurvivalTalents.data,
		// Default spec-specific settings.
		specOptions: Presets.DefaultOptions,
		// Default raid/party buffs settings.
		raidBuffs: RaidBuffs.create({
			arcaneBrilliance: true,
			powerWordFortitude: TristateEffect.TristateEffectImproved,
			giftOfTheWild: TristateEffect.TristateEffectImproved,
			bloodlust: true,
			strengthOfEarthTotem: TristateEffect.TristateEffectImproved,
			windfuryTotem: TristateEffect.TristateEffectImproved,
			battleShout: TristateEffect.TristateEffectImproved,
			leaderOfThePack: TristateEffect.TristateEffectImproved,
			sanctifiedRetribution: true,
			unleashedRage: true,
			moonkinAura: TristateEffect.TristateEffectImproved,
		}),
		partyBuffs: PartyBuffs.create({}),
		individualBuffs: IndividualBuffs.create({
			blessingOfKings: true,
			blessingOfWisdom: 2,
			blessingOfMight: 2,
			vampiricTouch: true,
		}),
		debuffs: Debuffs.create({
			sunderArmor: true,
			faerieFire: TristateEffect.TristateEffectImproved,
			judgementOfWisdom: true,
			curseOfElements: true,
			heartOfTheCrusader: true,
			savageCombat: true,
		}),
	},

	// IconInputs to include in the 'Player' section on the settings tab.
	playerIconInputs: [HunterInputs.PetTypeInput, HunterInputs.WeaponAmmo, HunterInputs.UseHuntersMark],
	// Inputs to include in the 'Rotation' section on the settings tab.
	rotationInputs: HunterInputs.HunterRotationConfig,
	petConsumeInputs: [ConsumablesInputs.SpicedMammothTreats],
	// Buff and Debuff inputs to include/exclude, overriding the EP-based defaults.
	includeBuffDebuffInputs: [BuffDebuffInputs.StaminaBuff, BuffDebuffInputs.SpellDamageDebuff],
	excludeBuffDebuffInputs: [],
	// Inputs to include in the 'Other' section on the settings tab.
	otherInputs: {
		inputs: [
			HunterInputs.PetUptime,
			HunterInputs.TimeToTrapWeaveMs,
			HunterInputs.SniperTrainingUptime,
			OtherInputs.TankAssignment,
			OtherInputs.InFrontOfTarget,
		],
	},
	encounterPicker: {
		// Whether to include 'Execute Duration (%)' in the 'Encounter' section of the settings tab.
		showExecuteProportion: false,
	},

	presets: {
		// Preset talents that the user can quickly select.
		talents: [Presets.BeastMasteryTalents, Presets.MarksmanTalents, Presets.SurvivalTalents],
		// Preset rotations that the user can quickly select.
		rotations: [
			Presets.ROTATION_PRESET_SIMPLE_DEFAULT,
			Presets.ROTATION_PRESET_BM,
			Presets.ROTATION_PRESET_MM,
			Presets.ROTATION_PRESET_MM_ADVANCED,
			Presets.ROTATION_PRESET_SV,
			Presets.ROTATION_PRESET_SV_ADVANCED,
			Presets.ROTATION_PRESET_AOE,
		],
		// Preset gear configurations that the user can quickly select.
		gear: [
			Presets.MM_PRERAID_PRESET,
			Presets.MM_P1_PRESET,
			Presets.MM_P2_PRESET,
			Presets.MM_P3_PRESET,
			Presets.MM_P4_PRESET,
			Presets.MM_P5_PRESET,
			Presets.SV_PRERAID_PRESET,
			Presets.SV_P1_PRESET,
			Presets.SV_P2_PRESET,
			Presets.SV_P3_PRESET,
			Presets.SV_P4_PRESET,
			Presets.SV_P5_PRESET,
		],
	},

	autoRotation: (player: Player<Spec.SpecBeastMasteryHunter>): APLRotation => {
		const talentTree = player.getTalentTree();
		const numTargets = player.sim.encounter.targets.length;
		if (numTargets >= 4) {
			return Presets.ROTATION_PRESET_AOE.rotation.rotation!;
		} else if (talentTree == 0) {
			return Presets.ROTATION_PRESET_BM.rotation.rotation!;
		} else if (talentTree == 1) {
			return Presets.ROTATION_PRESET_MM.rotation.rotation!;
		} else {
			return Presets.ROTATION_PRESET_SV.rotation.rotation!;
		}
	},

	simpleRotation: (_player: Player<Spec.SpecBeastMasteryHunter>, _simple: BeastMasteryHunter_Rotation, cooldowns: Cooldowns): APLRotation => {
		const [prepullActions, actions] = AplUtils.standardCooldownDefaults(cooldowns);

		return APLRotation.create({
			prepullActions: prepullActions,
			priorityList: actions.map(action =>
				APLListItem.create({
					action: action,
				}),
			),
		});
	},

	raidSimPresets: [
		{
			spec: Spec.SpecBeastMasteryHunter,
			tooltip: PlayerSpecs.BeastMasteryHunter.fullName,
			defaultName: PlayerSpecs.BeastMasteryHunter.friendlyName,
			iconUrl: PlayerSpecs.BeastMasteryHunter.getIcon('medium'),

			talents: Presets.BeastMasteryTalents.data,
			specOptions: Presets.BMDefaultOptions,
			consumes: Presets.DefaultConsumes,
			defaultFactionRaces: {
				[Faction.Unknown]: Race.RaceUnknown,
				[Faction.Alliance]: Race.RaceNightElf,
				[Faction.Horde]: Race.RaceOrc,
			},
			defaultGear: {
				[Faction.Unknown]: {},
				[Faction.Alliance]: {
					1: Presets.MM_P1_PRESET.gear,
					2: Presets.MM_P2_PRESET.gear,
					3: Presets.MM_P3_PRESET.gear,
					4: Presets.MM_P4_PRESET.gear,
				},
				[Faction.Horde]: {
					1: Presets.MM_P1_PRESET.gear,
					2: Presets.MM_P2_PRESET.gear,
					3: Presets.MM_P3_PRESET.gear,
					4: Presets.MM_P4_PRESET.gear,
				},
			},
		},
	],
});

export class BeastMasteryHunterSimUI extends IndividualSimUI<Spec.SpecBeastMasteryHunter> {
	constructor(parentElem: HTMLElement, player: Player<Spec.SpecBeastMasteryHunter>) {
		super(parentElem, player, SPEC_CONFIG);
	}
}
