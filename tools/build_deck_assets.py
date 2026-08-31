import json, os

deck_data = {
  "updated": "2026-08-30",
  "weeks": {
    "1": {
      "week": 1,
      "title": "Creation, Eden, and the Human Calling",
      "subtitle": "Humanity's calling, rebellion, and hope",
      "slides": [
        {
          "type": "title",
          "kicker": "B'nei HaBerit — Session 1",
          "heading": "Creation, Eden, and the Human Calling",
          "sub": "Genesis 1–3 • Job 38:4–7 • Psalm 8 • Romans 5:12–21 • 1 Cor 15:42–49",
          "callout": "Yahweh creates alone. His heavenly family witnesses. Humanity is crowned with royal-priestly rule."
        },
        {
          "type": "split",
          "heading": "The Three-Tier Cosmos",
          "sub": "Functional Sacred Space, Not Raw Physics",
          "left": {
            "title": "Cosmic Architecture",
            "items": [
              "<strong>שָׁמַיִם (Shamayim)</strong>: The heavenly heights and God's throne room (Ps 11:4, Isa 66:1).",
              "<strong>אֶרֶץ (Eretz)</strong>: The earthly middle realm assigned to humanity (Ps 115:16).",
              "<strong>תְּהוֹם (Tehom)</strong>: The primordial deep / abyss restrained by God's word (Gen 1:2, Job 38:8–11).",
              "<strong>רָקִיעַ (Raqia)</strong>: The cosmic expanse separating the realms (Gen 1:6)."
            ]
          },
          "right": {
            "title": "The Big Difference",
            "text": "In pagan myth (Enuma Elish), gods battle chaos monsters to carve out order. In Genesis, <strong>Yahweh simply speaks</strong>. The chaos waters obey His voice."
          }
        },
        {
          "type": "words",
          "heading": "Load-Bearing Hebrew Words",
          "sub": "Hebrew first. English walks around it.",
          "words": [
            {
              "he": "צֶלֶם",
              "tr": "tselem",
              "def": "Image — royal-priestly vocation to represent Yahweh's rule on earth (Gen 1:26–28)."
            },
            {
              "he": "נָחָשׁ",
              "tr": "nachash",
              "def": "Serpent / shining one — spiritual rebel in God's garden, later named Satan (Rev 12:9)."
            },
            {
              "he": "זֶרַע",
              "tr": "zera",
              "def": "Seed — masculine singular, the promised deliverer who will crush the serpent (Gen 3:15)."
            },
            {
              "he": "עָרוֹם / עָרוּם",
              "tr": "arom / arum",
              "def": "Naked / crafty — wordplay between human vulnerability (Gen 2:25) and serpent cunning (3:1)."
            }
          ]
        },
        {
          "type": "card",
          "heading": "Genesis 3:15 — The Seed War Hinge",
          "sub": "The Protoevangelium (First Gospel)",
          "body": "<blockquote>\"I will put enmity between you and the woman, and between your offspring and her offspring; he shall crush your head, and you shall strike his heel.\"</blockquote>",
          "bullets": [
            "<strong>The Two Seed Lines</strong>: A spiritual conflict running from Genesis to Revelation.",
            "<strong>The Singular Crusher</strong>: The woman's seed (masculine <em>hu</em>) receives a wounded heel while destroying the serpent.",
            "<strong>Exile with Hope</strong>: Adam and Eve leave the garden with clothing provided by Yahweh and a binding promise."
          ]
        },
        {
          "type": "learned",
          "heading": "What We Can Now Say",
          "sub": "Core Takeaways from Week 1",
          "items": [
            "Yahweh alone creates; the plural of 1:26 is His heavenly council hearing, while 1:27 is singular divine action.",
            "Image is calling: fill, rule, serve (<em>abad</em>), and guard (<em>shamar</em>).",
            "The nachash is a spiritual adversary; Scripture stacks later revelation to identify the ancient serpent.",
            "Genesis 3:15 establishes the battle line that governs the rest of the Bible.",
            "Next: How rebellion spreads — seed line, Watchers, and flood."
          ]
        }
      ]
    },
    "2": {
      "week": 2,
      "title": "Seed Line, Watchers, and Flood",
      "subtitle": "Corruption, mercy, and Yahweh's covenant",
      "slides": [
        {
          "type": "title",
          "kicker": "B'nei HaBerit — Session 2",
          "heading": "Seed Line, Watchers, and Flood",
          "sub": "Genesis 4–9 • Jude 6, 14–15 • 2 Peter 2:4–5 • 1 Peter 3:18–22",
          "callout": "How does rebellion spread, and what does Yahweh preserve?"
        },
        {
          "type": "contrast",
          "heading": "The Two Lamechs: Line of Cain vs. Line of Seth",
          "sub": "Genesis 4:23–24 vs. Genesis 5:28–31",
          "col1": {
            "title": "Cain's Lamech (Gen 4:23–24)",
            "items": [
              "Line of the murderer Cain",
              "Boasts in violence: killed a young man for striking him",
              "Demands 77-fold human vengeance",
              "Represents humanity descending into unchecked arrogance"
            ]
          },
          "col2": {
            "title": "Seth's Lamech (Gen 5:28–31)",
            "items": [
              "Line of the covenant seed through Seth",
              "Waits on Yahweh: names his son Noah (<em>Noach</em> = Rest)",
              "Prophesies comfort from the cursed ground",
              "Represents the faithful remnant trusting the promise"
            ]
          }
        },
        {
          "type": "map",
          "heading": "Ancient Sacred Geography",
          "sub": "Axis points where heaven, earth, and rebellion collide",
          "locations": [
            {
              "name": "Garden of Eden",
              "tag": "Sacred Space Axis",
              "text": "The primeval mountain temple where heaven and earth began as one (Gen 2–3, Ezek 28:13–14)."
            },
            {
              "name": "Mount Hermon & Bashan",
              "tag": "Boundary Breach & Giant Clan Territory",
              "text": "Northern frontier (Deut 3:11, Ps 68:15). Second Temple tradition (1 Enoch 6:6) associates Hermon with rebel descent; Caesarea Philippi at its base."
            },
            {
              "name": "Mountains of Ararat",
              "tag": "Flood Resting Place",
              "text": "Where the Ark (<em>Tebah</em>) rested (Gen 8:4) and Noah built an altar of covenant worship."
            },
            {
              "name": "Plain of Shinar (Babel)",
              "tag": "Man-Made Cosmic Mountain",
              "text": "Where rebellious humanity attempts to build a tower to the heavens (Gen 11:1–9)."
            },
            {
              "name": "Mount Moriah & Zion",
              "tag": "Yahweh's Chosen Mountain",
              "text": "Abraham offers Isaac (Gen 22); David establishes the altar; the True Temple (Ps 48:2, Ps 132:13–14)."
            }
          ]
        },
        {
          "type": "words",
          "heading": "Genesis 6 & Daniel 4: The Lexical Reality",
          "sub": "Canonical terms first. Extra-biblical tradition labeled.",
          "words": [
            {
              "he": "בְּנֵי הָאֱלֹהִים",
              "tr": "bene ha-elohim",
              "def": "Sons of God (Gen 6:2, Job 1:6, 38:7) — heavenly beings. In Gen 6, crossing boundaries with the daughters of men."
            },
            {
              "he": "הַנְּפִלִים",
              "tr": "ha-nephilim",
              "def": "The fallen / tyrants (Gen 6:4, Num 13:33) — offspring and warriors of renown (<em>gibborim</em>)."
            },
            {
              "he": "עִיר / עִירִין",
              "tr": "'ir / 'irin (Aramaic)",
              "def": "Watcher / Watchers — canonical word appears ONLY in Daniel 4:13, 17, 23 for holy heavenly sentinels."
            },
            {
              "he": "תָּמִים",
              "tr": "tamim",
              "def": "Whole, sound, blameless — Noah's integrity and lineage in his generations (Gen 6:9)."
            }
          ]
        },
        {
          "type": "card",
          "heading": "The Ark, The Pitch, and The Covenant",
          "sub": "Yahweh Preserves the Line of the Woman",
          "body": "<blockquote>\"I will establish my covenant with you, and you shall come into the ark, you, your sons, your wife, and your sons' wives with you.\" — Genesis 6:18</blockquote>",
          "bullets": [
            "<strong>The Box (תֵּבָה <em>Tebah</em>)</strong>: Used only twice in Scripture — Noah's ark and baby Moses' basket on the Nile (Exod 2:3). A vessel of mercy floating on chaos waters.",
            "<strong>Covering / Pitch (כֹּפֶר <em>Kopher</em>)</strong>: The ark is covered inside and out with pitch (<em>kopher</em>) — same root as <em>kippur</em> (atonement/ransom).",
            "<strong>The Bow in the Clouds</strong>: Yahweh hangs His war bow unstrung facing heaven — peace sworn to all flesh (Gen 9:13–16)."
          ]
        },
        {
          "type": "learned",
          "heading": "What We Can Now Say",
          "sub": "Core Takeaways from Week 2",
          "items": [
            "Sin spreads from the heart (Cain) to culture (Lamech) to cosmic corruption (Gen 6).",
            "Genesis 6:1–4 records a real spiritual boundary breach before the flood.",
            "Canonical Scripture alone is binding authority; Second Temple texts (1 Enoch, 1Q20) give historical context but do not overrule the text.",
            "Yahweh's judgment is real, but His covenant mercy preserves the seed line.",
            "Next: Station 3 — Babel, the scattering, and the call of Abram (Genesis 10–12)."
          ]
        }
      ]
    }
  }
}

for d in ['public', 'docs']:
    with open(os.path.join(d, 'deck.json'), 'w', encoding='utf-8') as f:
        json.dump(deck_data, f, indent=2, ensure_ascii=False)
print('Generated deck.json successfully')
