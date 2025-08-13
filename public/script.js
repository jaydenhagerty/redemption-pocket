import { CACHE_NAME } from "./service-worker.js";
let STATUS = "opening pack";
let myCards = [];
let myFavourites = [];
let myCardsArchive = myCards;
let currentCard = null;
let gold = 0;
let gems = 0;
const starterCooldown = 5 * 60 * 1000; // 5 minutes
let xpLevel = 1;
let firstPack = false;
let rarityList = [
  "Starter",
  "Common",
  "Rare",
  "Uncommon",
  "Fixed",
  "Deck",
  "",
  "Promo",
  "Ultra Rare",
  "Legacy Rare",
  "Seasonal",
  "National",
  "Token",
  "Regional",
  "State",
  "National, Winner",
  "R",
  "Winner",
];

const tier1 = ["Rare", "Uncommon", "Fixed", "Promo", "Deck"];
const tier2 = ["Ultra Rare", "Ultra-Rare", "Legacy Rare"];
const tier3 = [
  "Token",
  "Regional",
  "State",
  "National, Winner",
  "R",
  "Winner",
  "National",
  "Seasonal",
];

let availablePacks = [
  {
    name: "Starter Pack", // Rough pack value: 100
    description: "10 Starter cards",
    moreInfo: "",
    generate: generateStarterPack,
    price: 0,
  },
  {
    name: "Classic Pack", // Rough pack value: 420, aka a 4.2 multiplier
    description: "10 random cards of any rarity",
    moreInfo: "",
    generate: generateClassicPack,
    price: 100,
  },
  {
    name: "Rare Pack", // Rough pack value: 700, aka a 2.8 multiplier
    description: "Contains at least 3 Rare cards",
    moreInfo:
      "10 total cards<br>3 guaranteed <b>Rare</b> cards<br>No <b>Starter</b> cards",
    generate: generateRarePack,
    price: 250,
  },
  {
    name: "Ultra Rare Pack",
    description: "Contains at least 1 Ultra rare",
    moreInfo:
      "5 total cards<br>1 guaranteed <b>Ultra Rare</b><br>No <b>Starter</b> or <b>Common</b> cards",
    generate: generateUltraRarePack,
    price: 500,
  },
  {
    name: "Legacy Rare Pack",
    description: "Contains a Legacy Rare or better",
    moreInfo:
      "3 total cards<br>1 guaranteed <b>Legacy Rare</b> or better<br>No <b>Starter</b>, <b>Common</b>, or <b>Rare</b> cards",
    generate: generateLegacyRarePack,
    price: 1000,
  },
];

let coolCards = [
  "A Child is Born",
  "A New Beginning",
  "Aaron (G)",
  "Aaron's Rod (G)",
  "Abel ( C)",
  "Abishai, Chief of Thirty",
  "Andrew (I)",
  "Angel at Jerusalem (Roots)",
  "Angel of God [2023 - National]",
  "Angel of the Lord (2017 Promo)",
  "Angel of the Lord (2020 Promo)",
  "Angel of the Lord (Promo 2018)",
  "Ark of the Covenant [2024 - Winner]",
  "Authority of Christ (GoC UR+)",
  "Babel (FoM)",
  "Bad Intentions",
  "Baptism",
  "Barnabas (D)",
  "Beelzebub (GoC)",
  "Beelzebub [UR+] (GoC)",
  "Belt of Truth (Ki)",
  "Bethlehem (Promo)",
  "Blood of the Lamb (H)",
  "Book of the Covenant",
  "Breastplate of Righteousness (Ki)",
  "Caleb (Promo)",
  "Captain of the Host [II]",
  "Casting Lots (Roots)",
  "Chariot of Fire (Roots)",
  "Cherubim (Roots)",
  "Christian Soldier ( C)",
  "Coat of Many Colors (FoM)",
  "Consider the Lilies (Roots)",
  "Cornelius ( C)",
  "Creation of the World (Roots)",
  "Crowd's Choice [Fundraiser]",
  "Crucify Him! (J)",
  "Damascus (Promo)",
  "Daniel's Prayer (Promo)",
  "Daniel, the Apocalyptist (PoC)",
  "David's Harp (Promo)",
  "David's Triumph (LoC)",
  "David, Giant Slayer [Fundraiser]",
  "Deborah, the Brave (Roots)",
  "Defenestrated! (Roots)",
  "Delilah (I)",
  "Dove",
  "Eli the Priest (Promo)",
  "Elijah",
  "Emperor Augustus (Promo)",
  "Esau, the Hunter (Promo)",
  "Esther (Promo)",
  "Father Abraham / Faithful Abraham (LoC)",
  "Fishers of Men (I)",
  "Five Smooth Stones (Roots)",
  "Fruitless Tree",
  "Gabriel, Mouth of God [UR+] (GoC)",
  "Garden of Eden",
  "Gideon (J)",
  "Gifts of the Magi",
  "Glad Tidings",
  "God's Animals",
  "Golgotha [2022 - GoC P]",
  "Goliath (LoC)",
  "Guardian of Your Souls [2024 - 1st Place]",
  "Haman (Promo)",
  "Haman's Plot (Roots)",
  "He is Risen (GoC)",
  "Heavenly Host Token",
  "Helmet of Salvation (Ki)",
  "His Sacrifice (GoC UR+)",
  "I Am Creator (Roots)",
  "I Am Redemption (Roots)",
  "Jacob (D)",
  "James",
  "Jeremiah (D)",
  "Joab (Promo)",
  "Job  (Promo)",
  "Job's Faith (Roots)",
  "Job's Wife ( C)",
  "John (I)",
  "John (Promo)",
  "Jonathan, son of Joiada",
  "Joseph in Prison (Roots)",
  "Joshua",
  "Journey to Egypt (Roots)",
  "Jude",
  "King Cushan-Rishathaim (Roots)",
  "King David",
  "King Hiram (Roots)",
  "King Lemuel (Roots)",
  "King Sargon II (Roots)",
  "King Solomon (Promo)",
  "King Zedekiah (Roots)",
  "King Zimri (Roots)",
  "King of Tyrus (2022 - 1st Place)",
  "King of Tyrus (Wa)",
  "Legion of Angels",
  "Lost Soul Token OT (Majestic Heavens)",
  "Lot's Wife (FoM)",
  "Love of Jesus",
  "Lydia (H)",
  "Malakh the Nameless [2023 - State]",
  "Mark (D)",
  "Mary (UL)",
  "Mary's Prophetic Act (Roots)",
  "Michael (2017 Promo)",
  "Michael (Ki)",
  "Michael, Chief Prince",
  "Michael, Dragon Slayer [Fundraiser]",
  "Michael, the Archangel (RoJ AB)",
  "Miraculous Catch (I)",
  "Miriam (G)",
  "Moses (G)",
  "Moses (Promo)",
  "Moses' Rod",
  "Music Leader (2022 - Worker)",
  "New Jerusalem (2019) (Promo)",
  "New Jerusalem (Nats Promo)",
  "Nicodemus, the Seeker / Nicodemus, the Teacher (2022 - National)",
  "Nicolas of Antioch (Promo)",
  "Noah's Ark (Promo)",
  "Obedience of Noah (FoM)",
  "Paul (Promo)",
  "Peter's Lie",
  "Pharaoh (H)",
  "Pharaoh, Ramses II [Fundraiser]",
  "Pontius Pilate (2022 - State)",
  "Pontius Pilate (Di)",
  "Prince of Tyrus (Promo)",
  "Protection of Angels (Roots)",
  "Rachel, the Favored (Roots)",
  "Raising Lazarus",
  "Reach of Desperation (GoC)",
  "Red Dragon (RoJ AB)",
  "Red Dragon [Fundraiser]",
  "Reuben",
  "Romans Destroy Jerusalem (GoC)",
  "Root of Jesse (Promo)",
  "Ruth (J)",
  "Ruth Meets Boaz (J)",
  "Sadducees (GoC)",
  "Samson (Promo)",
  "Samson's Strength (J)",
  "Samson, Son of Manoah [2025 - State]",
  "Samuel (RoA)",
  "Saul of Tarsus [2022 - Seasonal]",
  "Seraph (PoC)",
  "Seven Years of Famine",
  "Seven Years of Plenty",
  "Shoes of Peace (Promo)",
  "Sign of the Rainbow",
  "Silas (D)",
  "Simon the Zealot (Di)",
  "Son of God (2019) (Promo)",
  "Son of God (J)",
  "Son of God [2023 - 1st Place]",
  "Son of God [Fundraiser]",
  "Son of God [Tomb] [2022 - Seasonal]",
  "Star of Bethlehem [Fundraiser]",
  "Steadfastness of Peter ( C)",
  "Striking Herod (GoC)",
  "Sword of the Spirit (UL)",
  "Tabitha (F)",
  "Tenants Kill the Son",
  "Thaddeus",
  "The Angel of the Winds (Promo)",
  "The Cross (GoC UR+)",
  "The Devourer (Roots)",
  "The Empty Tomb (GoC)",
  "The Entrapping Pharisee (GoC)",
  "The Fall of Man",
  "The Garden Tomb",
  "The Gates of Hell (GoC)",
  "The Gates of Hell [2024 - 2nd Place]",
  "The New Covenant",
  "The Prodigal Returns (Roots)",
  "The Queen of Sheba (Roots)",
  "The Second Coming (CoW AB)",
  "The Second Seal (Roots)",
  "The Wages of Sin (FoM)",
  "Three Woes (RoJ AB)",
  "Timothy (H)",
  "Titus, the Messenger (Roots)",
  "Tree of Knowledge (FoM)",
  "Voice from Heaven (GoC)",
  "Walking on Water (I)",
  "War in Heaven",
  "Water to Wine (I)",
  "Water to Wine (Promo)",
  "You Are the Christ",
  "Zebulun",
  "Zechariah (RoA)",
];

