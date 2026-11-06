# International Books Data Part 1 (Americas & Western Europe: US, UK, France, Germany, Canada, Australia, New Zealand)
# Total: 325 books

# Format for each entry:
# (id, title, author, lifespan, country, region, language, category, year, period, difficulty, icon, gutenbergId, words, description, themes, ch1Title, ch1Text, origTitle, langCode)

from uk_books import UK_BOOKS
from continental_europe_books import FRANCE_BOOKS, GERMANY_BOOKS
from build_books_data import BOOKS_DATA as US_RAW_BOOKS

US_BOOKS = []
for b in US_RAW_BOOKS:
    US_BOOKS.append((
        b["id"], b["title"], b["author"], b.get("authorLifespan", "19th Century"),
        b["country"], b["region"], b["language"], b["category"], b["year"],
        b.get("period", "19th Century"), b.get("difficulty", "Intermediate"),
        b.get("icon", "📖"), b.get("gutenbergId", 0), b.get("wordCount", 45000),
        b["description"], b.get("themes", ["Human Experience"]),
        b.get("sampleTitle", "Opening Chapter"), b.get("sampleText", b["description"]),
        b.get("originalTitle"), b.get("languageCode", "en")
    ))

CANADA_BOOKS = [
    ("anne-of-green-gables-montgomery", "Anne of Green Gables", "L.M. Montgomery", "1874 – 1942", "Canada", "Americas", "English", "Children's Literature", 1908, "Early 20th Century", "Beginner", "👒", 45, 105000,
     "The immortal story of imaginative, red-headed orphan Anne Shirley sent mistakenly to Prince Edward Island.",
     ["Imagination and Wonder", "Belonging and Family", "Prince Edward Island Nature", "Kindred Spirits"],
     "Mrs. Rachel Lynde is Surprised", "Mrs. Rachel Lynde lived just where the Avonlea main road dipped down into a little hollow, fringed with alders and ladies' eglantines and traversed by a brook that had its source away back in the woods of the old Cuthbert place.", None, "en"),
    ("anne-of-avonlea-montgomery", "Anne of Avonlea", "L.M. Montgomery", "1874 – 1942", "Canada", "Americas", "English", "Children's Literature", 1909, "Early 20th Century", "Beginner", "🌸", 47, 95000,
     "Anne Shirley begins teaching at the Avonlea school at age sixteen, testing her romantic ideals against village realities.",
     ["Teaching and Mentorship", "Village Community", "Youthful Ideals", "Growing into Womanhood"],
     "An Irate Neighbour", "Tall and slender, nineteen years of age, with starry gray eyes and hair that her friends called auburn, Anne Shirley sat upon the broad grassy bank at Green Gables.", None, "en"),
    ("anne-of-the-island-montgomery", "Anne of the Island", "L.M. Montgomery", "1874 – 1942", "Canada", "Americas", "English", "World Literature", 1915, "Early 20th Century", "Intermediate", "🎓", 51, 88000,
     "Anne travels to Kingsport to earn her B.A. at Redmond College, sharing Patty's Place with dear friends.",
     ["College Education for Women", "Friendship and Courtship", "Nostalgia for Home", "Maturity of Ambition"],
     "The Shadow of Change", "'Harvest is ended and summer is gone,' quoted Anne Shirley, gazing across the shorn clover fields.", None, "en"),
    ("emily-of-new-moon-montgomery", "Emily of New Moon", "L.M. Montgomery", "1874 – 1942", "Canada", "Americas", "English", "Children's Literature", 1923, "Early 20th Century", "Intermediate", "🌙", 60166, 110000,
     "Orphaned Emily Starr is sent to New Moon Farm where she discovers her fierce, uncompromising vocation as a writer.",
     ["The Writing Vocation", "Nature Mysticism", "Family Pride", "Artistic Tenacity"],
     "The House in the Hollow", "Emily was sitting on the doorstep of the little house in the hollow, looking down over the long, dark-green woods.", None, "en"),
    ("sunshine-sketches-stephen-leacock", "Sunshine Sketches of a Little Town", "Stephen Leacock", "1869 – 1944", "Canada", "Americas", "English", "Fiction & Fantasy", 1912, "Early 20th Century", "Beginner", "☀️", 3533, 58000,
     "Canada's beloved masterpiece of gentle irony and affection, chronicling the eccentric citizens of fictional Mariposa on Lake Wissanotti.",
     ["Small-Town Satire", "Gentle Humor", "Mariposa on the Lake", "Human Vanity and Affection"],
     "The Hostelry of Mr. Smith", "I don't know whether you know Mariposa. If not, it is of no consequence, for if you know Canada at all, or the country parts of it, you know Mariposa.", None, "en"),
    ("literary-lapses-stephen-leacock", "Literary Lapses: A Book of Sketches", "Stephen Leacock", "1869 – 1944", "Canada", "Americas", "English", "Fiction & Fantasy", 1910, "Early 20th Century", "Beginner", "🎩", 453, 42000,
     "Leacock's hilarious first collection containing classic comedic essays such as 'My Financial Career' and 'Boarding-House Geometry'.",
     ["Satirical Comedy", "Everyday Absurdity", "Banking and Social Anxiety", "Wit and Good Sense"],
     "My Financial Career", "When I go into a bank I get rattled. The clerks rattle me; the wickets rattle me; the sight of the money rattles me; everything rattles me.", None, "en"),
    ("legends-of-vancouver-pauline-johnson", "Legends of Vancouver", "E. Pauline Johnson (Tekahionwake)", "1861 – 1913", "Canada", "Americas", "English & Mohawk", "World Literature", 1911, "Early 20th Century", "Intermediate", "🌲", 281, 48000,
     "Indigenous Mohawk-Canadian poet Tekahionwake's lyrical collection of Coast Salish legends shared with her by Chief Joe Capilano.",
     ["Indigenous Oral Heritage", "Coast Salish Traditions", "Pacific Northwest Nature", "Sacred Landscapes"],
     "The Two Sisters (The Lions)", "There is a legend that the Lions, those two twin mountain peaks that guard Vancouver Harbour, were once two young daughters of a great Tyee.", None, "en"),
    ("roughing-it-in-the-bush-moodie", "Roughing It in the Bush; or, Forest Life in Canada", "Susanna Moodie", "1803 – 1885", "Canada", "Americas", "English", "History & Civilizations", 1852, "19th Century", "Advanced", "🪵", 4811, 160000,
     "A courageous, unvarnished pioneer memoir of an English gentlewoman carving out a home in the Ontario wilderness in the 1830s.",
     ["Pioneer Hardship", "Canadian Wilderness", "Immigrant Adjustment", "Frontier Fortitude"],
     "A Visit to Grosse Isle", "In the spring of 1832, my husband and myself left England for Canada, hoping to improve our worldly prospects in a land where industry was sure of reward.", None, "en"),
    ("kindred-of-the-wild-charles-roberts", "The Kindred of the Wild: A Book of Animal Life", "Charles G.D. Roberts", "1860 – 1943", "Canada", "Americas", "English", "Children's Literature", 1902, "Early 20th Century", "Beginner", "🐺", 1239, 72000,
     "Pioneering realistic animal stories by Canada's father of nature poetry, portraying the wilderness through the minds of wolves, moose, and eagles.",
     ["Wildlife Realism", "Canadian North Woods", "Instinct and Survival", "Kinship with Nature"],
     "The Animal Story", "The animal story, as we have it today, is a very recent product of the human imagination, born of our growing kinship with all living creatures.", None, "en"),
    ("low-tide-on-grand-pre-bliss-carman", "Low Tide on Grand Pré: A Book of Lyrics", "Bliss Carman", "1861 – 1929", "Canada", "Americas", "English", "Poetry & Drama", 1893, "19th Century", "Intermediate", "🌊", 17290, 22000,
     "Canada's Confederation poet celebrates the Fundy tides, the Acadian marshes, and mystical communion with northern beauty.",
     ["Maritime Landscape", "Tides of Acadia", "Vagabond Melancholy", "Lyric Nature"],
     "Low Tide on Grand Pré", "The sun goes down, and over all / These wide salt marshes of Grand Pré, / The twilight comes; and through the fall / Of night along the windy bay...", None, "en")
]

