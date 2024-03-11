import * as PresetUtils from '../../core/preset_utils.js';
import { Consumes, Flask, Food, Glyphs, Potions } from '../../core/proto/common.js';
import { RestorationShaman_Options as RestorationShamanOptions, ShamanMajorGlyph, ShamanMinorGlyph, ShamanShield } from '../../core/proto/shaman.js';
import { SavedTalents } from '../../core/proto/ui.js';
import P1Gear from './gear_sets/p1.gear.json';
import P2Gear from './gear_sets/p2.gear.json';
import P3Gear from './gear_sets/p3.gear.json';
import P4Gear from './gear_sets/p4.gear.json';
import PreraidGear from './gear_sets/preraid.gear.json';

// Preset options for this spec.
// Eventually we will import these values for the raid sim too, so its good to
// keep them in a separate file.

export const PRERAID_PRESET = PresetUtils.makePresetGear('PreRaid', PreraidGear);
export const P1_PRESET = PresetUtils.makePresetGear('P1 Preset', P1Gear);
export const P2_PRESET = PresetUtils.makePresetGear('P2 Preset', P2Gear);
export const P3_PRESET = PresetUtils.makePresetGear('P3 Preset', P3Gear);
export const P4_PRESET = PresetUtils.makePresetGear('P4 Preset', P4Gear);

// Default talents. Uses the wowhead calculator format, make the talents on
// https://wowhead.com/cata/talent-calc and copy the numbers in the url.
export const TankHealingTalents = {
	name: 'Tank Healing',
	data: SavedTalents.create({
		talentsString: '-30205033-05005331335010501122331251',
		glyphs: Glyphs.create({
			major1: ShamanMajorGlyph.GlyphOfEarthlivingWeapon,
			major2: ShamanMajorGlyph.GlyphOfEarthShield,
			major3: ShamanMajorGlyph.GlyphOfLesserHealingWave,
			minor2: ShamanMinorGlyph.GlyphOfWaterShield,
			minor1: ShamanMinorGlyph.GlyphOfRenewedLife,
			minor3: ShamanMinorGlyph.GlyphOfGhostWolf,
		}),
	}),
};
export const RaidHealingTalents = {
	name: 'Raid Healing',
	data: SavedTalents.create({
		talentsString: '-3020503-50005331335310501122331251',
		glyphs: Glyphs.create({
			major1: ShamanMajorGlyph.GlyphOfChainHeal,
			major2: ShamanMajorGlyph.GlyphOfEarthShield,
			major3: ShamanMajorGlyph.GlyphOfEarthlivingWeapon,
			minor2: ShamanMinorGlyph.GlyphOfWaterShield,
			minor1: ShamanMinorGlyph.GlyphOfRenewedLife,
			minor3: ShamanMinorGlyph.GlyphOfGhostWolf,
		}),
	}),
};

export const DefaultOptions = RestorationShamanOptions.create({
	shield: ShamanShield.WaterShield,
	earthShieldPPM: 0,
});

export const DefaultConsumes = Consumes.create({
	defaultPotion: Potions.RunicManaInjector,
	flask: Flask.FlaskOfTheFrostWyrm,
	food: Food.FoodFishFeast,
});