// JS DOM elements
let cardCountText = document.getElementById("card-count");
let rarityDisplayText = document.getElementById("rarity-display");
let typeDisplayText = document.getElementById("type-display");
let appContent = document.getElementById("app-content");
let cardInfoDiv = document.getElementById("card-info");
let cardOptionsDiv = document.getElementById("card-options");
let packWrapperDiv = document.getElementById("pack-wrapper");
let packOpenPage = document.getElementsByClassName("pack-open")[0];
let myDeckPage = document.getElementById("my-deck");
let packOpenButton = document.getElementById("pack-open-button");
let navBar = document.getElementById("nav-bar");
window.navBar = navBar;
let packsPage = document.getElementById("packs-page");
let profilePage = document.getElementById("profile-page");
let navBarDeckButton = document.getElementById("nav-bar-deck");
let navBarPacksButton = document.getElementById("nav-bar-packs");
let navBarProfileButton = document.getElementById("nav-bar-profile");
let cardTitle = document.getElementById("card-title");
let backButton = document.getElementById("back-button");
let optionsMenu = document.getElementById("options-menu");
let sortMenu = document.getElementById("sort-menu");
let optionsButton = document.getElementById("options-button");
let sortButton = document.getElementById("sort-button");
let screenHeader = document.getElementById("screen-header");
let tradeMenu = document.getElementById("trade-menu");
let mergeMenu = document.getElementById("merge-menu");
let tradeCardPreview = document.getElementById("trade-card-preview");
let mergeCardPreview = document.getElementById("merge-card-preview");
let goldRewardText = document.getElementById("gold-reward");
let gemRewardText = document.getElementById("gem-reward");
let tradeButton = document.getElementById("trade-button");
let mergeButton = document.getElementById("merge-button");
let valueDisplay = document.getElementById("value-display");
let availablePacksDiv = document.getElementById("available-packs");
let tutorialInfo = document.getElementById("tutorial-info");
let resultSummaryText = document.getElementById("result-summary-text");
let resultValueText = document.getElementById("result-value-text");
let resultBonusText = document.getElementById("result-bonus-text");
let dailyOffersDiv = document.getElementById("daily-offers");
let progressBarFill = document.getElementById("progress-bar-fill");
let xpStatusText = document.getElementById("xp-status");
let xpDisplay = document.getElementById("xp-display");
let cardCatalogue = document.getElementById("card-catalogue");
let levelDisplay = document.getElementById("level-display");
let tutorialCircle = document.getElementById("tutorial-circle");
let tutorialText = document.getElementById("tutorial-text");
let dailyRewardStatus = document.getElementById("daily-reward-status");

function parseCardData(data) {
  const rows = data.split(/\r?\n/); // rows are separated by \r\n
  const cardInfo = rows.map((row) => row.split("\t")); // each row is split into columns by \t
  cardInfo.shift(); // remove the first row (header)

  document.getElementById("version-display").innerHTML =
    `Version: ${CACHE_NAME}`;

  const cards = cardInfo.map((row) => {
    let rarity = row[11];
    if (rarity === "Ultra-Rare") {
      rarity = "Ultra Rare";
    }
    return {
      name: row[0],
      set: row[1],
      imageFile: row[2],
      officialSet: row[3],
      type: row[4],
      brigade: row[5],
      strength: row[6],
      toughness: row[7],
      class: row[8],
      identifier: row[9],
      specialAbility: row[10],
      rarity: row[11],
      reference: row[12],
      sound: row[13],
      alignment: row[14],
      legality: row[15],

      favourite: false,
    };
  });

  return cards;
}

let cards;
async function loadCards() {
  const response = await fetch("carddata.txt");
  const text = await response.text();
  cards = await parseCardData(text);
  showOffers(); // Also load the daily offers
  //   rarityList = rarityOrder(cards);
  console.log(rarityOrder(cards));
}
loadCards();

const observer = new IntersectionObserver(
  (entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute("data-src");
        // img.classList.add("ui-smooth-3");
        img.onload = function () {
          if (img.parentElement.parentElement.id === "card-list") {
            document.getElementById("loading-text").style.display = "none";
          }
        };
        obs.unobserve(img);
      }
    });
  },
  {
    root: null,
    rootMargin: "0px 0px 100px 0px",
    threshold: 0.1,
  }
);

function randomCardWithRarity(rarity) {
  const filteredCards = cards.filter((card) => card.rarity === rarity);
  const randomIndex = Math.floor(Math.random() * filteredCards.length);
  return filteredCards[randomIndex];
}

function randomCardWithoutRarities(unwantedRarities) {
  const filteredCards = cards.filter(
    (card) => !unwantedRarities.includes(card.rarity)
  );
  const randomIndex = Math.floor(Math.random() * filteredCards.length);
  return filteredCards[randomIndex];
}

function randomCard() {
  const randomIndex = Math.floor(Math.random() * cards.length);
  return cards[randomIndex];
}

function countByRarity(rarity) {
  return cards.filter((card) => card.rarity === rarity).length;
}

// Rarity tracking

const rarityAliases = {
  "Ultra Rare": "Ultra Rare",
  "Ultra-Rare": "Ultra Rare",
  // Add more aliases if needed
};

function countRarities(arr) {
  const counts = {};
  for (const { rarity } of arr) {
    const key = rarityAliases[rarity] || rarity;
    counts[key] = (counts[key] || 0) + 1;
  }
  return counts;
}

// Rank rarities by their frequency in the given array
// Count Ultra Rare and Ultra-Rare as the same rarity
// If "Starter" is present, it should be first in the list
function rarityOrder(arr) {
  const counts = {};

  for (const { rarity } of arr) {
    const key = rarityAliases[rarity] || rarity;
    counts[key] = (counts[key] || 0) + 1;
  }

  const entries = Object.entries(counts)
    .filter(([rarity]) => rarity !== "Starter")
    .sort((a, b) => b[1] - a[1]);

  if ("Starter" in counts) {
    return ["Starter", ...entries.map(([rarity]) => rarity)];
  } else {
    return entries.map(([rarity]) => rarity);
  }
}
window.rarityOrder = rarityOrder;

function sortByRarity(arr) {
  const rarityPriority = Object.fromEntries(rarityList.map((r, i) => [r, i]));

  return [...arr]
    .sort((a, b) => {
      const ra = rarityAliases[a.rarity] || a.rarity;
      const rb = rarityAliases[b.rarity] || b.rarity;
      return rarityPriority[ra] - rarityPriority[rb];
    })
    .reverse();
}

let viewIndex = 0;
let packImages = [];
let newDuplicateCounter;
function getCards(cardArray, direction = null) {
  let pack = [];
  viewIndex = 0;
  newDuplicateCounter = 0;
  // console.log("Showing this many cards at once: ", cardArray.length);
  packImages = [];
  let main = document.createElement("div");
  main.classList.add("main");
  main.classList.add("card-reveal");
  main.id = "card-reveal";
  if (direction !== null) {
    // If direction is specified, set the class for the main div
    main.classList.add(`slide-${direction}`);
  }
  let index = 0;
  while (packImages.length < cardArray.length) {
    let cardImage = document.createElement("img");
    const card = cardArray[index];
    pack.push(card);
    if (STATUS === "opening pack" /* && !myCards.includes(card)*/) {
      if (myCards.includes(card)) {
        newDuplicateCounter++;
      }
      myCards.unshift(card);
      updateSave();
    }
    // let cardImageFile = card.imageFile.replace(/\.jpg$/, ""); // account for the fact that sometimes there's an extra .jpg for some goofy reason
    // cardImage.src = `https://raw.githubusercontent.com/thejambi/RedemptionLackeyCCG/latest/RedemptionQuick/sets/setimages/general/${cardImageFile}.jpg`;
    // cardImage.style.zIndex = cardArray.length - index;
    // cardImage.style.position = "absolute";
    // cardImage.classList.add("card");
    // cardImage.classList.add("card-reveal-image");
    // cardImage.draggable = false;
    const cardImageFile = card.imageFile.endsWith(".jpg")
      ? card.imageFile.slice(0, -4)
      : card.imageFile;

    cardImage.src = `https://raw.githubusercontent.com/thejambi/RedemptionLackeyCCG/latest/RedemptionQuick/sets/setimages/general/${cardImageFile}.jpg`;

    Object.assign(cardImage.style, {
      zIndex: cardArray.length - index,
      position: "absolute",
    });

    cardImage.classList.add("card", "card-reveal-image");
    cardImage.draggable = false;

    cardImage.onclick = function () {
      this.style.pointerEvents = "none";

      cardTransition(this);
      packImages.shift();
      if (packImages.length > 0) {
        packImages[0].style.pointerEvents = "all";
      }
      if (STATUS != "packs page" && STATUS != "opening pack") {
        if (myCardsArchive != myCards) {
          myCardsArchive = myCards;
          cardList();
        } else {
          // document.getElementById("card-list").style.display = "grid";
          document.getElementById("my-deck").style.display = "block";
        }
        this.parentElement.style.pointerEvents = "none";
      }
      if (viewIndex >= pack.length - 1) {
        document.getElementById("background").style.backdropFilter = "";
        if (STATUS != "opening pack") {
          navBar.style.height = "100px";
        }
      }

      // This is literally such a mess, please clean this up
      setTimeout(() => {
        if (viewIndex < pack.length - 1) {
          viewIndex++;
          cardInfo(pack[viewIndex]);
        } else {
          // User has clicked through all cards
          main.style.pointerEvents = "none";
          if (STATUS === "opening pack") {
            setTimeout(() => {
              // newCardsAnimation(pack);
              getFullCardList(pack);
              showFullCardList();
            }, 100);
            setTimeout(() => {
              STATUS = "animation";
            }, 500);
          }
          setTimeout(() => {
            this.parentElement?.remove();
            pack = [];
          }, 1500);
        }
      }, 500);
      setTimeout(() => {
        this.remove();
      }, 2500);
    };

    let startX = 0;
    let startY = 0;
    let endX = 0;
    let endY = 0;

    cardImage.addEventListener("touchstart", (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    });

    cardImage.addEventListener("touchend", (e) => {
      endX = e.changedTouches[0].clientX;
      const deltaX = endX - startX;

      if (Math.abs(deltaX) > 50 && STATUS !== "opening pack") {
        // document.getElementById("screen-header").click();
        // Minimum swipe distance
        if (deltaX > 0) {
          swipeCard("right");
        } else {
          swipeCard("left");
        }
      }
    });

    filterCardList("All cards");

    index++;
    packImages.push(cardImage);
  }

  appContent.appendChild(main);
  packImages.forEach((cardImage) => {
    main.appendChild(cardImage);
  });

  console.log("Displaying cards:", pack);
  //   if (STATUS === "opening pack") {
  // setTimeout(() => {
  //   getFullCardList(pack);
  // }, 10);
  //   }
  // Set the first image to be clickable, if it exists
  if (packImages.length > 0) {
    packImages[0].style.pointerEvents = "all";
  }
  return main;
}

