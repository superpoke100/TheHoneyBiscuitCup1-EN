const scoreText = document.getElementById("score"),
    finalScoreText = document.getElementById("finalScore"),
    itemOneScoreText = document.getElementById("itemOneScore"),
    ingameScoreInput = document.getElementById("ingameScore"),
    artifactCountInput = document.getElementById("artifactCount"),
    itemThreeMultiplierText = document.getElementById("itemThreeMultiplier"),
    itemFourMultiplierText = document.getElementById("itemFourMultiplier"),
    itemThreeChecks = document.querySelectorAll(".item-three-check"),
    itemFourRadios = document.querySelectorAll(".item-four-radio"),
    keobeBossCountInput = document.getElementById("keobeBossCount"),
    itemFiveScoreText = document.getElementById("itemFiveScore"),
    itemSixScoreText = document.getElementById("itemSixScore"),
    itemSevenScoreText = document.getElementById("itemSevenScore"),
    dollarCells = document.querySelectorAll(".dollar-cell"),
    unreleasedUsageCountInput = document.getElementById("unreleasedUsageCount"),
    extraOriginiumCountInput = document.getElementById("extraOriginiumCount"),
    playerDollarCells = document.querySelectorAll(".player-dollar-cell"),
    playerToggles = document.querySelectorAll(".player-toggle"),
    p1PurchaseText = document.getElementById("p1Purchase"),
    p2PurchaseText = document.getElementById("p2Purchase"),
    p2BonusText = document.getElementById("p2Bonus");
let currentPlayer = "p1";
const playerSelections = {
    p1: {},
    p2: {}
};

function defaultSelected() {
    return {
        top: {
            activeRow: null,
            columns: {
                a: false,
                b: false,
                c: false,
                d: false,
                f: false,
                g: false
            }
        },
        bottom: {
            activeRow: null,
            columns: {
                a: false,
                b: false,
                c: false,
                d: false,
                f: false,
                g: false
            }
        },
        five: {
            activeRow: null,
            columns: {
                a: false,
                b: false,
                c: false,
                d: false,
                f: false,
                g: false
            }
        }
    }
}

function cloneSelected(o) {
    return JSON.parse(JSON.stringify(o))
}

function defaultCalcState() {
    return {
        ingame: "0",
        artifact: "0",
        selected: defaultSelected(),
        itemThree: Array.from(itemThreeChecks).map(() => false),
        itemFour: "1",
        keobe: "0",
        dollar: [],
        unreleased: "0",
        extra: "0"
    }
}
const calcStates = {
    p1: defaultCalcState(),
    p2: defaultCalcState()
};
let selected = cloneSelected(calcStates[currentPlayer].selected);
const rowRules = {
    top: {
        1: {
            base: -50,
            a: 10,
            comboType: "bcd",
            comboScore: 40,
            fg: 100
        },
        2: {
            base: 0,
            a: 10,
            comboType: "bc",
            comboScore: 50,
            fg: 100
        },
        3: {
            base: 60,
            a: 80,
            comboType: "bcd",
            comboScore: 120,
            fg: 100
        },
        4: {
            base: 80,
            a: 120,
            comboType: "bc",
            comboScore: 100,
            fg: 100
        }
    },
    bottom: {
        5: {
            base: 80,
            a: 160,
            c: 100,
            fg: 100
        },
        6: {
            base: 100,
            a: 160,
            b: 60,
            fg: 100
        }
    }
};
const fiveRules = {
    7: {
        any: {
            base: 0,
            a: 20
        }
    },
    8: {
        A: {
            base: 60,
            c: 20
        },
        B: {
            base: 20,
            b: 30
        }
    },
    9: {
        A: {
            base: 200,
            a: 60,
            c: 40
        },
        B: {
            base: 100,
            a: 40,
            b: 40
        }
    },
    10: {
        onlyBottom3: true,
        A: {
            base: 200,
            a: 80,
            c: 80
        }
    },
    11: {
        onlyBottom4: true,
        B: {
            base: 20,
            b: 20
        }
    },
    12: {
        A: {
            base: 350,
            a: 620,
            c: 80
        },
        B: {
            base: 240,
            a: 320,
            b: 80
        }
    },
    13: {
        A: {
            base: 400,
            a: 600,
            c: 100
        },
        B: {
            base: 325,
            a: 475,
            b: 90
        }
    }
};

function saveCalcState() {
    calcStates[currentPlayer] = {
        ingame: ingameScoreInput.value,
        artifact: artifactCountInput.value,
        selected: cloneSelected(selected),
        itemThree: Array.from(itemThreeChecks).map(c => c.checked),
        itemFour: (document.querySelector('.item-four-radio:checked') || {}).value || "1",
        keobe: keobeBossCountInput.value,
        dollar: Array.from(dollarCells).filter(c => c.classList.contains("active")).map(c => c.dataset.id),
        unreleased: unreleasedUsageCountInput.value,
        extra: extraOriginiumCountInput.value
    }
}

