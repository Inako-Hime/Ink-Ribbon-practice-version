const nameInput = document.querySelector(".input:nth-of-type(1)");
const beliefInput = document.querySelector(".input:nth-of-type(2)");
const saveButton = document.querySelector(".button");
const characterList = document.getElementById("character-list");
const projectSelect = document.getElementById("projectSelect");
const addProjectButton = document.getElementById("addProjectButton");
const newProjectNameInput = document.getElementById("newProjectName");
const deleteProjectButton = document.getElementById("deleteProjectButton");
const exportButton = document.getElementById("exportButton");
const importFile = document.getElementById("importFile");
const gapPersonalityInput = document.getElementById("gapPersonality");
const gapAbilityInput = document.getElementById("gapAbility");
const gapBackgroundInput = document.getElementById("gapBackground");
const suggestionArea = document.getElementById("suggestionArea");
const suggestBelief = document.getElementById("suggestBelief");
const suggestType = document.getElementById("suggestType");
const suggestValue = document.getElementById("suggestValue");
const addSuggestion = document.getElementById("addSuggestion");
const exportSuggestion = document.getElementById("exportSuggestion");
const importSuggestion = document.getElementById("importSuggestion");
const beliefXInput = document.getElementById("beliefX");
const beliefYInput = document.getElementById("beliefY");

const modalName = document.getElementById("modalName");
const modalBelief = document.getElementById("modalBelief");
const modalPersonality = document.getElementById("modalPersonality");
const modalAbility = document.getElementById("modalAbility");
const modalBackground = document.getElementById("modalBackground");
const modalX = document.getElementById("modalX");
const modalY = document.getElementById("modalY");

const suggestionData = {
  誠実主義: {
    personality: ["嘘がうまい", "裏表がある", "誠実を貫きすぎる頑固さ"],
    ability: ["裏切りの才能", "予想外の抜け道を見つける"],
    background: ["かつて信頼を裏切られた過去"],
  },
  自己肯定主義: {
    personality: ["自分を過信する", "他人に無関心"],
    ability: ["自己否定を武器にする力", "他者依存型の能力"],
    background: ["かつて強く否定された経験"],
  },
  努力主義: {
    personality: ["クール", "他人の努力を軽視"],
    ability: ["不正な手段での成功", "他人の努力を利用する能力","一撃必殺のパンチ"],
    background: ["過去に努力が報われなかった経験"],
  }
  // 他の主義もここに追加可能
};
const beliefCoordinates = {
  誠実主義: { x: 0.6, y: 0.7 },
  自己肯定主義: { x: 0.3, y: 0.6 },
  合理主義: { x: 0.9, y: 0.8 },
  感情主義: { x: 0.1, y: 0.5 },
  秩序主義: { x: 0.5, y: 1.0 },
  自由主義: { x: 0.4, y: 0.1 },
};
let editingIndex = null;

// ✅ 起動時に作品一覧を復元
const savedProjectList = localStorage.getItem('projectList');
if (savedProjectList) {
  const projects = JSON.parse(savedProjectList);
  projectSelect.innerHTML = ''; // 一旦リセット
  projects.forEach(p => {
    const option = document.createElement('option');
    option.value = p.value;
    option.textContent = p.name;
    projectSelect.appendChild(option);
  });
}


// ✅ 作品を追加する処理
addProjectButton.addEventListener("click", () => {
  const newProject = newProjectNameInput.value.trim();
  if (!newProject) return;

  const newValue = `project-${newProject}`;

  const option = document.createElement("option");
  option.value = newValue;
  option.textContent = newProject;
  projectSelect.appendChild(option);

  projectSelect.value = newValue;
  currentProject = newValue;

  characters = getCharacters(currentProject);
  renderCharacters();

  newProjectNameInput.value = "";
  saveProjectList(); // 👈 追加！
});


// ⭐ 選ばれたプロジェクト（作品）を取得
let currentProject = projectSelect.value;

// 🔁 選ばれた作品ごとにキャラデータを読み込む
function getCharacters(project) {
  const saved = localStorage.getItem(project);
  return saved ? JSON.parse(saved) : [];
}

let characters = getCharacters(currentProject);