AUSTRALIA_BOOKS = [
    ("the-man-from-snowy-river-paterson", "The Man from Snowy River and Other Verses", "Banjo Paterson", "1864 – 1941", "Australia", "Oceania", "English", "Poetry & Drama", 1895, "19th Century", "Beginner", "🐎", 259, 35000,
     "Australia's legendary bush ballad collection celebrating mountain stockmen, wild brumbies, Clancy of the Overflow, and Outback resilience.",
     ["Australian Bush Ballads", "Outback Horsemanship", "Snowy River Mountains", "Bush Camaraderie"],
     "The Man from Snowy River", "There was movement at the station, for the word had passed around / That the colt from old Regret had got away, / And had joined the wild bush horses—he was worth a thousand pound, / So all the cracks had gathered to the fray.", None, "en"),
    ("while-the-billy-boils-henry-lawson", "While the Billy Boils: Bush Stories", "Henry Lawson", "1867 – 1922", "Australia", "Oceania", "English", "World Literature", 1896, "19th Century", "Intermediate", "☕", 1312, 65000,
     "Lawson's foundational realist short stories establishing Australian bush egalitarianism, mateship, and drought-stricken Outback grit.",
     ["Mateship in the Bush", "Egalitarian Outback Grit", "Drover's Life and Solitude", "Australian Realism"],
     "The Drover's Wife", "The two-roomed house is built of round timber, slabs, and stringy-bark, and floored with split slabs. A big bark kitchen stood at the end. Bush all around—bush with no horizon, for the country is flat.", None, "en"),
    ("my-brilliant-career-miles-franklin", "My Brilliant Career", "Miles Franklin", "1879 – 1954", "Australia", "Oceania", "English", "International Classics", 1901, "Early 20th Century", "Intermediate", "🌾", 876, 75000,
     "Sixteen-year-old Sybylla Melvyn's fiery, rebellious autobiographical novel refusing marriage and domestic servitude in the drought-ravaged New South Wales bush.",
     ["Female Defiance and Art", "Outback Drought", "Bush Identity", "Refusal of Domestic Trap"],
     "Possum Gully", "My father was once a wealthy grazier, but drought and depression reduced us until we were living on a dairy farm at Possum Gully. I wanted to write, to live, to achieve my brilliant career.", None, "en"),
    ("for-the-term-of-his-natural-life-clarke", "For the Term of His Natural Life", "Marcus Clarke", "1846 – 1881", "Australia", "Oceania", "English", "History & Civilizations", 1874, "19th Century", "Advanced", "⛓️", 1098, 225000,
     "The epic, harrowing chronicle of the Australian convict transportation era, following falsely accused aristocrat Richard Devine to Port Arthur, Tasmania.",
     ["Australian Convict System", "Port Arthur and Van Diemen's Land", "Injustice and Redemption", "Endurance in Chains"],
     "The Voyage Out", "On the 15th of January, 1827, the transport ship Malabar, bound for Sydney with prisoners, was tossing on the long swell of the Southern Ocean.", None, "en"),
    ("robbery-under-arms-boldrewood", "Robbery Under Arms: A Story of Life and Adventure in the Bush and in the Goldfields", "Rolf Boldrewood", "1826 – 1915", "Australia", "Oceania", "English", "Mystery & Adventure", 1888, "19th Century", "Intermediate", "🤠", 407, 180000,
     "The classic Australian bushranging adventure told by Dick Marston awaiting execution, recounting cattle-duffing and gold-escort raids with Captain Starlight.",
     ["Bushranging and Cattle-Duffing", "Captain Starlight", "Goldfields of Victoria", "Frontier Justice and Regret"],
     "Awaiting the End", "My name's Dick Marston, and I'm sitting here in the condemned cell of Berrima Gaol, waiting to be hanged. I'll tell my whole story straight, without excuses.", None, "en"),
    ("we-of-the-never-never-mrs-gunn", "We of the Never-Never", "Jeannie Gunn", "1905 – 1961", "Australia", "Oceania", "English", "Geography & Exploration", 1908, "Early 20th Century", "Intermediate", "☀️", 2599, 85000,
     "A vivid pioneer memoir of life on the remote Elsey cattle station in the Northern Territory Never-Never country.",
     ["Northern Territory Outstation", "Cattle Station Life", "Isolation of the Outback", "Bush Fellowship"],
     "The Journey Inwards", "Out from the towns and off the railhead we rode, deep into the great sunlit spaces of the Never-Never, where cattle graze across hundreds of miles of open plains.", None, "en")
]