function loadCalcState(p) {
    const s = calcStates[p];
    ingameScoreInput.value = s.ingame;
    artifactCountInput.value = s.artifact;
    selected = cloneSelected(s.selected);
    itemThreeChecks.forEach((c, i) => c.checked = !!s.itemThree[i]);
    itemFourRadios.forEach(r => r.checked = r.value === s.itemFour);
    keobeBossCountInput.value = s.keobe;
    dollarCells.forEach(c => c.classList.toggle("active", s.dollar.includes(c.dataset.id)));
    unreleasedUsageCountInput.value = s.unreleased;
    extraOriginiumCountInput.value = s.extra;
    updateScore()
}
playerToggles.forEach(b => b.addEventListener("click", () => {
    if (b.dataset.player === currentPlayer) return;
    saveCalcState();
    currentPlayer = b.dataset.player;
    loadCalcState(currentPlayer);
    updatePlayerUI()
}));
playerDollarCells.forEach(c => {
    c.addEventListener("click", () => buyTop(c, false));
    c.addEventListener("contextmenu", e => {
        e.preventDefault();
        buyTop(c, true)
    })
});

function buyTop(c, free) {
    const id = c.dataset.id,
        base = Number(c.dataset.dollar);
    let cur = playerSelections[currentPlayer];
    if (
        currentPlayer === "p2" &&
        isP1TopFree(id)
    ) {
        return;
    }
    if (cur[id]) {
        delete cur[id];
        updateLowerDollarUI();
        updatePlayerUI();
        updateScore();
        return
    }
    if (free) {

        let mode = "free";
        let cost = 0;

        if (isP2DuplicateByP1(id)) {
            mode = "triple";
            cost = 0;
        }

        cur[id] = {
            mode,
            cost
        };

        updateLowerDollarUI();
        updatePlayerUI();
        updateScore();
        return;
    }
    let cost = base,
        mode = "paid";
    if (isP2DuplicateByP1(id)) {
        cost = base * 2;
        mode = "triple";
    }
    if (getTotalPurchase() + cost > 300) return;
    cur[id] = {
        mode,
        cost
    };
    updateLowerDollarUI();
    updatePlayerUI();
    updateScore()
}

function getPurchase(p) {
    return Object.values(playerSelections[p]).reduce((s, o) => s + o.cost, 0)
}

function getTotalPurchase() {
    return getPurchase("p1") + getPurchase("p2")
}
function isP1LowerSelected(id) {
    return calcStates.p1.dollar.includes(id);
}

function isP1TopFree(id) {
    return (
        playerSelections.p1[id] &&
        playerSelections.p1[id].mode === "free"
    );
}

function isP2DuplicateByP1(id) {
    return (
        currentPlayer === "p2" &&
        (
            !!playerSelections.p1[id] ||
            isP1LowerSelected(id)
        )
    );
}

function getP2Bonus() {
    return (300 - getTotalPurchase()) * 5
}

function updatePlayerUI() {
    playerToggles.forEach(b => {
        b.classList.toggle("active", b.dataset.player === currentPlayer);
        b.classList.toggle("p1-active", b.dataset.player === "p1" && b.dataset.player === currentPlayer);
        b.classList.toggle("p2-active", b.dataset.player === "p2" && b.dataset.player === currentPlayer)
    });
    playerDollarCells.forEach(c => {

        c.classList.remove(
            "active",
            "free",
            "triple",
            "blocked"
        );

        let v = playerSelections[currentPlayer][c.dataset.id];

        if (v) {
            if (v.mode === "free")
                c.classList.add("free");
            else if (v.mode === "triple")
                c.classList.add("triple");
            else
                c.classList.add("active");
        }

        else if (
            currentPlayer === "p2" &&
            playerSelections.p1[c.dataset.id] &&
            playerSelections.p1[c.dataset.id].mode === "free"
        ) {
            c.classList.add("free");
            c.classList.add("blocked");
        }
    });
    p1PurchaseText.textContent = getPurchase("p1") + "ⓒ";
    p2PurchaseText.textContent = getPurchase("p2") + "ⓒ";
    p2BonusText.textContent = getP2Bonus() + "점"
}

function isLowerDollarBlocked(id) {

    if (playerSelections[currentPlayer][id]) {
        return true;
    }

    if (
        currentPlayer === "p2" &&
        playerSelections.p1[id] &&
        playerSelections.p1[id].mode === "free"
    ) {
        return true;
    }

    return false;
}

function isLowerDollarDuplicate(id) {
    return isP2DuplicateByP1(id);
}

