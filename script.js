/*
 * キャラクター管理アプリ main script
 * - キャラ管理
 * - サジェスト管理
 * - プロジェクト管理
 * - マトリクス描画・ドラッグ
 *
 * 主な修正・改善点:
 * - Y座標の反転一貫性
 * - UI/UX改善
 * - コード整理
 */

// ===== 初期化・定数宣言 =====
const nameInput = document.getElementById("nameInput");
const beliefInput = document.getElementById("beliefInput");
const saveButton = document.getElementById("saveButton");
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
const freeNoteInput = document.getElementById("freeNoteInput");
const groupInput = document.getElementById("groupInput");
const modalGroup = document.getElementById("modalGroup");

// 作品名編集関連の要素
const editProjectNameBtn = document.getElementById("editProjectNameBtn");
const editProjectNameArea = document.getElementById("editProjectNameArea");
const editProjectNameInput = document.getElementById("editProjectNameInput");
const saveProjectNameBtn = document.getElementById("saveProjectNameBtn");

// グループ管理関連の要素
const groupListContainer = document.getElementById("groupListContainer");
const newGroupNameInput = document.getElementById("newGroupName");
const addGroupButton = document.getElementById("addGroupButton");

// ===== データ構造 =====
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
    ability: [
      "不正な手段での成功",
      "他人の努力を利用する能力",
      "一撃必殺のパンチ",
    ],
    background: ["過去に努力が報われなかった経験"],
  },
};
const beliefCoordinates = {
  誠実主義: { x: 0.6, y: 0.7 },
  自己肯定主義: { x: 0.3, y: 0.6 },
  合理主義: { x: 0.9, y: 0.8 },
  感情主義: { x: 0.1, y: 0.5 },
  秩序主義: { x: 0.5, y: 1.0 },
  自由主義: { x: 0.4, y: 0.1 },
};

// ===== プロジェクト管理 =====
let currentProject = projectSelect.value;
let characters = getCharacters(currentProject);
let editingIndex = null;
let editIndex = -1;

// ===== グループ名管理 =====
function getGroupList(project) {
  const saved = localStorage.getItem(project + "_groupList");
  return saved ? JSON.parse(saved) : [];
}
function saveGroupList(project, groupList) {
  localStorage.setItem(project + "_groupList", JSON.stringify(groupList));
}
let groupList = getGroupList(currentProject);

function addGroupsToList(groups) {
  let updated = false;
  groups.forEach(g => {
    if (g && !groupList.includes(g)) {
      groupList.push(g);
      updated = true;
    }
  });
  if (updated) {
    saveGroupList(currentProject, groupList);
    renderGroupList();
  }
}

// ✅ 起動時に作品一覧を復元
const savedProjectList = localStorage.getItem("projectList");
if (savedProjectList) {
  const projects = JSON.parse(savedProjectList);
  projectSelect.innerHTML = ""; // 一旦リセット
  projects.forEach((p) => {
    const option = document.createElement("option");
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
  renderMatrix();
  renderGroupList();

  newProjectNameInput.value = "";
  saveProjectList(); // 👈 追加！
});

// 作品名編集機能
editProjectNameBtn.addEventListener("click", () => {
  const currentOption = projectSelect.options[projectSelect.selectedIndex];
  if (!currentOption) return;
  
  editProjectNameInput.value = currentOption.textContent;
  editProjectNameArea.style.display = "flex";
  editProjectNameInput.focus();
});

saveProjectNameBtn.addEventListener("click", () => {
  const newName = editProjectNameInput.value.trim();
  if (!newName) return;
  
  const currentOption = projectSelect.options[projectSelect.selectedIndex];
  if (!currentOption) return;
  
  currentOption.textContent = newName;
  editProjectNameArea.style.display = "none";
  saveProjectList();
});

// Enterキーで保存
editProjectNameInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    saveProjectNameBtn.click();
  }
});

// プロジェクト選択変更時の処理
projectSelect.addEventListener("change", () => {
  currentProject = projectSelect.value;
  characters = getCharacters(currentProject);
  groupList = getGroupList(currentProject);
  renderCharacters();
  renderMatrix();
  renderGroupList();
  
  // 編集エリアを非表示にする
  editProjectNameArea.style.display = "none";
});

function getCharacters(project) {
  const saved = localStorage.getItem(project);
  return saved ? JSON.parse(saved) : [];
}