function showCards(container) {
  packOpenPage.style.display = "none";
  container.style.display = "grid";
  navBar.style.height = "0";
  //   console.log(document.getElementsByClassName("card-reveal").length);
}

function swipeCard(direction) {
  if (STATUS === "opening pack") {
    return;
  }
  const myCardsSorted = sortCardList(sortType);
  let swipeDirection = direction === "left" ? 1 : -1;
  let nextCardIndex = myCardsSorted.indexOf(currentCard) + swipeDirection;
  if (nextCardIndex < 0 || nextCardIndex >= myCardsSorted.length) {
    // If the next card index is out of bounds, do nothing
    console.log("No more cards to swipe in that direction.");
    return;
  }

  let swipedCard =
    document.getElementsByClassName("card-reveal-image")[
      document.getElementsByClassName("card-reveal-image").length - 1
    ];
  console.log("My cards sorted:", myCardsSorted);
  let nextCard = myCardsSorted[nextCardIndex];
  currentCard = nextCard;

  cardTransition(swipedCard, direction);

  showCards(getCards([nextCard], direction));
  cardInfo(nextCard);
  displayCardOptions(true);
  currentCard = nextCard;
  document.getElementById("my-deck").style.display = "none";
  setTimeout(() => {
    document.activeElement.blur();
    document.getElementById("screen-header").click();
  }, 500);
}

function cardTransition(card, direction = null) {
  if (card != undefined) {
    if (direction == null) {
      if (STATUS === "opening pack") {
        card.classList.add("animate-away");
      } else {
        displayCardOptions(false);
        card.classList.add("animate-away-2");
      }
      rarityDisplayText.classList.remove("glow");
      displayCardInfo(false);
    } else if (STATUS !== "opening pack") {
      // Swipe left or right
      if (direction === "left") {
        card.classList.add("swipe-left");
      } else if (direction === "right") {
        card.classList.add("swipe-right");
      }
      setTimeout(() => {
        card.parentElement.remove();
      }, 500);
    }
  }
}

function cardInfo(card) {
  // Set info correctly
  rarityDisplayText.innerHTML = card.rarity;
  typeDisplayText.innerHTML = card.type;
  valueDisplay.innerHTML = getCardPrice(card) || "0";
  if (isPriceSurged(card)) {
    document
      .getElementById("card-price-display")
      .classList.add("text-price-surged");
    document.getElementById("card-price-display").onclick = function () {
      alert(
        `This card is in high demand today! The price has surged to ${getCardPrice(
          card
        )} gold.`
      );
    };
  } else {
    document
      .getElementById("card-price-display")
      .classList.remove("text-price-surged");
    document.getElementById("card-price-display").onclick = null;
  }
  //   cardTitle.innerHTML = card.name.replace(/\s*\([^)]*\)/g, "").trim();
  // document.getElementById("alignmentDisplay").innerHTML = card.alignment;
  // document.getElementById("verseDisplay").innerHTML = card.reference;
  // Display it
  displayCardInfo(true);
  displayCardOptions(true);

  resetRareBackground();

  if (
    card.rarity === "Rare" ||
    card.rarity === "Uncommon" ||
    card.rarity === "Fixed" ||
    card.rarity === "Promo" ||
    card.rarity === "Deck"
  ) {
    // Just make the text a bit bolder
    rarityDisplayText.style.fontWeight = "800";
  } else if (
    card.rarity === "Ultra Rare" ||
    card.rarity === "Ultra-Rare" ||
    card.rarity === "Legacy Rare"
  ) {
    // Glowing font, default rare background
    rarityDisplayText.classList.add("glow");
    if (packImages.length > 0) {
      packImages[0].classList.add("emphasize-card");
    }
    // document.getElementById("rare-background").style.opacity = "1";
    document.getElementById("background").style.backdropFilter =
      "brightness(0.1) hue-rotate(50deg)";
    cardInfoDiv.style.color = "white";
    rarityDisplayText.onclick = function () {
      showOdds(card);
    };
  } else if (
    card.rarity === "Token" ||
    card.rarity === "Regional" ||
    card.rarity === "State" ||
    card.rarity === "National, Winner" ||
    card.rarity === "R" ||
    card.rarity === "Winner" ||
    card.rarity === "National" ||
    card.rarity === "Seasonal"
  ) {
    // Glowing font and extremely dark background
    document.getElementById("background").style.backdropFilter =
      "brightness(0.1) hue-rotate(50deg)";
    cardInfoDiv.style.color = "white";
    if (packImages.length > 0) {
      packImages[0].classList.add("emphasize-card");
    }

    // document.getElementById("rare-background").style.opacity = "1";
    rarityDisplayText.classList.remove("glow");
    rarityDisplayText.classList.add("glow");
    rarityDisplayText.onclick = function () {
      showOdds(card);
    };
  }
}

function showOdds(card) {
  let count = countByRarity(card.rarity);
  alert(
    `There are ${count} cards with the rarity "${
      card.rarity
    }". You had a ${Number((100 * count) / cards.length).toPrecision(
      2
    )}% chance of getting a card of this rarity.`
  );
}