function updateLowerDollarUI() {
    dollarCells.forEach(c => {
        const id = c.dataset.id;
        c.classList.remove("blocked", "duplicate");
        if (isLowerDollarBlocked(id)) {
            c.classList.remove("active");
            c.classList.add("blocked")
        } else if (c.classList.contains("active") && isLowerDollarDuplicate(id)) {
            c.classList.add("duplicate")
        }
    })
}
document.querySelectorAll(".select-button").forEach(btn => btn.addEventListener("click", () => {
    const g = btn.dataset.group,
        k = btn.dataset.key;
    selected[g].columns[k] = !selected[g].columns[k];
    updateScore();
    saveCalcState()
}));
document.querySelectorAll(".row-button").forEach(btn => btn.addEventListener("click", () => {
    const g = btn.dataset.group,
        r = btn.dataset.row;
    if (g === "five" && !isFiveRowEnabled(r)) return;
    selected[g].activeRow = selected[g].activeRow === r ? null : r;
    updateScore();
    saveCalcState()
}));
[ingameScoreInput, artifactCountInput, keobeBossCountInput, unreleasedUsageCountInput, extraOriginiumCountInput].forEach(i => i.addEventListener("input", () => {
    updateScore();
    saveCalcState()
}));
itemThreeChecks.forEach(c => c.addEventListener("change", () => {
    updateScore();
    saveCalcState()
}));
itemFourRadios.forEach(r => r.addEventListener("change", () => {
    updateScore();
    saveCalcState()
}));
dollarCells.forEach(c => c.addEventListener("click", () => {
    if (isLowerDollarBlocked(c.dataset.id)) return;
    c.classList.toggle("active");
    updateScore();
    saveCalcState()
}));

function updateScore() {
    clearAll();
    validateFiveSelection();
    updateFiveDisplay();
    updateLowerDollarUI();
    let itemTwoScore = calcGroup("top") + calcGroup("bottom") + calcFiveGroup();
    const ingame = Number(ingameScoreInput.value) || 0,
        artifact = Number(artifactCountInput.value) || 0,
        itemOne = artifact > 100 ? Math.floor((100 - artifact) * 7.5) : 0,
        itemFive = calcItemFiveScore() + (
            currentPlayer === "p2"
                ? getP2Bonus()
                : 0
        ),
        itemSix = calcItemSixScore(),
        itemSeven = calcItemSevenScore(),
        base = ingame + itemOne + itemTwoScore + itemSix,
        itemThree = calcItemThreeMultiplier(),
        itemFour = calcItemFourMultiplier(),
        totalMultiplier = 1 + (itemThree - 1) + (itemFour - 1),
        final = base * totalMultiplier + itemFive + itemSeven;
    scoreText.textContent = itemTwoScore + "점";
    itemOneScoreText.textContent = itemOne + "점";
    itemThreeMultiplierText.textContent = fmtMul(itemThree) + "배";
    itemFourMultiplierText.textContent = fmtMul(itemFour) + "배";
    itemFiveScoreText.textContent = itemFive + "점";
    itemSixScoreText.textContent = itemSix + "점";
    itemSevenScoreText.textContent = itemSeven + "점";
    finalScoreText.textContent = fmtScore(final) + "점";
    updatePlayerUI()
}

function calcItemFiveScore() {
    let t = 0;
    dollarCells.forEach(c => {
        if (c.classList.contains("active")) {
            let price = Number(c.dataset.dollar) || 0;
            if (isLowerDollarDuplicate(c.dataset.id)) price *= 2;
            t += price
        }
    });
    return t * (-6)
}

function calcItemSixScore() {
    const c = Number(unreleasedUsageCountInput.value) || 0;
    if (c <= 0) return 0;
    if (c === 1) return -100;
    return -100 - 500 * (c - 1)
}

function calcItemSevenScore() {
    const c = Number(extraOriginiumCountInput.value) || 0;
    return c * (-50)
}

function calcItemThreeMultiplier() {
    let s = 0;
    itemThreeChecks.forEach(c => {
        if (c.checked) s += Number(c.dataset.multiplier) - 1
    });
    s += (Number(keobeBossCountInput.value) || 0) * 0.005;
    return 1 + s
}

function calcItemFourMultiplier() {
    const r = document.querySelector('.item-four-radio:checked');
    return r ? Number(r.value) : 1
}