NEW_ZEALAND_BOOKS = [
    ("the-garden-party-katherine-mansfield", "The Garden Party and Other Stories", "Katherine Mansfield", "1888 – 1923", "New Zealand", "Oceania", "English", "World Literature", 1922, "Early 20th Century", "Intermediate", "👒", 1429, 68000,
     "Mansfield's modernist masterpiece of delicate psychological observation and class awareness in colonial Wellington.",
     ["Class Barriers and Innocence", "Modernist Epiphany", "Colonial Wellington Life", "Youth and Mortality"],
     "The Garden Party", "And after all the weather was ideal. They could not have had a more perfect day for a garden-party if they had ordered it. Windless, warm, the sky without a cloud. Only the blue was veiled with a haze of light gold.", None, "en"),
    ("bliss-and-other-stories-mansfield", "Bliss and Other Stories", "Katherine Mansfield", "1888 – 1923", "New Zealand", "Oceania", "English", "World Literature", 1920, "Early 20th Century", "Advanced", "🍐", 1442, 62000,
     "The collection that established Mansfield alongside Chekhov and Woolf as a supreme master of the modernist short story.",
     ["Psychological Nuance", "Marriage and Alienation", "The Pear Tree Epiphany", "Aesthetic Modernism"],
     "Bliss: Bertha Young", "Although Bertha Young was thirty, she still had moments like this when she wanted to run instead of walk, to take dancing steps on and off the pavement, to bowl a hoop, to throw something up in the air and catch it again.", None, "en"),
    ("station-life-in-new-zealand-lady-barker", "Station Life in New Zealand", "Lady Mary Anne Barker", "1831 – 1911", "New Zealand", "Oceania", "English", "Geography & Exploration", 1870, "19th Century", "Intermediate", "🐑", 2824, 75000,
     "A delightful, spirited series of letters describing sheep farming, snowstorms, and wild boar hunts on a Canterbury high country station.",
     ["Canterbury High Country", "Sheep Station Management", "Alpine Snowstorms", "Colonial Hospitality"],
     "First Impressions of Canterbury", "I must begin my station life journal by describing our voyage out and our arrival in Christchurch, where the wide plains stretch away toward the snow-capped Southern Alps.", None, "en"),
    ("myths-and-legends-of-the-polynesians-andersen", "Myths and Legends of the Polynesians", "Johannes C. Andersen", "1873 – 1962", "New Zealand", "Oceania", "English & Maori", "World Literature", 1928, "Early 20th Century", "Intermediate", "🛶", 26161, 120000,
     "A comprehensive, scholarly compilation of Polynesian voyage lore, Maui the trickster, fire-bringing, and Maori sacred cosmogony.",
     ["Maui and the Sun", "Polynesian Voyaging Lore", "Maori Cosmogony and Tangaroa", "Pacific Oral Mythology"],
     "The Legend of Maui-Tikitiki", "Maui was the youngest of five brothers, an offspring cast into the sea-foam by his mother, preserved by the jellyfish and sea spirits until he grew to manhood endowed with magical powers.", None, "en")
]

print(f"Loaded Part 1 components: US ({len(US_BOOKS)}), UK ({len(UK_BOOKS)}), France ({len(FRANCE_BOOKS)}), Germany ({len(GERMANY_BOOKS)}), Canada ({len(CANADA_BOOKS)}), Australia ({len(AUSTRALIA_BOOKS)}), New Zealand ({len(NEW_ZEALAND_BOOKS)})")