function resetRareBackground() {
  //   document.getElementById("rare-background").style.opacity = "0";
  rarityDisplayText.classList.remove("glow");
  rarityDisplayText.style.fontWeight = "600";
  document.getElementById("rare-background").style.background =
    "linear-gradient(to bottom right, var(--dark1), #7aa1ee)";
  rarityDisplayText.onclick = null;
  document.getElementById("background").style.backdropFilter = "";
  cardInfoDiv.style.color = "var(--main)";
  if (packImages.length > 0) {
    packImages[0].classList.remove("emphasize-card");
  }
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function generateStarterPack() {
  let pack = [];
  for (let i = 0; i < 10; i++) {
    pack.push(randomCardWithRarity("Starter"));
  }
  return pack;
}

function generateClassicPack() {
  let pack = [];
  for (let i = 0; i < 10; i++) {
    pack.push(randomCard());
  }
  return pack;
}

function generateRarePack() {
  let pack = [];
  for (let i = 0; i < 7; i++) {
    pack.push(randomCardWithoutRarities(["Starter"]));
  }
  pack.push(randomCardWithRarity("Rare"));
  pack.push(randomCardWithRarity("Rare"));
  pack.push(randomCardWithRarity("Rare"));
  return shuffleArray(pack);
}

function generateUltraRarePack() {
  let pack = [];
  for (let i = 0; i < 2; i++) {
    pack.unshift(randomCardWithoutRarities(["Starter", "Common"]));
  }
  pack.push(randomCardWithRarity("Ultra Rare"));
  pack = shuffleArray(pack);
  for (let i = 0; i < 2; i++) {
    pack.unshift(randomCardWithoutRarities(["Starter", "Common"]));
  }
  return pack;
}

function generateLegacyRarePack() {
  let pack = [];
  pack.push(randomCardWithoutRarities(["Starter", "Common", "Rare"]));
  pack.push(randomCardWithoutRarities(["Starter", "Common", "Rare"]));
  pack.push(
    randomCardWithoutRarities([
      "Starter",
      "Common",
      "Rare",
      "Uncommon",
      "Fixed",
      "Deck",
      "",
      "Promo",
      "Ultra Rare",
      "Ultra-Rare",
    ])
  );
  pack = shuffleArray(pack);
  return pack;
}

function purchasePack(pack) {
  packOpenPage.style.display = "grid";
  packsPage.style.display = "none";
  if (gold < pack.price) {
    packOpenButton.style.pointerEvents = "none";
    packOpenButton.style.filter = "grayscale(15%) brightness(0.8)";
  } else {
    packOpenButton.style.pointerEvents = "all";
    packOpenButton.style.filter = "grayscale(0%) brightness(1)";
  }
  packOpenButton.onclick = function () {
    if (gold < pack.price) {
      return;
    }
    STATUS = "opening pack";
    displayCardOptions(true);
    revealCards(pack.generate());
    gold -= pack.price;
    console.log("Purchased", pack.name);
    if (pack.name !== "Starter Pack") {
      packsPurchased++; // Don't count starter packs in this stat
      //   console.log("Packs purchased:", packsPurchased);
    } else {
      lastStarterPackTimestamp = Date.now();
      localStorage.setItem(
        "lastStarterPackTimestamp",
        lastStarterPackTimestamp
      );
      console.log(
        "Last starter pack timestamp updated:",
        lastStarterPackTimestamp
      );
    }
    updateSave();
  };
  displayCardOptions(true);
  if (pack.imageFile) {
    document.getElementById("pack-title").innerHTML =
      ` <img src="${pack.imageFile}" class="card card-preview-small">`;
  } else {
    document.getElementById("pack-title").innerHTML = pack.name;
  }
  document.getElementById("pack-description").innerHTML =
    pack.description +
    (pack.moreInfo
      ? "<br><br><p class='pack-more-info'>" + pack.moreInfo + "</p>"
      : "");

  if (pack.price === 0) {
    packOpenButton.innerHTML = "Open";
  } else {
    packOpenButton.innerHTML = "Purchase for " + addCommas(pack.price);
    let coinIcon = document.createElement("img");
    coinIcon.src = "Icons/gold.png";
    coinIcon.style.marginLeft = "5px";
    packOpenButton.appendChild(coinIcon);
  }
}

let newPack;
function revealCards(packArray) {
  if (
    localStorage.getItem("xpProgress") === "0" &&
    localStorage.getItem("xpLevel") === "1"
  ) {
    firstPack = true;
  }
  let main;
  packOpenButton.classList.add("button-clicked");
  packOpenButton.style.pointerEvents = "none";

  navBar.style.pointerEvents = "none";
  newPack = packArray;
  setTimeout(() => {
    main = getCards(newPack);
    document.getElementById("pack-wrapper").classList.add("destroy");
  }, 400);
  setTimeout(() => {
    showCards(main);
    displayNavBar(false);
  }, 900);
  setTimeout(() => {
    cardInfo(newPack[viewIndex]);
  }, 1100);
}

window.revealCards = revealCards;
function cardList() {
  console.log("REGENERATING DECK PAGE GRID");
  if (filterType === "Duplicates") {
    filterCardList("Duplicates");
    return; // Don't regenerate the deck page if we're showing duplicates
  }
  packsPage.scrollTop = 0;
  cardCountText.innerHTML = `${addCommas(myCards.length)} Cards`;
  STATUS = "viewing deck";
  // hide other stuff
  document.getElementById("full-card-list").style.display = "none";
  document.getElementById("card-catalogue").style.display = "none";
  // then go

  document.getElementById("card-list").style.display = "grid";

  document.getElementById("card-list").innerHTML = ""; // Clear the card list
  document.getElementById("my-deck").style.display = "block";

  const myCardsSorted = sortCardList(sortType);
  console.log("My cards sorted:", myCardsSorted);

  let count = 0;

  myCardsSorted.forEach((card) => {
    // if (count >= cardDisplayCap) return;
    let cardDiv = document.createElement("div");
    cardDiv.id = card.name;
    cardDiv.classList.add("card-flip-container");
    if (isPriceSurged(card)) {
      cardDiv.classList.add("card-price-surged");
    }

    let cardImage = document.createElement("img");
    let cardImageFile = card.imageFile.replace(/\.jpg$/, ""); // account for the fact that sometimes there's an extra .jpg for some goofy reason
    // cardImage.src = `https://raw.githubusercontent.com/thejambi/RedemptionLackeyCCG/latest/RedemptionQuick/sets/setimages/general/${cardImageFile}.jpg`;
    cardImage.setAttribute(
      "data-src",
      `https://raw.githubusercontent.com/thejambi/RedemptionLackeyCCG/latest/RedemptionQuick/sets/setimages/general/${cardImageFile}.jpg`
    );
    cardImage.classList.add("card");
    cardImage.classList.add("card-preview");
    // cardImage.classList.add("card-front");
    cardDiv.appendChild(cardImage);
    observer.observe(cardImage);

    // let cardBackImage = document.createElement("img");
    // cardBackImage.src = `https://raw.githubusercontent.com/thejambi/RedemptionLackeyCCG/latest/RedemptionQuick/cardback.jpg`;
    // cardBackImage.classList.add("card");
    // cardBackImage.classList.add("card-preview");
    // cardBackImage.classList.add("card-back");
    // cardDiv.appendChild(cardBackImage);

    document.getElementById("card-list").appendChild(cardDiv);
    cardImage.onclick = function () {
      // console.log("Clicked on card:", card.name);
      //   this.pointerEvents = "none"; // Disable pointer events to prevent multiple clicks
      showCards(getCards([card]));
      cardInfo(card);
      document.getElementById("my-deck").style.display = "none";
      currentCard = card;
    };
    count++;
  });
}
window.cardList = cardList;

function findDuplicates(arr) {
  const nameMap = new Map();

  // Count occurrences and keep references
  for (const obj of arr) {
    const name = obj.name;
    if (!nameMap.has(name)) {
      nameMap.set(name, { card: obj, amount: 1 });
    } else {
      nameMap.get(name).amount += 1;
    }
  }

  // Filter out non-duplicates
  return Array.from(nameMap.values()).filter((entry) => entry.amount > 1);
}

function filterCardList(filter) {
  console.log("filterCardList() called with filter:", filter);
  filterType = filter;

  if (filterType === "Duplicates") {
    // special stuff
    let duplicateList = document.getElementById("duplicate-list");
    document.getElementById("card-list").style.display = "none";
    duplicateList.innerHTML = ""; // Clear previous duplicates
    duplicateList.style.display = "flex";

    findDuplicates(myCards).forEach((duplicate) => {
      let div = document.createElement("div");
      div.classList.add("container-2");
      let img = document.createElement("img");
      img.classList.add("card");
      img.classList.add("mini-card");
      img.id = duplicate.card.name + " duplicate";
      let cardImageFile = duplicate.card.imageFile.replace(/\.jpg$/, ""); // account for the fact that sometimes there's an extra .jpg for some goofy reason
      img.src = `https://raw.githubusercontent.com/thejambi/RedemptionLackeyCCG/latest/RedemptionQuick/sets/setimages/general/${cardImageFile}.jpg`;

      div.appendChild(img);
      let p = document.createElement("b");
      p.innerHTML = `x${duplicate.amount}`;
      let button = document.createElement("button");
      button.classList.add("small-button");
      button.innerHTML = "Merge";
      button.onclick = function () {
        initMergeCard(duplicate.card, duplicate.amount);
      };
      div.appendChild(p);
      div.appendChild(button);
      duplicateList.appendChild(div);
    });
  } else {
    document.getElementById("card-list").style.display = "grid";
    document.getElementById("duplicate-list").style.display = "none";
  }
  sortCardList(sortType);

  // This all just highlights the selected filter option in the UI
  [...document.getElementById("filter-options").children].forEach((el) =>
    el.classList.remove("options-menu-selected")
  );
  const selectedElement = Array.from(
    document.getElementById("filter-options").children
  ).find((child) => {
    const firstChild = child.children[0];
    return firstChild && firstChild.innerHTML.trim() === filter;
  });
  selectedElement?.classList.add("options-menu-selected");
}

window.filterCardList = filterCardList;

function sortCardList(sort) {
  sortType = sort;
  localStorage.setItem("sortType", sort);

  // Clear all selection highlights
  [...document.getElementById("sort-options").children].forEach((el) =>
    el.classList.remove("options-menu-selected")
  );

  const selectedElement = Array.from(
    document.getElementById("sort-options").children
  ).find((child) => {
    const firstChild = child.children[0];
    return firstChild && firstChild.innerHTML.trim() === sort;
  });

  selectedElement?.classList.add("options-menu-selected");

  let filteredCards = myCards;
  if (filterType === "Favourites") {
    filteredCards = myFavourites;
  } else if (filterType === "Duplicates") {
    filteredCards = findDuplicates(myCards).map((d) => d.card);
    // console.log("Filtered cards for duplicates:", filteredCards);
  }

  if (sort === "Card name") {
    const alphabeticalMyCards = [...filteredCards].sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    reorderImages("card-list", alphabeticalMyCards);
    return alphabeticalMyCards;
  } else if (sort === "Bible verse") {
    const sortedByBibleOrder = sortByBiblicalOrder([...filteredCards]);
    reorderImages("card-list", sortedByBibleOrder);
    return sortedByBibleOrder;
  } else if (sort === "Rarity") {
    const sortedByRarity = sortByRarity([...filteredCards]);
    reorderImages("card-list", sortedByRarity);
    return sortedByRarity;
  } else {
    reorderImages("card-list", filteredCards);
    return filteredCards;
  }
}

window.sortCardList = sortCardList;

function sortByBiblicalOrder(arr) {
  const bibleBooks = [
    "Genesis",
    "Exodus",
    "Leviticus",
    "Numbers",
    "Deuteronomy",
    "Joshua",
    "Judges",
    "Ruth",
    "1 Samuel",
    "2 Samuel",
    "1 Kings",
    "2 Kings",
    "1 Chronicles",
    "2 Chronicles",
    "Ezra",
    "Nehemiah",
    "Esther",
    "Job",
    "Psalms",
    "Proverbs",
    "Ecclesiastes",
    "Song of Solomon",
    "Isaiah",
    "Jeremiah",
    "Lamentations",
    "Ezekiel",
    "Daniel",
    "Hosea",
    "Joel",
    "Amos",
    "Obadiah",
    "Jonah",
    "Micah",
    "Nahum",
    "Habakkuk",
    "Zephaniah",
    "Haggai",
    "Zechariah",
    "Malachi",
    "Matthew",
    "Mark",
    "Luke",
    "John",
    "Acts",
    "Romans",
    "1 Corinthians",
    "2 Corinthians",
    "Galatians",
    "Ephesians",
    "Philippians",
    "Colossians",
    "1 Thessalonians",
    "2 Thessalonians",
    "1 Timothy",
    "2 Timothy",
    "Titus",
    "Philemon",
    "Hebrews",
    "James",
    "1 Peter",
    "2 Peter",
    "1 John",
    "2 John",
    "3 John",
    "Jude",
    "Revelation",
  ];

  const romanMap = { I: "1", II: "2", III: "3" };

  const bookOrder = Object.fromEntries(bibleBooks.map((book, i) => [book, i]));

  function normalizeBookName(book) {
    const parts = book.trim().split(" ");

    // Fix common typo: "Psalm" → "Psalms"
    if (book.trim().toLowerCase() === "psalm") {
      return "Psalms";
    }

    // Convert Roman numeral prefix to number
    if (parts.length > 1 && romanMap[parts[0]]) {
      const normalized = romanMap[parts[0]] + " " + parts.slice(1).join(" ");
      if (normalized.toLowerCase() === "psalm") return "Psalms";
      return normalized;
    }

    return book.trim();
  }

  function parseReference(ref) {
    ref = ref.trim();

    // Match formats like "Revelation 6:2,4,5,8" or "John 3:16"
    let match = ref.match(
      /^([\dI]{0,3} ?[A-Za-z ]+?) (\d+):?([\d,]+)?(?:-\d+)?$/
    );
    if (!match) {
      throw new Error(`Invalid reference: "${ref}"`);
    }

    let [, rawBook, chapter, versePart] = match;
    let book = normalizeBookName(rawBook);

    let verse = 1; // default verse
    if (versePart) {
      // Take only the first verse number before any commas
      verse = parseInt(versePart.split(",")[0]);
    } else {
      // If no colon or verse, treat the chapter as verse and set chapter to 1
      verse = parseInt(chapter);
      chapter = 1;
    }

    if (!(book in bookOrder)) {
      throw new Error(`Unknown book: "${book}"`);
    }

    return [book, parseInt(chapter), verse];
  }

  let result = arr.sort((a, b) => {
    function safeParse(refObj) {
      try {
        if (!refObj.reference) throw new Error();
        const [book, chapter, verse] = parseReference(refObj.reference);
        return [bookOrder[book], chapter, verse];
      } catch {
        return [Infinity, Infinity, Infinity]; // Push to the end
      }
    }

    const [orderA, chapterA, verseA] = safeParse(a);
    const [orderB, chapterB, verseB] = safeParse(b);

    if (orderA !== orderB) return orderA - orderB;
    if (chapterA !== chapterB) return chapterA - chapterB;
    return verseA - verseB;
  });

  return result;
}

function reorderImages(containerId, sortedObjects) {
  if (filterType === "Duplicates") {
    // console.log("Sorted card for duplicates:", sortedObjects);
    const container = document.getElementById("duplicate-list");
    sortedObjects.forEach((obj) => {
      const img = document.getElementById(obj.name + " duplicate");
      if (img) {
        container.appendChild(img.parentElement);
      }
    });
    return;
  }
  const container = document.getElementById(containerId);
  [...container.children].forEach((el) => (el.style.display = "none"));
  sortedObjects.forEach((obj) => {
    const img = document.getElementById(obj.name);
    if (img) {
      container.appendChild(img);
      img.style.display = "block"; // Show the image
    }
  });
}

function removeDuplicatesOfObject(array, target) {
  const result = [];
  let found = false;

  for (const item of array) {
    if (JSON.stringify(item) === JSON.stringify(target)) {
      if (!found) {
        result.push(item);
        found = true;
      }
    } else {
      result.push(item);
    }
  }

  return result;
}

function getFullCardList(newCards) {
  document.getElementById("full-card-list").innerHTML = ""; // Clear the card list
  document.getElementById("card-catalogue").scrollTop = 0;

  let totalValue = 0;

  newCards.forEach((card) => {
    totalValue += getCardPrice(card) || 0;
    let cardImage = document.createElement("img");
    let cardImageFile = card.imageFile.replace(/\.jpg$/, ""); // account for the fact that sometimes there's an extra .jpg for some goofy reason
    //   cardImage.src = `https://raw.githubusercontent.com/thejambi/RedemptionLackeyCCG/latest/RedemptionQuick/sets/setimages/general/${cardImageFile}.jpg`;
    cardImage.setAttribute(
      "data-src",
      `https://raw.githubusercontent.com/thejambi/RedemptionLackeyCCG/latest/RedemptionQuick/sets/setimages/general/${cardImageFile}.jpg`
    );
    cardImage.classList.add("card");
    cardImage.classList.add("card-preview");
    document.getElementById("full-card-list").appendChild(cardImage);
    observer.observe(cardImage);
  });

  let duplicates = newDuplicateCounter;
  if (duplicates > 0) {
    resultSummaryText.innerHTML = `<b>+${
      newCards.length - duplicates
    } card${plural(
      newCards.length - duplicates
    )}</b> (+${duplicates} duplicate${plural(duplicates)})`;
  } else {
    resultSummaryText.innerHTML = `<b>+${newCards.length} card${plural(
      newCards.length - duplicates
    )}</b>`;
  }
  // resultValueText.innerHTML = `Total value: ${totalValue}`;
  console.log("Total value of this pack:", totalValue);
  let xpGain = Math.round(totalValue / 8);
  resultValueText.innerHTML = `<b>+${xpGain} XP</b> <img src="Icons/xp.png">`;

  setTimeout(() => {
    gainXP(xpGain);
  }, 500);

  document.getElementById("summary-container").appendChild(xpDisplay);

  if (newCards.length === myCards.length && gold === 0) {
    gold = 95;
    resultBonusText.innerHTML = `<b>+95</b> `;
  } else {
    document.getElementById("result-bonus-text-container").style.display =
      "none";
  }

  //   let missCount = -12;
  //   let missMax = 8;
  //   let cardCount = 0;
  //   console.log(
  //     "I will print extra misses once I've shown this many cards: ",
  //     myCards.length
  //   );
  //   cards.forEach((card) => {
  //     if (JSON.stringify(myCards).includes(JSON.stringify(card))) {
  //       cardCount++;
  //       if (cardCount >= myCards.length) {
  //         missCount = -20;
  //       } else {
  //         missCount = 0;
  //       }
  //       missMax = stringToNumberInRange(card.name);

  //       let cardDiv = document.createElement("div");
  //       cardDiv.classList.add("card-flip-container");

  //       let cardImage = document.createElement("img");
  //       let cardImageFile = card.imageFile.replace(/\.jpg$/, ""); // account for the fact that sometimes there's an extra .jpg for some goofy reason
  //       //   cardImage.src = `https://raw.githubusercontent.com/thejambi/RedemptionLackeyCCG/latest/RedemptionQuick/sets/setimages/general/${cardImageFile}.jpg`;
  //       cardImage.setAttribute(
  //         "data-src",
  //         `https://raw.githubusercontent.com/thejambi/RedemptionLackeyCCG/latest/RedemptionQuick/sets/setimages/general/${cardImageFile}.jpg`
  //       );
  //       cardImage.classList.add("card");
  //       cardImage.classList.add("card-preview");
  //       cardDiv.appendChild(cardImage);
  //       observer.observe(cardImage);

  //       if (newCards.includes(card)) {
  //         cardImage.classList.add("card-front");
  //         //
  //         let cardBackImage = document.createElement("img");
  //         cardImage.setAttribute(
  //           "data-src",
  //           `https://raw.githubusercontent.com/thejambi/RedemptionLackeyCCG/latest/RedemptionQuick/cardback.jpg`
  //         );
  //         cardBackImage.classList.add("card");
  //         cardBackImage.classList.add("card-preview");
  //         cardBackImage.classList.add("card-back");
  //         cardDiv.appendChild(cardBackImage);
  //         observer.observe(cardBackImage);
  //         cardDiv.classList.add("card-new");
  //       } else {
  //         cardDiv.classList.add("card-old");
  //         cardDiv.style.opacity = "0.5";
  //       }

  //       document.getElementById("full-card-list").appendChild(cardDiv);
  //       cardDiv.id = card.name;
  //     } else if (missCount < missMax) {
  //       let noCardImage = document.createElement("img");
  //       noCardImage.src = `https://raw.githubusercontent.com/thejambi/RedemptionLackeyCCG/latest/RedemptionQuick/cardback.jpg`;
  //       noCardImage.classList.add("card");
  //       noCardImage.classList.add("card-preview");
  //       noCardImage.classList.add("card-unknown");
  //       noCardImage.style.filter = "grayscale(100%)";
  //       noCardImage.style.opacity = "0.2";
  //       document.getElementById("full-card-list").appendChild(noCardImage);
  //       missCount++;
  //     }
  //   });
}

function countDuplicates(arr) {
  const seen = new Map();
  let duplicates = 0;

  for (const obj of arr) {
    const key = JSON.stringify(obj);
    seen.set(key, (seen.get(key) || 0) + 1);
  }

  for (const count of seen.values()) {
    if (count > 1) duplicates += count - 1;
  }

  return duplicates;
}

function showPacks() {
  availablePacksDiv.innerHTML = ""; // Clear the pack list
  availablePacks.forEach((pack) => {
    let packDiv = document.createElement("div");
    packDiv.classList.add("pack-option");
    let packInfo = document.createElement("div");
    packInfo.classList.add("pack-option-info");
    packInfo.innerHTML = `<h2>${pack.name}</h2><p>${pack.description}</p>`;
    packDiv.appendChild(packInfo);
    let packButton = document.createElement("button");

    if (pack.name === "Starter Pack") {
      // Only allow if enough time has passed since lastStarterPackTimestamp
      packButton.innerHTML = "Free";
      let now = Date.now();
      let lastTime =
        parseInt(localStorage.getItem("lastStarterPackTimestamp")) || 0;
      let canOpenStarter = now - lastTime > starterCooldown;
      if (!canOpenStarter) {
        packButton.disabled = true;
        packDiv.style.filter = "grayscale(15%) brightness(0.8)";
        packDiv.style.pointerEvents = "none";
        let timeLeft = Math.max(0, starterCooldown - (now - lastTime));
        let minutes = Math.floor(timeLeft / 60000);
        let seconds = Math.floor((timeLeft % 60000) / 1000);
        packInfo.innerHTML += `<p id="starter-cooldown" style="font-weight:bold;">Available in ${minutes}:${seconds.toString().padStart(2, "0")}</p>`; // TODO: make this update every second independently, so that showpacks doesn't need to be called every second
        setInterval(updateStarterPackCooldown, 1000);
      } else {
        packButton.disabled = false;
      }
    } else {
      let coinIcon = document.createElement("img");
      coinIcon.src = "Icons/gold.png";
      packButton.innerHTML = addCommas(pack.price);
      packButton.appendChild(coinIcon);
    }
    if (gold < pack.price && pack.price > 0) {
      packDiv.style.filter = "grayscale(15%) brightness(0.8)";
      packDiv.style.boxShadow = "none";
      //   packDiv.style.transform = "scale(0.95)";
      packDiv.style.pointerEvents = "none";
    }
    packDiv.appendChild(packButton);
    packButton.onclick = function () {
      purchasePack(pack);
      this.style.pointerEvents = "none";
    };
    if (pack.name == "Classic Pack") {
      let badge = document.createElement("div");
      badge.classList.add("badge");
      badge.innerHTML = "Recommended";
      packDiv.appendChild(badge);
    }
    availablePacksDiv.appendChild(packDiv);
  });
}

function updateStarterPackCooldown() {
  let now = Date.now();
  let lastTime =
    parseInt(localStorage.getItem("lastStarterPackTimestamp")) || 0;
  let canOpenStarter = now - lastTime > starterCooldown;
  if (canOpenStarter) {
    showPacks();
  }
  if (document.getElementById("starter-cooldown")) {
    let timeLeft = Math.max(0, starterCooldown - (now - lastTime));
    let minutes = Math.floor(timeLeft / 60000);
    let seconds = Math.floor((timeLeft % 60000) / 1000);
    document.getElementById("starter-cooldown").innerHTML =
      `Available in ${minutes}:${seconds.toString().padStart(2, "0")}`;
  }
}

function showOffers() {
  if (
    localStorage.getItem("xpProgress") === "0" &&
    localStorage.getItem("xpLevel") === "1"
  ) {
    document.getElementById("daily-offers-header").style.display = "none";
    return; // Don't show daily offers yet if this is the user's first time at the shop
  } else {
    document.getElementById("daily-offers-header").style.display = "block";
  }

  const today = new Date();
  const options = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  };
  let date = today.toLocaleDateString(undefined, options);

  let seed1 = `${date} first seed`;
  let seed2 = `${date} second seed`;
  let seed3 = `${date} third seed`;

  let card1 = cards.find(
    (card) =>
      card.name ===
      coolCards[stringToNumberInRange(seed1, 0, coolCards.length - 1)]
  );
  let card2 = cards.find(
    (card) =>
      card.name ===
      coolCards[stringToNumberInRange(seed2, 0, coolCards.length - 1)]
  );
  let card3 = cards[stringToNumberInRange(seed3, 0, cards.length - 1)];

  dailyOffersDiv.innerHTML = ""; // Clear the daily offers
  let multiplier = stringToNumberInRange(date, 4, 7);
  let dailyOffers = [
    { card: card1, price: getCardPrice(card1) * multiplier },
    { card: card2, price: getCardPrice(card2) * multiplier },
    { card: card3, price: getCardPrice(card3) * multiplier },
  ];

  dailyOffers.sort((a, b) => a.price - b.price);

  dailyOffers.forEach((offer) => {
    let cardDiv = document.createElement("div");
    let cardImg = document.createElement("img");
    let cardImageFile = offer.card.imageFile.replace(/\.jpg$/, ""); // account for the fact that sometimes there's an extra .jpg for some goofy reason
    cardImg.setAttribute(
      "src",
      `https://raw.githubusercontent.com/thejambi/RedemptionLackeyCCG/latest/RedemptionQuick/sets/setimages/general/${cardImageFile}.jpg`
    );

    cardDiv.classList.add("card-sale-container");

    cardImg.classList.add("card");
    cardImg.classList.add("card-preview");

    cardDiv.appendChild(cardImg);
    dailyOffersDiv.appendChild(cardDiv);

    let cardPriceDisplay = document.createElement("div");
    cardPriceDisplay.classList.add("card-price-display");
    cardPriceDisplay.classList.add("small-button");
    let cardPrice = offer.price;
    cardPriceDisplay.innerHTML = `<span class="card-price">${addCommas(
      cardPrice
    )}</span> <img src="Icons/gold.png">`;
    cardDiv.appendChild(cardPriceDisplay);

    if (gold < offer.price) {
      cardPriceDisplay.style.pointerEvents = "none";
      cardPriceDisplay.style.filter = "grayscale(15%) brightness(0.8)";
    }

    cardImg.onclick = function () {
      cardPriceDisplay.click();
    };

    cardPriceDisplay.onclick = function () {
      function singleCardPack() {
        return [offer.card];
      }

      let pack = {
        name: offer.card.name,
        description: offer.card.rarity + " card",
        generate: singleCardPack,
        price: offer.price,
        imageFile: cardImg.src,
      };

      purchasePack(pack);
    };
  });
}