function renderCharacters() {
  characterList.innerHTML = "";
  if (characters.length === 0) {
    const emptyMsg = document.createElement("div");
    emptyMsg.className = "text-gray-400 p-8 w-full text-center";
    emptyMsg.textContent = "キャラクターがまだ登録されていません。左のフォームから追加してください。";
    characterList.appendChild(emptyMsg);
    return;
  }
  let filtered = characters;
  if (currentGroupFilter) {
    filtered = characters.filter(c => c.groups && c.groups.includes(currentGroupFilter));
  }
  filtered.forEach((char, index) => {
    const charItem = document.createElement("div");
    charItem.className = "character-card";
    charItem.dataset.name = char.name;
    const content = document.createElement("div");
    // グループバッジHTML生成
    let groupHtml = '';
    if (char.groups && char.groups.length) {
      groupHtml = `<span class='group-badges' style='float:right;'>` + char.groups.map(g => `<span class='group-badge'>${g}</span>`).join('') + `</span>`;
    }
    content.innerHTML = `
      <h3 class="card-title">${char.name}${groupHtml}</h3>
      <p><strong>主義：</strong>${char.belief || "（未設定）"}</p>
      <p><strong>性格ギャップ：</strong>${char.gapPersonality || "（なし）"}</p>
      <p><strong>能力ギャップ：</strong>${char.gapAbility || "（なし）"}</p>
      <p><strong>生い立ちギャップ：</strong>${char.gapBackground || "（なし）"}</p>
      <p><strong>自由記述：</strong>${char.freeNote || "（なし）"}</p>
    `;
    // 編集ボタン
    const editButton = document.createElement("button");
    editButton.textContent = "編集";
    editButton.className = "button btn-edit";
    editButton.addEventListener("click", () => {
      openEditModal(index);
    });
    // 削除ボタン
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "削除";
    deleteButton.className = "button btn-delete";
    deleteButton.addEventListener("click", () => {
      characters.splice(index, 1);
      localStorage.setItem(currentProject, JSON.stringify(characters));
      renderCharacters();
    });
    const buttonGroup = document.createElement("div");
    buttonGroup.className = "button-group";
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
      const newOrder = Array.from(characterList.children).map((card) => {
        const name = card.querySelector("h3").textContent;
        return characters.find((c) => c.name === name);
      });
      characters = newOrder;
      localStorage.setItem(currentProject, JSON.stringify(characters));
      renderCharacters(); // 並び替え後に再描画してイベントバインドを維持
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

  // type名→日本語ラベル変換
  const typeLabels = {
    personality: "性格のギャップ候補",
    ability: "能力のギャップ候補",
    background: "生い立ちのギャップ候補"
  };

  for (const type in suggestions) {
    const group = document.createElement("div");
    group.innerHTML = `<strong class="block mb-1">${typeLabels[type] || type}：</strong>`;

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

// トースト通知関数を追加
function showToast(message, type = 'info') {
  let toast = document.createElement('div');
  toast.className = `toast-message toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => { toast.classList.add('show'); }, 10);
  setTimeout(() => { toast.classList.remove('show'); setTimeout(()=>toast.remove(), 400); }, 2200);
}

// 保存ボタン処理
saveButton.addEventListener("click", () => {
  const name = nameInput.value.trim();
  if (!name) {
    showToast('キャラ名を入力してください', 'error');
    return;
  }
  if (characters.some(c => c.name === name)) {
    showToast('同じ名前のキャラが既に存在します', 'error');
    return;
  }
  const belief = beliefInput.value.trim();
  const gapPersonality = gapPersonalityInput.value.trim();
  const gapAbility = gapAbilityInput.value.trim();
  const gapBackground = gapBackgroundInput.value.trim();
  const freeNote = freeNoteInput.value.trim();
  const beliefX = parseFloat(beliefXInput.value);
  const beliefY = parseFloat(beliefYInput.value);
  if ((beliefX < 0 || beliefX > 1) || isNaN(beliefX)) {
    showToast('X座標は0～1の範囲で入力してください', 'error');
    return;
  }
  if ((beliefY < 0 || beliefY > 1) || isNaN(beliefY)) {
    showToast('Y座標は0～1の範囲で入力してください', 'error');
    return;
  }
  const groups = groupInput.value.split(",").map(g => g.trim()).filter(g => g);
  const character = {
    name,
    belief,
    gapPersonality,
    gapAbility,
    gapBackground,
    freeNote,
    beliefX,
    beliefY,
    groups,
  };
  characters.push(character);
  localStorage.setItem(currentProject, JSON.stringify(characters));
  addGroupsToList(groups);
  // フォームをリセット
  nameInput.value = "";
  beliefInput.value = "";
  gapPersonalityInput.value = "";
  gapAbilityInput.value = "";
  gapBackgroundInput.value = "";
  freeNoteInput.value = "";
  beliefXInput.value = "";
  beliefYInput.value = "";
  groupInput.value = "";
  renderCharacters();
  renderMatrix();
  renderGroupList();
  showToast('キャラクターを保存しました', 'success');
});

// トーストCSSを追加する（style.cssに追記推奨）
if (!document.getElementById('toast-style')) {
  const style = document.createElement('style');
  style.id = 'toast-style';
  style.textContent = `
  .toast-message {
    position: fixed;
    right: 24px;
    bottom: 24px;
    min-width: 180px;
    max-width: 80vw;
    background: #333;
    color: #fff;
    padding: 12px 24px;
    border-radius: 999px;
    font-size: 1rem;
    opacity: 0;
    pointer-events: none;
    z-index: 9999;
    box-shadow: 0 2px 8px rgba(0,0,0,0.18);
    transition: opacity 0.3s, transform 0.3s;
    transform: translateY(40px);
  }
  .toast-message.show {
    opacity: 1;
    pointer-events: auto;
    transform: translateY(0);
  }
  .toast-message.toast-success { background: #4CAF50; }
  .toast-message.toast-error { background: #F44336; }
  .toast-message.toast-info { background: #2196F3; }
  `;
  document.head.appendChild(style);
}

// 🔄 サジェスト辞書を localStorage から読み込み
const storedSuggestion = localStorage.getItem("suggestionData");
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

// 削除ボタンのイベントリスナー
deleteProjectButton.addEventListener("click", () => {
  if (projectSelect.options.length <= 1) {
    alert("デフォルト作品は削除できません。");
    return;
  }
  
  if (!confirm("選択中の作品を削除しますか？\nこの操作は取り消せません。")) {
    return;
  }
  
  const currentIndex = projectSelect.selectedIndex;
  const projectValue = projectSelect.value;
  
  // ローカルストレージから削除
  localStorage.removeItem(projectValue);
  localStorage.removeItem(projectValue + "_groupList");
  
  // セレクトボックスから削除
  projectSelect.remove(currentIndex);
  
  // 最初の作品を選択
  projectSelect.selectedIndex = 0;
  currentProject = projectSelect.value;
  characters = getCharacters(currentProject);
  groupList = getGroupList(currentProject);
  
  renderCharacters();
  renderMatrix();
  saveProjectList();
});

// ✅ エクスポート処理
exportButton.addEventListener("click", () => {
  const dataStr = JSON.stringify(characters, null, 2); // 見やすく整形
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `${currentProject}.json`;
  a.click();

  URL.revokeObjectURL(url);
});
// ✅ インポート処理
importFile.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = (e) => {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported))
        throw new Error("JSON形式が正しくありません");

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

/* 修正ポイントの概要：
1. beliefYの反転処理を明確に整理：保存時、編集時、表示時の一貫性。
2. マトリクス要素の座標更新バグ（上下反転）を修正。
3. matrix-charの要素が2重生成されるのを防ぐ。
4. enableMatrixDragが多重に登録されないように修正。*/

let isDragging = false;
let currentDot = null;
let hasDragListeners = false; // ⭐追加：一度だけドラッグイベントを登録するため

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
    dot.dataset.name = char.name;

    dot.style.left = `${x * 100}%`;
    dot.style.top = `${(1 - y) * 100}%`; // ⭐上下反転して表示（表示のみ反転）
    dot.style.transform = "translate(-50%, -50%)";

    matrixContainer.appendChild(dot);
  });

  if (!hasDragListeners) {
    enableMatrixDrag();
    hasDragListeners = true;
  }
}

function enableMatrixDrag() {
  const matrixContainer = document.getElementById("matrix-container");
  if (!matrixContainer) return;

  matrixContainer.addEventListener("mousedown", (e) => {
    if (e.target.classList.contains("matrix-char")) {
      isDragging = true;
      currentDot = e.target;
      currentDot.style.zIndex = 1000;
    }
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging || !currentDot) return;

    const rect = matrixContainer.getBoundingClientRect();
    const x = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    const y = Math.min(Math.max((e.clientY - rect.top) / rect.height, 0), 1);

    currentDot.style.left = `${x * 100}%`;
    currentDot.style.top = `${y * 100}%`; // ⭐ドラッグ中は素直に表示
    currentDot.style.transform = "translate(-50%, -50%)";

    const name = currentDot.dataset.name;
    const char = characters.find((c) => c.name === name);
    if (char) {
      char.beliefX = x;
      char.beliefY = 1 - y; // ⭐反転して保存
      localStorage.setItem(currentProject, JSON.stringify(characters));
      updateCharacterCardCoordinates(name, x, 1 - y);
    }
  });

  document.addEventListener("mouseup", () => {
    if (isDragging && currentDot) {
      currentDot.style.zIndex = "";
      isDragging = false;
      currentDot = null;
    }
  });
}

function updateCharacterCardCoordinates(name, x, y) {
  const card = document.querySelector(`.character-card[data-name="${name}"]`);
  if (!card) return;

  const coordText = Array.from(card.querySelectorAll("p")).find((p) =>
    p.textContent.includes("マトリクス座標")
  );

  if (coordText) {
    coordText.innerHTML = `<strong class="text-green-700">マトリクス座標：</strong> x: ${x.toFixed(
      2
    )}, y: ${y.toFixed(2)}`;
  }
}

// 🔁 他の部分にあった renderMatrix や enableMatrixDrag 呼び出し箇所はそのままでOK
// この修正版だけ貼り替えれば、上下反転問題などが改善される

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
  document.getElementById("modalFreeNote").value = char.freeNote || "";
  modalX.value = char.beliefX ?? "";
  modalY.value =
    typeof char.beliefY === "number" ? char.beliefY.toFixed(2) : ""; // ✅ ←ここ反転しない！！
  modalGroup.value = char.groups ? char.groups.join(",") : "";

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
    const groups = modalGroup.value.split(",").map(g => g.trim()).filter(g => g);
    characters[editingIndex] = {
      name: modalName.value.trim(),
      belief: modalBelief.value.trim(),
      gapPersonality: modalPersonality.value.trim(),
      gapAbility: modalAbility.value.trim(),
      gapBackground: modalBackground.value.trim(),
      freeNote: document.getElementById("modalFreeNote").value.trim(),
      beliefX: isNaN(parsedX) ? 0.5 : parsedX,
      beliefY: isNaN(parsedY) ? 0.5 : 1 - parsedY,
      groups,
    };
    localStorage.setItem(currentProject, JSON.stringify(characters));
    renderCharacters();
    renderMatrix();
    enableMatrixDrag();
    closeEditModal();
    addGroupsToList(groups);
  });

  modalCancel.addEventListener("click", closeEditModal);

  editModal.addEventListener("mousedown", (e) => {
    if (e.target === e.currentTarget) closeEditModal();
  });
});

// ===== 折りたたみUIの制御（3パネル対応、1か所に統一） =====
document.addEventListener("DOMContentLoaded", () => {
  const toggleProjectUI = document.getElementById("toggleProjectUI");
  const projectUI = document.getElementById("projectUI");
  const toggleSuggestionUI = document.getElementById("toggleSuggestionUI");
  const suggestionUI = document.getElementById("suggestionUI");
  const toggleMatrixUI = document.getElementById("toggleMatrixUI");
  const matrixUI = document.getElementById("matrixUI");

  function closeAllDropdowns() {
    if (projectUI) projectUI.classList.add("hidden");
    if (suggestionUI) suggestionUI.classList.add("hidden");
    if (matrixUI) matrixUI.classList.add("hidden");
  }

  if (toggleProjectUI && projectUI) {
    toggleProjectUI.addEventListener("click", () => {
      const isOpen = !projectUI.classList.contains("hidden");
      closeAllDropdowns();
      if (!isOpen) projectUI.classList.remove("hidden");
    });
  }
  if (toggleSuggestionUI && suggestionUI) {
    toggleSuggestionUI.addEventListener("click", () => {
      const isOpen = !suggestionUI.classList.contains("hidden");
      closeAllDropdowns();
      if (!isOpen) suggestionUI.classList.remove("hidden");
    });
  }
  if (toggleMatrixUI && matrixUI) {
    toggleMatrixUI.addEventListener("click", () => {
      const isOpen = !matrixUI.classList.contains("hidden");
      closeAllDropdowns();
      if (!isOpen) matrixUI.classList.remove("hidden");
    });
  }
  
  // 初期化時にグループ一覧を表示
  renderGroupList();
});

// ===== マトリクスマップ描画 =====
function renderMatrix() {
  const matrixContainer = document.getElementById("matrix-container");
  matrixContainer.querySelectorAll(".matrix-char").forEach((el) => el.remove());

  characters.forEach((char) => {
    const x = typeof char.beliefX === "number" ? char.beliefX : 0.5;
    const y = typeof char.beliefY === "number" ? char.beliefY : 0.5;
    const dot = document.createElement("div");
    dot.className = "matrix-char";
    dot.textContent = char.name;
    dot.dataset.name = char.name;
    dot.style.left = `${x * 100}%`;
    dot.style.top = `${(1 - y) * 100}%`;
    dot.style.transform = "translate(-50%, -50%)";
    matrixContainer.appendChild(dot);
  });
}

// ===== サジェスト描画 =====
function renderGroupSuggest(inputElem, suggestArea, currentValue) {
  suggestArea.innerHTML = "";
  if (!groupList.length) return;
  const input = currentValue.split(",").pop().trim();
  if (!input) return;
  const candidates = groupList.filter(g => g.includes(input) && !currentValue.split(",").map(s=>s.trim()).includes(g));
  candidates.slice(0, 5).forEach(g => {
    const btn = document.createElement("button");
    btn.textContent = g;
    btn.className = "group-suggest-btn";
    btn.addEventListener("click", () => {
      let vals = currentValue.split(",").map(s=>s.trim()).filter(Boolean);
      vals.pop();
      vals.push(g);
      inputElem.value = vals.join(",") + ", ";
      suggestArea.innerHTML = "";
      inputElem.focus();
    });
    suggestArea.appendChild(btn);
  });
}

groupInput.addEventListener("input", () => {
  renderGroupSuggest(groupInput, document.getElementById("groupSuggestArea"), groupInput.value);
});
modalGroup.addEventListener("input", () => {
  renderGroupSuggest(modalGroup, document.getElementById("modalGroupSuggestArea"), modalGroup.value);
});

// ===== フィルタ機能 =====
let currentGroupFilter = null;
const groupFilterBtn = document.getElementById("groupFilterBtn");
const groupFilterDropdown = document.getElementById("groupFilterDropdown");

groupFilterBtn.addEventListener("click", () => {
  if (groupFilterDropdown.style.display === "none" || !groupFilterDropdown.style.display) {
    renderGroupFilterDropdown();
    groupFilterDropdown.style.display = "block";
  } else {
    groupFilterDropdown.style.display = "none";
  }
});

document.addEventListener("click", (e) => {
  if (!groupFilterBtn.contains(e.target) && !groupFilterDropdown.contains(e.target)) {
    groupFilterDropdown.style.display = "none";
  }
});

function renderGroupFilterDropdown() {
  groupFilterDropdown.innerHTML = "";
  if (groupList.length === 0) {
    groupFilterDropdown.innerHTML = '<div style="padding:8px;">グループ未登録</div>';
    return;
  }
  if (currentGroupFilter) {
    const clearBtn = document.createElement("button");
    clearBtn.textContent = "フィルタ解除（全表示）";
    clearBtn.onclick = () => {
      currentGroupFilter = null;
      groupFilterDropdown.style.display = "none";
      renderCharacters();
    };
    groupFilterDropdown.appendChild(clearBtn);
  }
  groupList.forEach(g => {
    const btn = document.createElement("button");
    btn.textContent = g;
    btn.onclick = () => {
      currentGroupFilter = g;
      groupFilterDropdown.style.display = "none";
      renderCharacters();
    };
    if (g === currentGroupFilter) btn.style.fontWeight = "bold";
    groupFilterDropdown.appendChild(btn);
  });
}

// グループ追加ボタンのイベントリスナー
addGroupButton.addEventListener("click", () => {
  const newGroupName = newGroupNameInput.value.trim();
  if (!newGroupName) return;
  
  if (groupList.includes(newGroupName)) {
    alert('このグループ名は既に存在します。');
    return;
  }
  
  groupList.push(newGroupName);
  saveGroupList(currentProject, groupList);
  renderGroupList();
  renderGroupFilterDropdown();
  
  newGroupNameInput.value = "";
});

// Enterキーでグループ追加
newGroupNameInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    addGroupButton.click();
  }
});

// グループ一覧を表示する関数
function renderGroupList() {
  if (!groupListContainer) return;
  groupListContainer.innerHTML = "";
  if (groupList.length === 0) {
    groupListContainer.innerHTML = '<div class="text-gray-500 text-sm">グループが登録されていません</div>';
    return;
  }
  groupList.forEach((groupName, index) => {
    const groupItem = document.createElement("div");
    groupItem.className = "flex items-center justify-between p-2 bg-gray-50 rounded mb-1";
    // インライン編集用の状態
    if (groupListContainer._editingIndex === index) {
      groupItem.innerHTML = `
        <input type="text" class="input" value="${groupName}" style="width:120px;" aria-label="グループ名編集欄" />
        <div class="flex gap-1">
          <button class="button btn-save text-xs">保存</button>
          <button class="button btn-cancel text-xs">キャンセル</button>
        </div>
      `;
      const input = groupItem.querySelector('input');
      setTimeout(()=>input.focus(), 10);
      groupItem.querySelector('.btn-save').onclick = () => {
        const newName = input.value.trim();
        if (newName && newName !== groupName && !groupList.includes(newName)) {
          updateGroupName(groupName, newName);
        } else if (groupList.includes(newName)) {
          showToast('同じグループ名が既に存在します', 'error');
        }
        groupListContainer._editingIndex = null;
        renderGroupList();
      };
      groupItem.querySelector('.btn-cancel').onclick = () => {
        groupListContainer._editingIndex = null;
        renderGroupList();
      };
      input.addEventListener('keydown', e => {
        if (e.key === 'Enter') groupItem.querySelector('.btn-save').click();
        if (e.key === 'Escape') groupItem.querySelector('.btn-cancel').click();
      });
    } else {
      groupItem.innerHTML = `
        <span class="group-name">${groupName}</span>
        <div class="flex gap-1">
          <button class="edit-group-btn button btn-edit text-xs" data-index="${index}">編集</button>
          <button class="delete-group-btn button btn-delete text-xs" data-index="${index}">削除</button>
        </div>
      `;
      groupItem.querySelector('.edit-group-btn').onclick = () => {
        groupListContainer._editingIndex = index;
        renderGroupList();
      };
      groupItem.querySelector('.delete-group-btn').onclick = () => {
        if (confirm(`グループ「${groupName}」を削除しますか？\nこのグループに属するキャラクターからも削除されます。`)) {
          deleteGroup(groupName);
        }
      };
    }
    groupListContainer.appendChild(groupItem);
  });
}

// グループ名を更新する関数
function updateGroupName(oldName, newName) {
  // グループリストを更新
  const index = groupList.indexOf(oldName);
  if (index !== -1) {
    groupList[index] = newName;
    saveGroupList(currentProject, groupList);
  }
  
  // キャラクターのグループを更新
  let updated = false;
  characters.forEach(char => {
    if (char.groups && char.groups.includes(oldName)) {
      const groupIndex = char.groups.indexOf(oldName);
      char.groups[groupIndex] = newName;
      updated = true;
    }
  });
  
  if (updated) {
    localStorage.setItem(currentProject, JSON.stringify(characters));
    renderCharacters();
  }
  
  renderGroupList();
  renderGroupFilterDropdown();
}

// グループを削除する関数
function deleteGroup(groupName) {
  // グループリストから削除
  const index = groupList.indexOf(groupName);
  if (index !== -1) {
    groupList.splice(index, 1);
    saveGroupList(currentProject, groupList);
  }
  
  // キャラクターのグループから削除
  let updated = false;
  characters.forEach(char => {
    if (char.groups && char.groups.includes(groupName)) {
      char.groups = char.groups.filter(g => g !== groupName);
      updated = true;
    }
  });
  
  if (updated) {
    localStorage.setItem(currentProject, JSON.stringify(characters));
    renderCharacters();
  }
  
  renderGroupList();
  renderGroupFilterDropdown();
}

// モーダルの外側クリックやESCキーで閉じる
const editModal = document.getElementById("editModal");
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !editModal.classList.contains("hidden")) {
    closeEditModal();
  }
});
editModal.addEventListener("mousedown", (e) => {
  if (e.target === e.currentTarget) closeEditModal();
});