function renderCharacters() {
  characterList.innerHTML = "";
  characters.forEach((char, index) => {
    const charItem = document.createElement("div");
    charItem.className =
      "bg-white p-4 rounded-xl shadow-md text-gray-800 border border-gray-200 flex justify-between items-start gap-4 flex-col";

    const content = document.createElement("div");
    content.innerHTML = `
  <h3 class="text-lg font-bold mb-1">${char.name}</h3>
  <p><strong class="text-indigo-600">主義：</strong>${
    char.belief || "（未設定）"
  }</p>
  <p><strong>性格ギャップ：</strong>${char.gapPersonality || "（なし）"}</p>
  <p><strong>能力ギャップ：</strong>${char.gapAbility || "（なし）"}</p>
  <p><strong>生い立ちギャップ：</strong>${char.gapBackground || "（なし）"}</p>
  <p><strong class="text-green-700">マトリクス座標：</strong>
     x: ${char.beliefX ?? "未設定"}, y: ${char.beliefY ?? "未設定"}</p>
`;


    // 編集ボタン
    const editButton = document.createElement("button");
    editButton.textContent = "編集";
    editButton.className =
      "text-white bg-blue-500 px-3 py-1 rounded hover:bg-blue-600 text-sm";

    // ✅ 編集モーダルを開くように変更
    editButton.addEventListener("click", () => {
      openEditModal(index);
    });

    // 削除ボタン
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "削除";
    deleteButton.className =
      "text-white bg-red-500 px-3 py-1 rounded hover:bg-red-600 text-sm";
    deleteButton.addEventListener("click", () => {
      characters.splice(index, 1);
      localStorage.setItem(currentProject, JSON.stringify(characters));
      renderCharacters();
    });

    const buttonGroup = document.createElement("div");
    buttonGroup.className = "flex gap-2 mt-2";
    buttonGroup.appendChild(editButton);
    buttonGroup.appendChild(deleteButton);

    charItem.appendChild(content);
    charItem.appendChild(buttonGroup);
    characterList.appendChild(charItem);
  });
  // キャラカードの並び替え機能を有効化
  new Sortable(characterList, {
    animation: 150,
    onEnd: () => {
      // 並び替え後の順番を保存し直す
      const newOrder = Array.from(characterList.children).map((card) => {
        const name = card.querySelector("h3").textContent;
        return characters.find((c) => c.name === name);
      });
      characters = newOrder;
      localStorage.setItem(currentProject, JSON.stringify(characters));
    },
  });
}


// 入力に応じた候補表示処理
beliefInput.addEventListener("input", renderSuggestions);

function renderSuggestions() {
  const belief = beliefInput.value.trim();
  const suggestions = suggestionData[belief];
  suggestionArea.innerHTML = "";

  if (!suggestions) return;

  for (const type in suggestions) {
    const group = document.createElement("div");
    group.innerHTML = `<strong class="block mb-1">${type}のギャップ候補：</strong>`;

    suggestions[type].slice(0, 3).forEach((gap, i) => {
      const btn = document.createElement("button");
      btn.textContent = gap;
      btn.className =
        "bg-gray-200 px-2 py-1 mr-2 mb-1 rounded hover:bg-gray-300";

      // 入力欄に自動反映
      btn.addEventListener("click", () => {
        if (type === "personality") gapPersonalityInput.value = gap;
        if (type === "ability") gapAbilityInput.value = gap;
        if (type === "background") gapBackgroundInput.value = gap;
      });

      // 🗑 削除ボタン
      const del = document.createElement("button");
      del.textContent = "×";
      del.className = "ml-1 text-red-500 hover:text-red-700 font-bold";
      del.addEventListener("click", () => {
        if (confirm(`この候補「${gap}」を削除しますか？`)) {
          suggestionData[belief][type].splice(i, 1);
          saveSuggestionData(); // 保存
          renderSuggestions(); // 再描画
        }
      });

      const wrap = document.createElement("span");
      wrap.className = "inline-flex items-center";
      wrap.appendChild(btn);
      wrap.appendChild(del);

      group.appendChild(wrap);
    });

    suggestionArea.appendChild(group);
  }
}


let editIndex = -1; // -1なら通常保存モード。0以上なら編集中

// 保存ボタン処理
saveButton.addEventListener("click", () => {
  const name = nameInput.value.trim();
  const belief = beliefInput.value.trim();
  const gapPersonality = gapPersonalityInput.value.trim();
  const gapAbility = gapAbilityInput.value.trim();
  const gapBackground = gapBackgroundInput.value.trim();
  const beliefX = parseFloat(beliefXInput.value);
  const beliefY = parseFloat(beliefYInput.value);

  if (!name) return;

  const newChar = {
    name,
    belief,
    gapPersonality,
    gapAbility,
    gapBackground,
    beliefX: isNaN(beliefX) ? 0.5 : beliefX,
    beliefY: isNaN(beliefY) ? 0.5 : beliefY,
  };

  if (editIndex >= 0) {
    characters[editIndex] = newChar;
    editIndex = -1;
    saveButton.textContent = "保存";
  } else {
    characters.push(newChar);
  }

  localStorage.setItem(currentProject, JSON.stringify(characters));
  renderCharacters();
  renderMatrix();
  enableMatrixDrag();
  nameInput.value = "";
  beliefInput.value = "";
  gapPersonalityInput.value = "";
  gapAbilityInput.value = "";
  gapBackgroundInput.value = "";
  beliefXInput.value = "";
  beliefYInput.value = "";
});