function showFullCardList() {
  tutorialInfo.style.display = "block";
  cardTransition();
  displayCardInfo(false);
  displayCardOptions(false);
  document.getElementById("full-card-list").style.display = "grid";
  document.getElementById("card-catalogue").style.display = "block";
  resetRareBackground();
}

let skipAnimation;
async function newCardsAnimation(newCards) {
  skipAnimation = undefined;
  let filteredCards = cards.filter(
    (card) => myCards.includes(card) && newCards.includes(card)
  );
  // Assume that a full card list has already been prepped
  showFullCardList();
  resetRareBackground();
  // await new Promise((resolve) => setTimeout(resolve, 1500));
  for (const card of filteredCards) {
    if (skipAnimation) {
      break;
    }
    document.getElementById(card.name).scrollIntoView({
      behavior: "smooth", // Defines the transition animation: "auto" (default) or "smooth"
      block: "center", // Vertical alignment: "start", "center", "end", or "nearest" (default)
      inline: "center", // Horizontal alignment: "start", "center", "end", or "nearest" (default)
    });
    await new Promise((resolve) => setTimeout(resolve, 250));
    if (skipAnimation == undefined) {
      skipAnimation = false;
    }
    document.getElementById(card.name).classList.add("card-flip");

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  //   document.getElementById("full-card-list").childNodes.forEach((card) => {
  //     if (card.classList.contains("card-old")) {
  //       card.style.transition = "all 0.5s linear";
  //       card.style.opacity = "1";
  //       card.style.filter = "";
  //     }
  //   });
  // cardList();
  // navigate("deck");
}

function stringToNumberInRange(str, min = 0, max = 5) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  const range = max - min + 1;
  return min + (Math.abs(hash) % range);
}