function calcGroup(g) {
    const row = selected[g].activeRow,
        cols = getActiveColumns(g);
    updateColumnUI(g, cols);
    updateRowUI(g);
    if (!row) return 0;
    const rule = rowRules[g][row];
    let sum = rule.base;
    activateCell(g, row, "base");
    if (cols.a && rule.a !== undefined) {
        sum += rule.a;
        activateCell(g, row, "a")
    }
    if (g === "top") {
        if (rule.comboType === "bcd" && cols.b && cols.c && cols.d) {
            sum += rule.comboScore;
            activateCell(g, row, "bcd")
        }
        if (rule.comboType === "bc" && cols.b && cols.c) {
            sum += rule.comboScore;
            activateCell(g, row, "bc")
        }
    }
    if (g === "bottom") {
        if (cols.c && rule.c !== undefined) {
            sum += rule.c;
            activateCell(g, row, "c")
        }
        if (cols.b && rule.b !== undefined) {
            sum += rule.b;
            activateCell(g, row, "b")
        }
    }
    if (cols.f && cols.g) {
        sum += rule.fg;
        activateCell(g, row, "fg")
    }
    setRowTotal(g, row, sum);
    return sum
}

function calcFiveGroup() {
    const row = selected.five.activeRow,
        cols = getActiveColumns("five");
    updateColumnUI("five", cols);
    updateRowUI("five");
    updateFiveDisabledUI();
    if (!row || !isFiveRowEnabled(row)) return 0;
    const rule = fiveRules[row],
        active = rule.any || rule[getFiveCase()];
    if (!active) return 0;
    let sum = active.base;
    activateCell("five", row, "base");
    ["a", "b", "c", "d", "f", "g"].forEach(k => {
        if (cols[k] && active[k] !== undefined) {
            sum += active[k];
            activateCell("five", row, k)
        }
    });
    setRowTotal("five", row, sum);
    return sum
}

function getActiveColumns(g) {
    const cols = {
        ...selected[g].columns
    };
if (g === "top") {
    const r = selected.bottom.activeRow;
    if (r === "5") {
        cols.b = true;
        cols.d = true;
    }

    // 4번 이미지 선택 시 무 자동
    if (r === "6") {
        cols.c = true;
    }
}
    if (g === "bottom") {
        const r = selected.bottom.activeRow;
        if (r === "5") {
            cols.b = true;
            cols.d = true
        }
        if (r === "6") cols.c = true
    }
    if (g === "five") {
        const r = selected.bottom.activeRow;
        if (r === "5") {
            cols.b = true;
            cols.d = true
        }
        if (r === "6") cols.c = true
    }
    return cols
}

function getFiveCase() {
    return selected.bottom.activeRow === "6" ? "B" : "A"
}

function isFiveRowEnabled(row) {
    const rule = fiveRules[row];
    if (!rule) return false;
    if (rule.onlyBottom3) return selected.bottom.activeRow === "5";
    if (rule.onlyBottom4) return selected.bottom.activeRow === "6";
    return true
}

function validateFiveSelection() {
    if (selected.five.activeRow && !isFiveRowEnabled(selected.five.activeRow)) selected.five.activeRow = null
}

function updateFiveDisplay() {
    const attr = getFiveCase() === "B" ? "b" : "a";
    document.querySelectorAll('[data-group="five"].score-cell').forEach(cell => {
        let v = "";
        if (cell.dataset.any !== undefined) v = cell.dataset.any;
        else if (cell.dataset[attr] !== undefined) v = cell.dataset[attr];
        cell.textContent = v === "" ? "" : signed(v)
    })
}

function signed(v) {
    const n = Number(v);
    return Number.isNaN(n) ? v : (n >= 0 ? "+" + n : String(n))
}

function fmtMul(v) {
    return Number(v.toFixed(3)).toString()
}

function fmtScore(v) {
    return Number(v.toFixed(2)).toString()
}

function updateColumnUI(g, cols) {
    document.querySelectorAll(`.select-button[data-group="${g}"]`).forEach(btn => btn.classList.toggle("active", !!cols[btn.dataset.key]))
}

function updateRowUI(g) {
    document.querySelectorAll(`.row-button[data-group="${g}"]`).forEach(btn => btn.classList.toggle("active", selected[g].activeRow === btn.dataset.row))
}

function updateFiveDisabledUI() {
    document.querySelectorAll('.row-button[data-group="five"]').forEach(btn => {
        const en = isFiveRowEnabled(btn.dataset.row);
        btn.disabled = !en;
        btn.classList.toggle("disabled", !en);
        if (!en) btn.classList.remove("active")
    })
}

function activateCell(g, r, t) {
    const cell = document.querySelector(`[data-group="${g}"][data-row="${r}"][data-score="${t}"]`);
    if (cell) cell.classList.add("active")
}

function setRowTotal(g, r, sum) {
    const c = document.querySelector(`[data-group="${g}"][data-row-total="${r}"]`);
    if (c) {
        c.textContent = sum + "점";
        c.classList.add("active")
    }
}

function clearAll() {
    document.querySelectorAll(".score-cell").forEach(e => e.classList.remove("active"));
    document.querySelectorAll(".total-cell").forEach(e => {
        e.classList.remove("active");
        e.textContent = "0점"
    })
}
loadCalcState(currentPlayer);
updatePlayerUI();
saveCalcState();