// 🔄 サジェスト辞書を localStorage から読み込み
const storedSuggestion = localStorage.getItem('suggestionData');
if (storedSuggestion) {
  Object.assign(suggestionData, JSON.parse(storedSuggestion));
}
function saveSuggestionData() {
  localStorage.setItem("suggestionData", JSON.stringify(suggestionData));
}
addSuggestion.addEventListener("click", () => {
  const belief = suggestBelief.value.trim();
  const type = suggestType.value;
  const value = suggestValue.value.trim();

  if (!belief || !value) return alert("主義と候補内容を入力してください");

  // 主義がまだ存在しなければ作る
  if (!suggestionData[belief]) {
    suggestionData[belief] = {
      personality: [],
      ability: [],
      background: [],
    };
  }

  // 重複しないように追加
  if (!suggestionData[belief][type].includes(value)) {
    suggestionData[belief][type].push(value);
    saveSuggestionData();
    alert("サジェストに追加しました！");
    suggestValue.value = "";
    renderSuggestions(); // ✅ ← ここ追加！
  }
  
});
exportSuggestion.addEventListener("click", () => {
  const dataStr = JSON.stringify(suggestionData, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "suggestionData.json";
  a.click();

  URL.revokeObjectURL(url);
});
importSuggestion.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const imported = JSON.parse(e.target.result);
      if (typeof imported !== "object") throw new Error("不正な辞書");

      // マージ処理
      for (const belief in imported) {
        if (!suggestionData[belief]) {
          suggestionData[belief] = imported[belief];
        } else {
          for (const type in imported[belief]) {
            if (!suggestionData[belief][type]) {
              suggestionData[belief][type] = [];
            }
            imported[belief][type].forEach((val) => {
              if (!suggestionData[belief][type].includes(val)) {
                suggestionData[belief][type].push(val);
              }
            });
          }
        }
      }

      saveSuggestionData();
      alert("インポート完了！辞書に統合されました。");
    } catch (err) {
      alert("JSONファイルの形式が正しくありません。");
    }
  };

  reader.readAsText(file);
});


// 🔁 プロジェクト（作品）を切り替えたとき
projectSelect.addEventListener("change", () => {
  currentProject = projectSelect.value;
  characters = getCharacters(currentProject);
  renderCharacters();
  renderMatrix(); // ← これを追加！
  enableMatrixDrag();
});


deleteProjectButton.addEventListener("click", () => {
  if (!confirm("この作品を削除しますか？キャラ情報もすべて消えます。")) return;

  localStorage.removeItem(currentProject);

  const optionToRemove = projectSelect.querySelector(
    `option[value="${currentProject}"]`
  );
  if (optionToRemove) {
    projectSelect.removeChild(optionToRemove);
  }

  saveProjectList(); // 👈 追加！

  if (projectSelect.options.length > 0) {
    currentProject = projectSelect.value = projectSelect.options[0].value;
    characters = getCharacters(currentProject);
    renderCharacters();
  } else {
    currentProject = "";
    characters = [];
    characterList.innerHTML = "";
  }
});

// ✅ エクスポート処理
exportButton.addEventListener('click', () => {
  const dataStr = JSON.stringify(characters, null, 2); // 見やすく整形
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `${currentProject}.json`;
  a.click();

  URL.revokeObjectURL(url);
});
// ✅ インポート処理
importFile.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = (e) => {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) throw new Error("JSON形式が正しくありません");

      // 上書き保存
      characters = imported;
      localStorage.setItem(currentProject, JSON.stringify(characters));
      renderCharacters();

      alert("インポート成功しました");
    } catch (err) {
      alert("読み込み失敗：JSONファイルの形式が不正です");
    }
  };

  reader.readAsText(file);
});

function saveProjectList() {
  const projects = Array.from(projectSelect.options).map((option) => ({
    name: option.textContent,
    value: option.value,
  }));
  localStorage.setItem("projectList", JSON.stringify(projects));
}