document.body.onclick = function (event) {
  if (event.target !== optionsButton) {
    optionsMenu.style.display = "none";
  }
  if (
    event.target !== sortButton &&
    event.target.parentElement !== sortButton
  ) {
    // setTimeout(() => {
    sortMenu.style.display = "none";
    // }, 100);
  }
  if (STATUS == "animation") {
    // (tapped anywhere to continue)
    cardList();
    navigate("deck");
    myDeckPage.scrollTop = 0;
    document.getElementById("xp-container").appendChild(xpDisplay);
    if (firstPack) {
      setTimeout(() => {
        firstPack = false;
        tutorialSequence(tradeTutorial);
      }, 500);
    }
    return;
  }
};

let tradeTutorial = [
  {
    element: () => document.getElementsByClassName("card-flip-container")[0],
    text: "Tap on a card to view it.",
  },
  {
    element: () => document.getElementById("rarity-display"),
    text: "This is the card's rarity level.",
  },
  {
    element: () => document.getElementById("value-display").parentElement,
    text: "Rarer cards are generally worth more gold. However, card values are dynamic and change every day!",
  },
  {
    element: () => document.getElementById("options-button"),
    text: "Tap here for more options.",
  },
  {
    element: () => document.getElementById("options-menu").children[1],
    text: "You can earn gold by trading your cards!",
    direct: true,
  },
  {
    element: () => null,
    text: "Once you earn more gold, you can open even rarer packs! Good luck!",
    direct: true,
  },
];

async function tutorialSequence(tutorialArray) {
  for (const step of tutorialArray) {
    await setTutorialCircle(
      step.element(),
      step.text,
      step.direct !== undefined
    ); // wait for user click
  }
  tutorialCircle.style.display = "none"; // hide the circle after the tutorial
  tutorialText.style.display = "none"; // hide the text after the tutorial
}

function renderRedDot(x, y) {
  const dot = document.createElement("div");
  dot.style.position = "absolute";
  dot.style.left = `${x}px`;
  dot.style.top = `${y}px`;
  dot.style.width = "8px";
  dot.style.height = "8px";
  dot.style.backgroundColor = "red";
  dot.style.borderRadius = "50%";
  document.body.appendChild(dot);
}

let ready = true;
function setTutorialCircle(element, text = "", direct = false) {
  return new Promise((resolve) => {
    tutorialText.innerHTML = text;
    tutorialCircle.style.pointerEvents = "all";
    tutorialCircle.style.opacity = "0.8";
    tutorialText.style.opacity = "1";
    tutorialText.style.display = "block";
    tutorialCircle.style.display = "block";

    if (!element) {
      tutorialCircle.style.setProperty("background", "black", "important");
      tutorialCircle.onclick = function () {
        tutorialCircle.style.opacity = "0";
        tutorialCircle.style.pointerEvents = "none";
        tutorialText.style.opacity = "0";
        resolve();
      };
    } else {
      let elementRect = element.getBoundingClientRect();
      let x = elementRect.x + elementRect.width / 2;
      let y = elementRect.y + elementRect.height / 2;

      // console.log("Element Rect:", elementRect);
      // console.log("X:", x, "Y:", y);
      // renderRedDot(x, y);

      tutorialCircle.style.setProperty(
        "background",
        `radial-gradient(
          ellipse ${elementRect.width}px ${elementRect.height}px at ${x}px ${y}px,
          rgba(0, 0, 0, 0) 0%,
          rgba(0, 0, 0, 0) 80%,
          rgba(0, 0, 0, 1) 99%,
          rgba(0, 0, 0, 1) 100%
        )`,
        "important"
      );

      tutorialCircle.onclick = function () {
        if (!ready) return; // Prevent multiple clicks
        ready = false; // Reset ready state
        tutorialCircle.style.opacity = "0";
        tutorialCircle.style.pointerEvents = "none";
        tutorialText.style.opacity = "0";

        setTimeout(() => {
          if (direct) {
            element.click(); // if the step is direct, click the element immediately
          } else {
            document.elementFromPoint(x, y)?.click();
          }
          tutorialCircle.style.pointerEvents = "all";
        }, 10);
        setTimeout(() => {
          tutorialCircle.onclick = null;
          resolve();
          ready = true;
        }, 500);
      };
    }
  });
}

function gainXP(amount) {
  xpProgress += amount;
  let xpToNextLevel = Math.round(100 * 1.25 ** (xpLevel - 1));
  let percentage = (xpProgress / xpToNextLevel) * 100;
  // ensure percentage is between 0 and 100
  percentage = Math.min(Math.max(percentage, 0), 100);
  progressBarFill.style.width = `${percentage}%`;
  xpStatusText.innerHTML = `${xpProgress}/${xpToNextLevel} <b>XP</b> <img src="Icons/xp.png">`;
  if (xpProgress >= xpToNextLevel) {
    xpLevel++;
    let progressSave = xpProgress - xpToNextLevel;
    setTimeout(() => {
      xpProgress = 0;
      progressBarFill.style.width = "0%";
      gainXP(0);
    }, 1000);
    setTimeout(() => {
      gainXP(progressSave);
    }, 2000);
  }
  updateSave();
}

let counter = 0;
function clearSave() {
  //prompt the user to confirm
  if (
    confirm(
      "Are you sure you want to clear your save? This will delete all your cards."
    )
  ) {
    //clear the local storage
    localStorage.clear();
    //reload the page
    location.reload();
  } else {
    counter++;
  }

  if (counter >= 7) {
    myCards = cards;
  }
}

window.clearSave = clearSave;

function options() {
  optionsMenu.style.display = "flex";
  optionsMenu.style.opacity = "1";
  optionsMenu.style.filter = "blur(0px)";
  optionsMenu.style.transform = "scale(1)";
}

function sortOptions() {
  if (sortMenu.style.display === "flex") {
    sortMenu.style.display = "none";
  } else {
    sortMenu.style.display = "flex";
  }
}

window.options = options;
window.sortOptions = sortOptions;

function addCommas(number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function plural(num) {
  return num === 1 ? "" : "s";
}

function navigate(nav) {
  displayCardOptions(false);

  updateSave();

  displayNavBar(true);
  packOpenPage.style.display = "none";
  profilePage.style.display = "none";
  myDeckPage.style.display = "none";
  packsPage.style.display = "none";
  tutorialInfo.style.display = "none";
  if (nav === "deck") {
    myDeckPage.style.display = "block";
    packsPage.style.display = "none";
    STATUS = "viewing deck";
    navBarDeckButton.classList.add("selected");
    navBarPacksButton.classList.remove("selected");
    navBarProfileButton.classList.remove("selected");
    if (myCardsArchive != myCards) {
      myCardsArchive = myCards;
      cardList();
    }
    if (location.pathname == "/") {
      myDeckPage.scrollTop = 0;
      document.getElementById("deck-header").classList.remove("scrolled");
    }
  } else if (nav === "shop") {
    packWrapperDiv.classList.remove("destroy");
    packOpenButton.classList.remove("button-clicked");
    packsPage.style.display = "block";
    packOpenButton.style.pointerEvents = "auto";
    STATUS = "packs page";
    navBarDeckButton.classList.remove("selected");
    navBarPacksButton.classList.add("selected");
    navBarProfileButton.classList.remove("selected");
    showPacks();
    // if (location.pathname == "/shop") {
    //   packsPage.scrollTop = 0;
    //   document.getElementById("packs-header").classList.remove("scrolled");
    // }
  } else if (nav === "profile") {
    STATUS = "profile page";
    gainXP(0);
    navBarDeckButton.classList.remove("selected");
    navBarPacksButton.classList.remove("selected");
    navBarProfileButton.classList.add("selected");
    profilePage.style.display = "block";
    if (packsPurchased === 0) {
      // Don't show the daily reward if the user has yet to purchase a non starter pack
      document.getElementById("daily-reward-container").style.display = "none";
    } else {
      document.getElementById("daily-reward-container").style.display = "flex";
    }
  }

  // url stuff
  if (nav == "deck") {
    history.replaceState({ page: nav }, "", "/");
    screenHeader.innerHTML = "My Deck";
    backButton.onclick = function () {
      document
        .getElementsByClassName("card-reveal-image")
        [
          document.getElementsByClassName("card-reveal-image").length - 1
        ].click();
    };
  } else {
    history.replaceState({ page: nav }, "", "/" + nav);
    screenHeader.innerHTML = "";
    backButton.onclick = function () {
      navigate("shop");
    };
  }
}

window.navigate = navigate; // Make navigate function globally accessible

function displayCardInfo(show) {
  if (show) {
    cardInfoDiv.style.display = "flex";
    cardInfoDiv.style.opacity = "1";
    cardInfoDiv.style.filter = "blur(0px)";
    cardInfoDiv.style.transform = "scale(1)";
  } else {
    cardInfoDiv.style.opacity = "0";
    cardInfoDiv.style.filter = "blur(5px)";
    cardInfoDiv.style.transform = "scale(0.9)";
  }
}

function displayCardOptions(show, extra = "") {
  if (show) {
    if (STATUS === "opening pack") {
      backButton.style.display = "none";
    } else {
      backButton.style.display = "block";
    }
    if (STATUS === "packs page") {
      optionsButton.style.display = "none";
    } else {
      optionsButton.style.display = "block";
    }
    cardOptionsDiv.style.display = "flex";
    setTimeout(() => {
      cardOptionsDiv.style.opacity = "1";
      cardOptionsDiv.style.filter = "blur(0px)";
      cardOptionsDiv.style.transform = "translateY(0px)";
    }, 100);
  } else {
    cardOptionsDiv.style.opacity = "0";
    cardOptionsDiv.style.filter = "blur(5px)";
    cardOptionsDiv.style.transform = "translateY(-60px)";
    setTimeout(() => {
      cardOptionsDiv.style.display = "none";
    }, 200);
  }
}

function displayNavBar(show) {
  if (show) {
    navBar.style.height = "100px";
    navBar.style.pointerEvents = "auto";
  } else {
    navBar.style.height = "0px";
    navBar.style.pointerEvents = "none";
  }
}

function initTradeCard() {
  let goldReward = getCardPrice(currentCard);
  goldRewardText.innerHTML = "+" + goldReward;
  let cardImageFile = currentCard.imageFile.replace(/\.jpg$/, ""); // account for the fact that sometimes there's an extra .jpg for some goofy reason
  tradeCardPreview.src = `https://raw.githubusercontent.com/thejambi/RedemptionLackeyCCG/latest/RedemptionQuick/sets/setimages/general/${cardImageFile}.jpg`;
  tradeButton.onclick = function () {
    tradeCard();
    gold += goldReward;
    updateSave();
  };
  tradeMenu.style.display = "block";
}

window.initTradeCard = initTradeCard;
window.tradeMenu = tradeMenu;

function initMergeCard(card, amount) {
  currentCard = card;
  navBar.style.height = "0";
  document.getElementById("merge-count").innerHTML = `x${amount}`;
  let gemReward = rarityList.indexOf(currentCard.rarity) + 1; // 1 for common, 2 for uncommon, etc.
  if (currentCard.rarity === "Ultra-Rare") {
    gemReward = 8 + 1;
  }
  let multipliedGemReward = gemReward * amount; // eg, if there are 3 cards, that means 2 duplicates, so multiply by 2
  document.getElementById("merge-info").innerHTML =
    `Tip: A <b>${currentCard.rarity}</b> card is worth <b>${gemReward}</b> gems each.`;

  console.log(
    `That rarity index is: ${rarityList.indexOf(currentCard.rarity) + 1}`
  );
  gemRewardText.innerHTML = "+" + multipliedGemReward;
  let cardImageFile = currentCard.imageFile.replace(/\.jpg$/, ""); // account for the fact that sometimes there's an extra .jpg for some goofy reason
  mergeCardPreview.src = `https://raw.githubusercontent.com/thejambi/RedemptionLackeyCCG/latest/RedemptionQuick/sets/setimages/general/${cardImageFile}.jpg`;
  mergeButton.onclick = function () {
    mergeCard();
    gems += multipliedGemReward;
    updateSave();
  };
  mergeMenu.style.display = "block";
}

window.initMergeCard = initMergeCard;
window.mergeMenu = mergeMenu;

function favouriteCard() {
  if (JSON.stringify(myFavourites).includes(JSON.stringify(currentCard))) {
    myFavourites.splice(myFavourites.indexOf(currentCard), 1);
    console.log(
      `Card "${currentCard.name}" has been removed from favourites. Now you have ${myFavourites.length} favourite cards.`
    );
  } else {
    myFavourites.push(currentCard);
    console.log(
      `Card "${currentCard.name}" has been added to favourites. Now you have ${myFavourites.length} favourite cards.`
    );
  }
  updateSave();
}

window.favouriteCard = favouriteCard;

function isPriceSurged(card, customDate = undefined) {
  let date;
  const today = new Date();
  const options = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  };
  if (customDate == undefined) {
    date = today.toLocaleDateString(undefined, options);
  } else {
    date = customDate;
  }
  let seed = card.name + " " + date;
  let priceSurgeChance = stringToNumberInRange(seed, 0, 100);
  return priceSurgeChance === 1;
}