function renderMatrix() {
  const matrixContainer = document.getElementById("matrix-container");
  matrixContainer.querySelectorAll(".matrix-char").forEach((el) => el.remove());

  characters.forEach((char) => {
    const x = typeof char.beliefX === "number" ? char.beliefX : 0.5;
    const y = typeof char.beliefY === "number" ? char.beliefY : 0.5;

    const dot = document.createElement("div");
    dot.className =
      "matrix-char absolute text-xs bg-blue-500 text-white px-2 py-1 rounded shadow cursor-default";
    dot.textContent = char.name;

    dot.style.left = `${x * 100}%`;
    dot.style.top = `${(1 - y) * 100}%`;

    dot.style.transform = "translate(-50%, -50%)";
    matrixContainer.appendChild(dot);
  });
  enableMatrixDrag();
}
renderMatrix();
function enableMatrixDrag() {
  const matrixContainer = document.getElementById("matrix-container");
  if (!matrixContainer) return;

  matrixContainer.querySelectorAll(".matrix-char").forEach((dot) => {
    let isDragging = false;

    // ⬇ キャラ名を埋め込む
    const charName = dot.textContent;
    dot.dataset.name = charName;

    dot.addEventListener("mousedown", () => {
      isDragging = true;
      dot.style.zIndex = 1000;
    });

    document.addEventListener("mousemove", (e) => {
      if (!isDragging) return;

      const rect = matrixContainer.getBoundingClientRect();
      const x = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
      const y = Math.min(Math.max((e.clientY - rect.top) / rect.height, 0), 1);

      dot.style.left = `${x * 100}%`;
      dot.style.top = `${(1 - y) * 100}%`; // Y軸は上が0
      dot.style.transform = "translate(-50%, -50%)";

      // ⬇ name で対象キャラを探す
      const char = characters.find((c) => c.name === dot.dataset.name);
      if (char) {
        char.beliefX = x;
        char.beliefY = y;
        localStorage.setItem(currentProject, JSON.stringify(characters));

        // ⬇ そのキャラのカードだけ更新（全文描画はしない）
        updateCharacterCardCoordinates(char.name, x, y);
      }
    });

    document.addEventListener("mouseup", () => {
      if (isDragging) {
        isDragging = false;
        dot.style.zIndex = "";
      }
    });
  });
}

enableMatrixDrag(); // 👈これ追加！！






// モーダル操作

function openEditModal(index) {
  const char = characters[index];
  if (!char) return;

  modalName.value = char.name || "";
  modalBelief.value = char.belief || "";
  modalPersonality.value = char.gapPersonality || "";
  modalAbility.value = char.gapAbility || "";
  modalBackground.value = char.gapBackground || "";
  modalX.value = char.beliefX ?? "";
  modalY.value = char.beliefY ?? "";

  editingIndex = index;
  console.log("モーダル表示処理中");
  document.getElementById("editModal").classList.remove("hidden");
}

function closeEditModal() {
  document.getElementById("editModal").classList.add("hidden");
  editingIndex = null;
}


document.addEventListener("DOMContentLoaded", () => {
  const modalSave = document.getElementById("modalSave");
  const modalCancel = document.getElementById("modalCancel");
  const editModal = document.getElementById("editModal");

  modalSave.addEventListener("click", () => {
    if (editingIndex === null) return;

    const parsedX = parseFloat(modalX.value);
    const parsedY = parseFloat(modalY.value);

    characters[editingIndex] = {
      name: modalName.value.trim(),
      belief: modalBelief.value.trim(),
      gapPersonality: modalPersonality.value.trim(),
      gapAbility: modalAbility.value.trim(),
      gapBackground: modalBackground.value.trim(),
      beliefX: isNaN(parsedX) ? 0.5 : parsedX,
      beliefY: isNaN(parsedY) ? 0.5 : parsedY,
    };

    localStorage.setItem(currentProject, JSON.stringify(characters));
    renderCharacters();
    renderMatrix();
    enableMatrixDrag();
    closeEditModal();
  });

  modalCancel.addEventListener("click", closeEditModal);

  editModal.addEventListener("click", (e) => {
    if (e.target === editModal) closeEditModal();
  });
});

function updateCharacterCardCoordinates(name, x, y) {
  const card = Array.from(document.querySelectorAll(".character-card")).find(
    (c) => c.querySelector("h3")?.textContent === name
  );

  if (!card) return;

  const coordText = card.querySelector("p:last-of-type");
  if (coordText) {
    coordText.innerHTML = `<strong class="text-green-700">マトリクス座標：</strong> x: ${x.toFixed(
      2
    )}, y: ${y.toFixed(2)}`;
  }
}