function getCardPrice(card, customDate = undefined) {
  let index = rarityList.indexOf(card.rarity.replace(/-/g, " "));
  let baseValue = (index + 3) ** 2;
  let nextBaseValue = (index + 4) ** 2;
  let range = nextBaseValue - baseValue - 1;
  //   if (tier2.includes(card.rarity)) {
  //     baseValue = 20;
  //   }
  //   if (tier3.includes(card.rarity)) {
  //     baseValue = 50;
  //   }

  const today = new Date();
  const options = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  };

  let date;
  if (customDate == undefined) {
    date = today.toLocaleDateString(undefined, options);
  } else {
    date = customDate;
  }
  let seed = card.name + " " + date;
  let seedValue = stringToNumberInRange(seed, 0, range);
  let priceSurge = 0;
  if (isPriceSurged(card)) {
    priceSurge = 100;
  }

  let goldReward = seedValue + baseValue + priceSurge;

  // console.log(`Card "${card.name}" is priced at ${goldReward} gold on ${date}`);
  // console.log(`Base value: ${baseValue}, Seed value: ${seedValue}`);
  // console.log(`Range: ${range}, Index: ${index}`);

  // testing
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const fullDate2 = tomorrow.toLocaleDateString(undefined, options);
  let seed2 = card.name + " " + fullDate2;
  let goldReward2 = stringToNumberInRange(seed2, 1, 25) + baseValue;
  // console.log(
  //   `Card "${card.name}" will be priced at ${goldReward2} gold tomorrow`
  // );

  return goldReward;
}

function canClaimDailyReward() {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0]; // "YYYY-MM-DD"
  const storedStr = lastRewardDate || "1800-08-01";
  return storedStr < todayStr;
}
window.canClaimDailyReward = canClaimDailyReward;

function claimDailyReward() {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0]; // "YYYY-MM-DD"

  if (canClaimDailyReward()) {
    lastRewardDate = todayStr;
    let reward = 100;
    gold += reward;
    // dailyRewardStatus
    updateSave();
  }
}

window.claimDailyReward = claimDailyReward;

function updateCountdown() {
  if (canClaimDailyReward()) {
    dailyRewardStatus.innerHTML = "Claim your daily reward!";
    document.getElementById("claim-daily-reward-button").style.display = "flex";
  } else {
    document.getElementById("claim-daily-reward-button").style.display = "none";
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setHours(24, 0, 0, 0); // Midnight next day

    const diff = tomorrow - now;

    const hours = String(Math.floor(diff / (1000 * 60 * 60))).padStart(2, "0");
    const minutes = String(Math.floor((diff / (1000 * 60)) % 60)).padStart(
      2,
      "0"
    );
    const seconds = String(Math.floor((diff / 1000) % 60)).padStart(2, "0");

    dailyRewardStatus.innerHTML = `Next reward in <b>${hours}:${minutes}:${seconds}</b>`;
  }
}

function getDayOfWeek() {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const date = new Date();
  return days[date.getDay()];
}

function tradeCard() {
  myCards.splice(myCards.indexOf(currentCard), 1);
  updateSave();
  backButton.click();
  tradeMenu.style.display = "none";
  // Remove the card from card list
  let cardDiv = document.getElementById(currentCard.name);
  if (cardDiv) {
    cardDiv.remove();
  } else {
    console.warn(`Card "${currentCard.name}" not found in the card list.`);
  }
}

window.tradeCard = tradeCard;

function mergeCard() {
  myCards = removeDuplicatesOfObject(myCards, currentCard);
  updateSave();
  mergeMenu.style.display = "none";
  navBar.style.height = "100px";
  // Remove the card from duplicate list
  let cardDiv = document.getElementById(currentCard.name + " duplicate");
  if (cardDiv) {
    cardDiv.parentElement.remove();
  } else {
    console.warn(`Card "${currentCard.name}" not found in the card list.`);
  }
}

window.mergeCard = mergeCard;

function goldGainAnimation() {
  // apply to every element with class gold-count
  Array.from(document.getElementsByClassName("gold-count")).forEach(
    (element) => {
      element.classList.add("gold-gain");
      setTimeout(() => {
        element.classList.remove("gold-gain");
      }, 2500);
    }
  );
  setTimeout(() => {
    Array.from(document.getElementsByClassName("gold-count-text")).forEach(
      (element) => {
        element.innerHTML = addCommas(gold);
      }
    );
  }, 500);
}

function gemGainAnimation() {
  // apply to every element with class emerald-count
  Array.from(document.getElementsByClassName("emerald-count")).forEach(
    (element) => {
      element.classList.add("gem-gain");
      setTimeout(() => {
        element.classList.remove("gem-gain");
      }, 2500);
    }
  );
  setTimeout(() => {
    Array.from(document.getElementsByClassName("emerald-count-text")).forEach(
      (element) => {
        element.innerHTML = addCommas(gems);
      }
    );
  }, 500);
}

function updateSave() {
  if (cards) {
    showOffers();
  }
  // Check if gold has increased since the last save
  if (gold > parseInt(localStorage.getItem("gold")) || 0) {
    setTimeout(() => {
      goldGainAnimation();
    }, 200);
  } else {
    Array.from(document.getElementsByClassName("gold-count-text")).forEach(
      (element) => {
        element.innerHTML = addCommas(gold);
      }
    );
  }

  // same thing but for gems
  if (gems > parseInt(localStorage.getItem("gems")) || 0) {
    setTimeout(() => {
      gemGainAnimation();
    }, 200);
  } else {
    Array.from(document.getElementsByClassName("emerald-count-text")).forEach(
      (element) => {
        element.innerHTML = addCommas(gems);
      }
    );
  }

  localStorage.setItem("myCards", JSON.stringify(myCards));
  localStorage.setItem("gold", gold);
  localStorage.setItem("gems", gems);
  localStorage.setItem("myFavourites", JSON.stringify(myFavourites));
  localStorage.setItem("xpLevel", xpLevel);
  localStorage.setItem("xpProgress", xpProgress);
  localStorage.setItem("lastRewardDate", lastRewardDate);
  localStorage.setItem("packsPurchased", packsPurchased);

  cardCountText.innerHTML = `${addCommas(myCards.length)} Cards`;
  levelDisplay.innerHTML = `Level ${xpLevel}`;
}

myCards = JSON.parse(localStorage.getItem("myCards")) || [];
myFavourites = JSON.parse(localStorage.getItem("myFavourites")) || [];
gold = parseInt(localStorage.getItem("gold")) || 0;
gems = parseInt(localStorage.getItem("gems")) || 0;
let sortType = localStorage.getItem("sortType") || "Rarity";
let filterType = "All";
xpLevel = parseInt(localStorage.getItem("xpLevel")) || 1;
let xpProgress = parseInt(localStorage.getItem("xpProgress")) || 0;
let lastRewardDate = localStorage.getItem("lastRewardDate") || "";
let lastStarterPackTimestamp =
  localStorage.getItem("lastStarterPackTimestamp") || "";
let packsPurchased = parseInt(localStorage.getItem("packsPurchased")) || 0;
Array.from(document.getElementsByClassName("gold-count-text")).forEach(
  (element) => {
    element.innerHTML = addCommas(gold);
  }
);
Array.from(document.getElementsByClassName("emerald-count-text")).forEach(
  (element) => {
    element.innerHTML = addCommas(gems);
  }
);

displayCardInfo(false);
updateCountdown();
setInterval(updateCountdown, 1000);

if (myCards.length == 0) {
  document.getElementById("loading-text").innerHTML = "No cards yet...";
  let button = document.createElement("button");
  button.innerHTML = "Open a Starter Pack";
  button.classList.add("small-button");
  button.style.marginTop = "10px";
  button.onclick = function () {
    navBarPacksButton.click();
  };
  document.getElementById("loading-text").appendChild(button);
}

if (location.pathname == "/deck" || myCards.length == 0) {
  navigate("deck");
} else if (location.pathname == "/shop") {
  navigate("shop");
} else if (location.pathname == "/profile") {
  navigate("profile");
} else {
  navigate("deck");
}

packsPage.addEventListener("scroll", function () {
  if (packsPage.scrollTop >= 20) {
    document.getElementById("packs-header").classList.add("scrolled");
  } else {
    document.getElementById("packs-header").classList.remove("scrolled");
  }
});

myDeckPage.addEventListener("scroll", function () {
  sortMenu.style.display = "none"; // Hide sort menu on scroll
  if (myDeckPage.scrollTop >= 20) {
    document.getElementById("deck-header").classList.add("scrolled");
  } else {
    document.getElementById("deck-header").classList.remove("scrolled");
  }
});

profilePage.addEventListener("scroll", function () {
  if (profilePage.scrollTop >= 20) {
    document.getElementById("profile-header").classList.add("scrolled");
  } else {
    document.getElementById("profile-header").classList.remove("scrolled");
  }
});

// also swipe by pressing left and right arrow keys
document.addEventListener("keydown", function (event) {
  if (event.key === "ArrowLeft") {
    swipeCard("right");
  } else if (event.key === "ArrowRight") {
    swipeCard("left");
  }
});

// PWA STUFF

function isRunningAsPWA() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

function isMobileDevice() {
  return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

if (isMobileDevice()) {
  console.log("User is on a mobile device");
} else {
  console.log("User is on a computer");
}

if (!isRunningAsPWA()) {
  document.getElementById("background").style.paddingBottom = "0";
}

// if (!isRunningAsPWA()) {
//   alert("Redemption TCG Pocket runs better as an app!");
// }
