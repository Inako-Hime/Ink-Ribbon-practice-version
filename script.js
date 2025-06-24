/* =========================
  Ink Ribbon キャラクター管理サイト main script
  初心者向け：各セクション・関数に丁寧なコメント
========================= */

// =========================
// 1. 定数・グローバル変数宣言
// =========================
// 画面上の各要素（input, button, selectなど）を取得して変数に格納
// これにより、後で「nameInput.value」などで値を取得・設定できる
const nameInput = document.getElementById("nameInput"); // キャラ名入力欄
const beliefInput = document.getElementById("beliefInput"); // 主義入力欄
const saveButton = document.getElementById("saveButton"); // キャラ保存ボタン
const characterList = document.getElementById("character-list"); // キャラ一覧表示エリア
const projectSelect = document.getElementById("projectSelect"); // 作品選択プルダウン
const addProjectButton = document.getElementById("addProjectButton"); // 作品追加ボタン
const newProjectNameInput = document.getElementById("newProjectName"); // 新規作品名入力欄
const deleteProjectButton = document.getElementById("deleteProjectButton"); // 作品削除ボタン
const exportButton = document.getElementById("exportButton"); // エクスポートボタン
const importFile = document.getElementById("importFile"); // インポートファイル選択
const gapPersonalityInput = document.getElementById("gapPersonality"); // 性格ギャップ入力欄
const gapAbilityInput = document.getElementById("gapAbility"); // 能力ギャップ入力欄
const gapBackgroundInput = document.getElementById("gapBackground"); // 生い立ちギャップ入力欄
const suggestionArea = document.getElementById("suggestionArea"); // サジェスト候補表示エリア
const suggestBelief = document.getElementById("suggestBelief"); // サジェスト主義名入力
const suggestType = document.getElementById("suggestType"); // サジェストタイプ選択
const suggestValue = document.getElementById("suggestValue"); // サジェスト候補文入力
const addSuggestion = document.getElementById("addSuggestion"); // サジェスト追加ボタン
const exportSuggestion = document.getElementById("exportSuggestion"); // サジェストエクスポート
const importSuggestion = document.getElementById("importSuggestion"); // サジェストインポート
const beliefXInput = document.getElementById("beliefX"); // マトリクスX座標入力
const beliefYInput = document.getElementById("beliefY"); // マトリクスY座標入力
const modalName = document.getElementById("modalName"); // モーダル内キャラ名
const modalBelief = document.getElementById("modalBelief"); // モーダル内主義
const modalPersonality = document.getElementById("modalPersonality"); // モーダル内性格ギャップ
const modalAbility = document.getElementById("modalAbility"); // モーダル内能力ギャップ
const modalBackground = document.getElementById("modalBackground"); // モーダル内生い立ちギャップ
const modalX = document.getElementById("modalX"); // モーダル内X座標
const modalY = document.getElementById("modalY"); // モーダル内Y座標
const freeNoteInput = document.getElementById("freeNoteInput"); // 自由記述欄
const groupInput = document.getElementById("groupInput"); // グループ入力欄
const modalGroup = document.getElementById("modalGroup"); // モーダル内グループ
const colorInput = document.getElementById("colorInput"); // カラー入力欄
const modalColor = document.getElementById("modalColor"); // モーダル内カラー

// ===== 作品名編集・グループ管理の要素 =====
const editProjectNameBtn = document.getElementById("editProjectNameBtn");
const editProjectNameArea = document.getElementById("editProjectNameArea");
const editProjectNameInput = document.getElementById("editProjectNameInput");
const saveProjectNameBtn = document.getElementById("saveProjectNameBtn");
const groupListContainer = document.getElementById("groupListContainer");
const newGroupNameInput = document.getElementById("newGroupName");
const addGroupButton = document.getElementById("addGroupButton");

// ===== データ構造 =====
// サジェスト辞書や主義座標など、アプリ内で使うデータの初期値
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

// ===== プロジェクト・キャラ・グループ管理 =====
let currentProject = projectSelect.value; // 現在選択中の作品ID
let characters = getCharacters(currentProject); // 現在のキャラ配列
let editingIndex = null; // 編集中キャラのインデックス
let editIndex = -1; // 旧式の編集用（今は未使用）

// ===== グループ名管理 =====
/**
 * 指定したプロジェクトのグループリストを取得
 * @param {string} project - プロジェクトID
 * @returns {string[]} グループ名配列
 */
function getGroupList(project) {
  const saved = localStorage.getItem(project + "_groupList");
  return saved ? JSON.parse(saved) : [];
}
/**
 * 指定したプロジェクトのグループリストを保存
 * @param {string} project - プロジェクトID
 * @param {string[]} groupList - グループ名配列
 */
function saveGroupList(project, groupList) {
  localStorage.setItem(project + "_groupList", JSON.stringify(groupList));
}
let groupList = getGroupList(currentProject);

/**
 * グループ名配列に新しいグループを追加し、必要なら保存・再描画
 * @param {string[]} groups - 追加するグループ名配列
 */
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
  saveProjectList(); 
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
  // カスタム項目編集欄も再描画
  renderFieldEditUI();
  // 作品切り替え時に保存
  localStorage.setItem('lastOpenedProject', projectSelect.value);
});

/**
 * キャラクターオブジェクトが有効かどうかを判定
 * @param {object} c
 * @returns {boolean}
 */
function isValidCharacter(c) {
  if (!c || typeof c !== 'object') return false;
  if (typeof c.name !== 'string' || !c.name.trim()) return false;
  if (c.beliefX !== undefined && (typeof c.beliefX !== 'number' || c.beliefX < 0 || c.beliefX > 1)) return false;
  if (c.beliefY !== undefined && (typeof c.beliefY !== 'number' || c.beliefY < 0 || c.beliefY > 1)) return false;
  if (c.color && !/^#[0-9a-fA-F]{6}$/.test(c.color)) return false;
  // 他にも必要なら追加
  return true;
}

function getCharacters(project) {
  const saved = localStorage.getItem(project);
  if (!saved) return [];
  try {
    const arr = JSON.parse(saved);
    if (!Array.isArray(arr)) return [];
    // 厳密なバリデーション
    const valid = arr.filter(isValidCharacter);
    const invalidCount = arr.length - valid.length;
    if (invalidCount > 0) {
      showToast(`不正なキャラデータ${invalidCount}件を除外しました`, 'error');
      // 自動修復（不正データを除外して保存し直す）
      localStorage.setItem(project, JSON.stringify(valid));
    }
    return valid;
  } catch {
    return [];
  }
}

let sortableInstance = null;

// =========================
// --- 検索用状態 ---
// =========================
let searchQuery = "";
const characterSearchInput = document.getElementById("characterSearchInput");
if (characterSearchInput) {
  characterSearchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value.trim();
    renderCharacters();
  });
}

// =========================
// 2. データ管理系関数
// =========================
/**
 * キャラクターカードの並び替え機能を初期化するサブ関数
 * @returns {void}
 */
function initCharacterSortable() {
  if (sortableInstance) {
    sortableInstance.destroy();
  }
  sortableInstance = new Sortable(characterList, {
    animation: 150,
    onEnd: () => {
      // 並び替え後のキャラ名リスト（表示中のみ）
      const movedNames = Array.from(characterList.children).map(card =>
        card.querySelector("h3").childNodes[0].textContent.trim()
      );
      // 検索・フィルタ後の表示中キャラ
      let filtered = characters;
      if (currentGroupFilter) {
        filtered = characters.filter(c => c.groups && c.groups.includes(currentGroupFilter));
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(c =>
          (c.name && c.name.toLowerCase().includes(q)) ||
          (c.belief && c.belief.toLowerCase().includes(q)) ||
          (Array.isArray(c.groups) && c.groups.some(g => g.toLowerCase().includes(q)))
        );
      }
      // 新しい順序のキャラ配列（表示中のみ）
      const newOrder = movedNames.map(name => filtered.find(c => c.name === name));
      // 全キャラ配列の中で、表示中キャラだけnewOrderで置き換え、非表示キャラはそのまま
      let newCharacters = [];
      let filteredIdx = 0;
      for (let i = 0; i < characters.length; i++) {
        if (filtered.includes(characters[i])) {
          newCharacters.push(newOrder[filteredIdx++] || characters[i]);
        } else {
          newCharacters.push(characters[i]);
        }
      }
      characters = newCharacters;
      localStorage.setItem(currentProject, JSON.stringify(characters));
      renderCharacters();
    },
  });
}

/**
 * キャラクター一覧を描画
 * @returns {void}
 */
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
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(c =>
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.belief && c.belief.toLowerCase().includes(q)) ||
      (Array.isArray(c.groups) && c.groups.some(g => g.toLowerCase().includes(q)))
    );
  }
  filtered.forEach((char, index) => {
    characterList.appendChild(createCharacterCard(char, index));
  });
  // 並び替え機能の初期化
  initCharacterSortable();
}

/**
 * キャラクターカードのタイトル部分（キャラ名＋グループバッジ＋色タグ）を生成するサブ関数
 * @param {object} char
 * @returns {string}
 */
function createCharacterCardTitle(char) {
  let groupHtml = createGroupBadges(char.groups);
  let colorTag = createColorTag(char.color);
  return `${char.name}${groupHtml}${colorTag}`;
}

/**
 * キャラクターカードの詳細情報部分（年齢・役割・主義・ギャップ・自由記述）を生成するサブ関数
 * @param {object} char
 * @returns {string}
 */
function createCharacterCardDetails(char) {
  // getAllFieldsの順序で全項目を表示。ただしマトリクス座標（beliefX, beliefY）は除外
  const fields = getAllFields(currentProject).filter(field => field.key !== 'beliefX' && field.key !== 'beliefY');
  return `<div class="character-card-vertical">
    ${fields.map(field => {
      const value = (char[field.key] !== undefined && char[field.key] !== "") ? char[field.key] : (field.type === "number" ? "（未設定）" : "（なし）");
      const label = field.label;
      const id = `card-value-${label}-${char.name.replace(/[^a-zA-Z0-9]/g, '')}`;
      return `
        <div class="card-field">
          <span class="card-label">${label}</span>
          <span class="card-value" id="${id}">${escapeHtml(value)}</span>
          ${(typeof value === 'string' && (value.length > 40 || value.includes('\n'))) ? `<button class="card-expand-btn" type="button" data-target="${id}">全文</button>` : ''}
        </div>
      `;
    }).join('')}
  </div>`;
}

// カード生成後に全文ボタンのイベントを付与
function setupCardExpandButtons(cardElem) {
  const btns = cardElem.querySelectorAll('.card-expand-btn');
  btns.forEach(btn => {
    btn.addEventListener('click', function() {
      const targetId = btn.getAttribute('data-target');
      const valueElem = cardElem.querySelector(`#${targetId}`);
      if (!valueElem) return;
      const expanded = valueElem.classList.toggle('expanded');
      btn.textContent = expanded ? '×' : '…';
    });
  });
}

/**
 * キャラクターカードの編集・削除ボタン部分を生成するサブ関数
 * @param {number} index
 * @returns {HTMLDivElement}
 */
function createCharacterCardButtons(index) {
  const editButton = createEditButton(index);
  const deleteButton = createDeleteButton(index);
    const buttonGroup = document.createElement("div");
    buttonGroup.className = "button-group";
    buttonGroup.appendChild(editButton);
    buttonGroup.appendChild(deleteButton);
  return buttonGroup;
}

/**
 * キャラクターカードのDOMを生成
 * @param {object} char - キャラクターオブジェクト
 * @param {number} index - キャラのインデックス
 * @returns {HTMLElement}
 */
function createCharacterCard(char, index) {
    const charItem = document.createElement("div");
    charItem.className = "character-card";
    charItem.dataset.name = char.name;
    const content = document.createElement("div");
    content.innerHTML = `
    <h3 class="card-title">${createCharacterCardTitle(char)}</h3>
    ${createCharacterCardDetails(char)}
  `;
    charItem.appendChild(content);
  charItem.appendChild(createCharacterCardButtons(index));
  // 全文ボタンのイベントを付与
  setupCardExpandButtons(charItem);
  return charItem;
}

/**
 * グループバッジHTMLを生成
 * @param {string[]} groups
 * @returns {string}
 */
function createGroupBadges(groups) {
  if (groups && groups.length) {
    return `<span class='group-badges' style='float:right;'>` + groups.map(g => `<span class='group-badge'>${g}</span>`).join('') + `</span>`;
  }
  return '';
}

/**
 * カラータグHTMLを生成
 * @param {string} color
 * @returns {string}
 */
function createColorTag(color) {
  return color ? `<span class=\"color-tag\" style=\"background:${color};display:inline-block;width:16px;height:16px;border-radius:4px;margin-left:6px;vertical-align:middle;border:1.5px solid #ccc;\"></span>` : '';
}

/**
 * 編集ボタンを生成
 * @param {number} index
 * @returns {HTMLButtonElement}
 */
function createEditButton(index) {
  const btn = document.createElement("button");
  btn.textContent = "編集";
  btn.className = "button btn-edit";
  btn.addEventListener("click", () => {
      openEditModal(index);
    });
  return btn;
}

/**
 * 削除ボタンを生成
 * @param {number} index
 * @returns {HTMLButtonElement}
 */
function createDeleteButton(index) {
  const btn = document.createElement("button");
  btn.textContent = "削除";
  btn.className = "button btn-delete";
  btn.addEventListener("click", () => {
      characters.splice(index, 1);
      localStorage.setItem(currentProject, JSON.stringify(characters));
      renderCharacters();
    });
  return btn;
}

// 入力に応じた候補表示処理
beliefInput.addEventListener("input", renderSuggestions);

/**
 * サジェスト候補グループ（typeごとのdiv）を生成するサブ関数
 * @param {string} type
 * @param {object} suggestions
 * @param {string} belief
 * @returns {HTMLDivElement}
 */
function createSuggestionGroup(type, suggestions, belief) {
  const typeLabels = {
    personality: "性格のギャップ候補",
    ability: "能力のギャップ候補",
    background: "生い立ちのギャップ候補"
  };
    const group = document.createElement("div");
  group.innerHTML = `<strong class=\"block mb-1\">${typeLabels[type] || type}：</strong>`;
    suggestions[type].slice(0, 3).forEach((gap, i) => {
    const wrap = createSuggestionCandidateButton(belief, type, gap, i);
    group.appendChild(wrap);
  });
  return group;
}

/**
 * 主義入力欄に応じたサジェスト候補を描画する
 * @returns {void}
 */
function renderSuggestions() {
  const belief = beliefInput.value.trim();
  const suggestions = suggestionData[belief];
  suggestionArea.innerHTML = "";
  if (!suggestions) return;
  for (const type in suggestions) {
    const group = createSuggestionGroup(type, suggestions, belief);
    suggestionArea.appendChild(group);
  }
}

/**
 * トースト通知を表示
 * @param {string} message - メッセージ
 * @param {string} [type] - 通知タイプ（info, error, success）
 */
function showToast(message, type = 'info') {
  let toast = document.createElement('div');
  toast.className = `toast-message toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => { toast.classList.add('show'); }, 10);
  setTimeout(() => { toast.classList.remove('show'); setTimeout(()=>toast.remove(), 400); }, 2200);
}

/**
 * トースト通知ラップ関数
 */
function showError(message) { showToast(message, 'error'); }
function showSuccess(message) { showToast(message, 'success'); }
function showInfo(message) { showToast(message, 'info'); }

// 保存ボタン処理
saveButton.addEventListener("click", () => {
  const name = document.getElementById("nameInput").value.trim();
  if (!isValidCharacterName(name)) {
    showError('キャラ名を入力してください');
    return;
  }
  if (characters.some(c => c.name === name)) {
    showError('同じ名前のキャラが既に存在します');
    return;
  }
  const belief = document.getElementById("beliefInput").value.trim();
  const gapPersonality = document.getElementById("gapPersonalityInput") ? document.getElementById("gapPersonalityInput").value.trim() : "";
  const gapAbility = document.getElementById("gapAbilityInput") ? document.getElementById("gapAbilityInput").value.trim() : "";
  const gapBackground = document.getElementById("gapBackgroundInput") ? document.getElementById("gapBackgroundInput").value.trim() : "";
  const freeNote = document.getElementById("freeNoteInput") ? document.getElementById("freeNoteInput").value.trim() : "";
  const beliefXInput = document.getElementById("beliefXInput");
  const beliefYInput = document.getElementById("beliefYInput");
  const beliefX = beliefXInput && beliefXInput.value === "" ? 0.5 : parseFloat(beliefXInput ? beliefXInput.value : "0.5");
  const beliefY = beliefYInput && beliefYInput.value === "" ? 0.5 : parseFloat(beliefYInput ? beliefYInput.value : "0.5");
  if (!isValidCoordinate(beliefX)) {
    showError('X座標は0～1の範囲で入力してください');
    return;
  }
  if (!isValidCoordinate(beliefY)) {
    showError('Y座標は0～1の範囲で入力してください');
    return;
  }
  const groupInput = document.getElementById("groupInput");
  const groups = groupInput ? groupInput.value.split(",").map(g => g.trim()).filter(g => g) : [];
  const colorInput = document.getElementById("colorInput");
  const color = colorInput && colorInput.value ? colorInput.value : "#b5ead7";
  if (color && !isValidColorCode(color)) {
    showError('カラーコードは#RRGGBB形式で入力してください');
    return;
  }
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
    color,
  };
  characters.push(character);
  localStorage.setItem(currentProject, JSON.stringify(characters));
  addGroupsToList(groups);
  // フォームをリセット
  if (document.getElementById("nameInput")) document.getElementById("nameInput").value = "";
  if (document.getElementById("beliefInput")) document.getElementById("beliefInput").value = "";
  if (document.getElementById("gapPersonalityInput")) document.getElementById("gapPersonalityInput").value = "";
  if (document.getElementById("gapAbilityInput")) document.getElementById("gapAbilityInput").value = "";
  if (document.getElementById("gapBackgroundInput")) document.getElementById("gapBackgroundInput").value = "";
  if (document.getElementById("freeNoteInput")) document.getElementById("freeNoteInput").value = "";
  if (document.getElementById("beliefXInput")) document.getElementById("beliefXInput").value = "";
  if (document.getElementById("beliefYInput")) document.getElementById("beliefYInput").value = "";
  if (document.getElementById("groupInput")) document.getElementById("groupInput").value = "";
  if (document.getElementById("colorInput")) document.getElementById("colorInput").value = "";
  renderCharacters();
  renderMatrix();
  renderGroupList();
  showSuccess('キャラクターを保存しました');
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
/**
 * サジェスト辞書データをlocalStorageに保存する
 * @returns {void}
 */
function saveSuggestionData() {
  localStorage.setItem("suggestionData", JSON.stringify(suggestionData));
}
addSuggestion.addEventListener("click", () => {
  const belief = suggestBelief.value.trim();
  const type = suggestType.value;
  const value = suggestValue.value.trim();

  if (!belief || !value) {
    showError("主義と候補内容を入力してください");
    return;
  }

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
    showSuccess("サジェストに追加しました！");
    suggestValue.value = "";
    renderSuggestions(); 
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
      showSuccess("インポート完了！辞書に統合されました。");
    } catch (err) {
      showError("JSONファイルの形式が正しくありません。");
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

      showSuccess("インポート成功しました");
    } catch (err) {
      showError("読み込み失敗：JSONファイルの形式が不正です");
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
let hasDragListeners = false; 
let lastFocusedElement = null;

/**
 * マトリクスマップ上のキャラドット要素を生成するサブ関数
 * @param {object} char - キャラクターオブジェクト
 * @param {number} i - インデックス
 * @returns {HTMLDivElement}
 */
function createMatrixCharDot(char, i) {
  const pastelColors = [
    '#ffd1dc', '#b5ead7', '#c7ceea', '#ffdac1', '#e2f0cb', '#b5ead7', '#f3b0c3', '#f6dfeb', '#f7cac9', '#92a8d1', '#f9f6ef', '#f6eac2'
  ];
  // 色が未設定なら自動割り当て
  if (!char.color || !/^#[0-9a-fA-F]{6}$/.test(char.color)) {
    char.color = pastelColors[i % pastelColors.length];
  }
    const x = typeof char.beliefX === "number" ? char.beliefX : 0.5;
    const y = typeof char.beliefY === "number" ? char.beliefY : 0.5;
    const dot = document.createElement("div");
  dot.className = "matrix-char";
    dot.textContent = char.name;
    dot.dataset.name = char.name;
  dot.title = char.name;
  dot.style.background = char.color;
  dot.style.color = "#3D312A";
    dot.style.left = `${x * 100}%`;
  dot.style.top = `${(1 - y) * 100}%`;
    dot.style.transform = "translate(-50%, -50%)";
  return dot;
}

/**
 * マトリクスマップを描画する
 * @returns {void}
 */
function renderMatrix() {
  const matrixContainer = document.getElementById("matrix-container");
  matrixContainer.querySelectorAll(".matrix-char").forEach((el) => el.remove());
  let needsSave = false;
  characters.forEach((char, i) => {
    // 色が未設定なら保存フラグ
    if (!char.color || !/^#[0-9a-fA-F]{6}$/.test(char.color)) {
      needsSave = true;
    }
    const dot = createMatrixCharDot(char, i);
    matrixContainer.appendChild(dot);
  });
  if (needsSave) {
    localStorage.setItem(currentProject, JSON.stringify(characters));
  }
  if (!hasDragListeners) {
    enableMatrixDrag();
    hasDragListeners = true;
  }
}

/**
 * マトリクスマップ上のキャラドットのドラッグ操作を有効化する
 * @returns {void}
 */
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

/**
 * キャラクターカードの座標表示を更新する
 * @param {string} name - キャラ名
 * @param {number} x - X座標
 * @param {number} y - Y座標
 * @returns {void}
 */
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

enableMatrixDrag(); // これ追加！！

// モーダル操作

/**
 * 編集モーダルに値をセットするサブ関数
 * @param {object} char
 */
function setEditModalValues(char) {
  modalName.value = char.name || "";
  modalBelief.value = char.belief || "";
  modalPersonality.value = char.gapPersonality || "";
  modalAbility.value = char.gapAbility || "";
  modalBackground.value = char.gapBackground || "";
  document.getElementById("modalFreeNote").value = char.freeNote || "";
  modalX.value = char.beliefX ?? "";
  modalY.value = typeof char.beliefY === "number" ? char.beliefY.toFixed(2) : "";
  modalGroup.value = char.groups ? char.groups.join(",") : "";
  modalColor.value = char.color || "#b5ead7";
}
/**
 * 編集モーダルをリセットするサブ関数
 */
function resetEditModal() {
  modalName.value = "";
  modalBelief.value = "";
  modalPersonality.value = "";
  modalAbility.value = "";
  modalBackground.value = "";
  document.getElementById("modalFreeNote").value = "";
  modalX.value = "";
  modalY.value = "";
  modalGroup.value = "";
  modalColor.value = "#b5ead7";
}

/**
 * キャラ編集モーダルを開く
 * @param {number} index
 * @returns {void}
 */
function openEditModal(index) {
  const char = characters[index];
  if (!char) return;
  setEditModalValues(char);
  editingIndex = index;
  lastFocusedElement = document.activeElement;
  document.getElementById("editModal").classList.remove("hidden");
  setTimeout(() => { modalName.focus(); }, 10);
}

/**
 * キャラ編集モーダルを閉じる
 * @returns {void}
 */
function closeEditModal() {
  document.getElementById("editModal").classList.add("hidden");
  editingIndex = null;
  resetEditModal();
  if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
    setTimeout(() => { lastFocusedElement.focus(); }, 10);
    lastFocusedElement = null;
  }
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
    const color = modalColor.value || "#b5ead7";
    characters[editingIndex] = {
      name: modalName.value.trim(),
      // age: modalAge.value.trim(),
      // role: modalRole.value.trim(),
      belief: modalBelief.value.trim(),
      gapPersonality: modalPersonality.value.trim(),
      gapAbility: modalAbility.value.trim(),
      gapBackground: modalBackground.value.trim(),
      freeNote: document.getElementById("modalFreeNote").value.trim(),
      beliefX: isNaN(parsedX) ? 0.5 : parsedX,
      beliefY: isNaN(parsedY) ? 0.5 : 1 - parsedY,
      groups,
      color,
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
// （ここにある古いrenderMatrix関数を削除）

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

// --- グローバルイベントリスナー登録フラグ ---
let hasModalListeners = false;
let hasGroupFilterListeners = false;

// モーダルの外側クリックやESCキーで閉じる
function setupModalListeners() {
  if (hasModalListeners) return;
  const editModal = document.getElementById("editModal");
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !editModal.classList.contains("hidden")) {
      closeEditModal();
    }
  });
  editModal.addEventListener("mousedown", (e) => {
    if (e.target === e.currentTarget) closeEditModal();
  });
  hasModalListeners = true;
}
setupModalListeners();

// グループフィルタ外側クリック
function setupGroupFilterListeners() {
  if (hasGroupFilterListeners) return;
document.addEventListener("click", (e) => {
  if (!groupFilterBtn.contains(e.target) && !groupFilterDropdown.contains(e.target)) {
    groupFilterDropdown.style.display = "none";
  }
});
  hasGroupFilterListeners = true;
}
setupGroupFilterListeners();

// グループ追加ボタンのイベントリスナー
addGroupButton.addEventListener("click", () => {
  const newGroupName = newGroupNameInput.value.trim();
  if (!isValidGroupName(newGroupName)) return;
  if (groupList.includes(newGroupName)) {
    showError('このグループ名は既に存在します。');
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
/**
 * グループリストの各行を生成するサブ関数
 * @param {string} groupName
 * @param {number} index
 * @returns {HTMLDivElement}
 */
function createGroupListItem(groupName, index) {
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
  return groupItem;
}

/**
 * グループ一覧を描画
 * @returns {void}
 */
function renderGroupList() {
  if (!groupListContainer) return;
  // 最新のグループリストを必ず取得
  groupList = getGroupList(currentProject);
  groupListContainer.innerHTML = "";
  if (groupList.length === 0) {
    groupListContainer.innerHTML = '<div class="text-gray-500 text-sm">グループが登録されていません</div>';
    return;
  }
  groupList.forEach((groupName, index) => {
    const groupItem = createGroupListItem(groupName, index);
    groupListContainer.appendChild(groupItem);
  });
}

/**
 * グループ名を更新する
 * @param {string} oldName - 旧グループ名
 * @param {string} newName - 新グループ名
 * @returns {void}
 */
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

/**
 * グループを削除する
 * @param {string} groupName - 削除するグループ名
 * @returns {void}
 */
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

// カラーピッカーのプレビュー反映
if (colorInput && document.getElementById('colorInputPreview')) {
  colorInput.addEventListener('input', () => {
    document.getElementById('colorInputPreview').style.background = colorInput.value;
  });
}
if (modalColor && document.getElementById('modalColorPreview')) {
  modalColor.addEventListener('input', () => {
    document.getElementById('modalColorPreview').style.background = modalColor.value;
  });
}

/**
 * グループフィルタ用ボタンを生成するサブ関数
 * @param {string} groupName
 * @returns {HTMLButtonElement}
 */
function createGroupFilterButton(groupName) {
  const btn = document.createElement("button");
  btn.textContent = groupName;
  btn.onclick = () => {
    currentGroupFilter = groupName;
    groupFilterDropdown.style.display = "none";
    renderCharacters();
  };
  if (groupName === currentGroupFilter) btn.style.fontWeight = "bold";
  return btn;
}

/**
 * グループフィルタのドロップダウンを描画する
 * @returns {void}
 */
function renderGroupFilterDropdown() {
  groupList = getGroupList(currentProject);
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
    const btn = createGroupFilterButton(g);
    groupFilterDropdown.appendChild(btn);
  });
}

/**
 * キャラ名が有効かどうかを判定
 * @param {string} name
 * @returns {boolean}
 * @example
 * isValidCharacterName("太郎") // true
 * isValidCharacterName("") // false
 */
function isValidCharacterName(name) {
  return typeof name === 'string' && name.trim().length > 0;
}
/**
 * グループ名が有効かどうかを判定
 * @param {string} name
 * @returns {boolean}
 * @example
 * isValidGroupName("Aチーム") // true
 * isValidGroupName("") // false
 */
function isValidGroupName(name) {
  return typeof name === 'string' && name.trim().length > 0;
}
/**
 * 座標値が有効かどうかを判定
 * @param {number} value
 * @returns {boolean}
 * @example
 * isValidCoordinate(0.5) // true
 * isValidCoordinate(-1) // false
 * isValidCoordinate(1.1) // false
 */
function isValidCoordinate(value) {
  return typeof value === 'number' && !isNaN(value) && value >= 0 && value <= 1;
}
/**
 * カラーコードが有効かどうかを判定
 * @param {string} color
 * @returns {boolean}
 * @example
 * isValidColorCode("#b5ead7") // true
 * isValidColorCode("red") // false
 */
function isValidColorCode(color) {
  return typeof color === 'string' && /^#[0-9a-fA-F]{6}$/.test(color);
}

/**
 * 主要なイベントリスナーを初期化する
 * @returns {void}
 */
function setupEventListeners() {
  // ...（省略：既存のイベントリスナー初期化処理）
}

document.addEventListener("DOMContentLoaded", () => {
  setupEventListeners();
});

// HTMLエスケープ関数
function escapeHtml(str) {
  return String(str).replace(/[&<>'"]/g, function(tag) {
    const chars = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    };
    return chars[tag] || tag;
  });
}

// ===== 必須項目リスト（削除不可・固定順） =====
const REQUIRED_FIELDS = [
  { key: 'name', label: 'キャラ名', type: 'text', required: true },
  { key: 'belief', label: '主義', type: 'text' },
  { key: 'group', label: 'グループ', type: 'text' },
  { key: 'gapPersonality', label: '性格GAP', type: 'text' },
  { key: 'gapAbility', label: '能力GAP', type: 'text' },
  { key: 'gapBackground', label: '経歴GAP', type: 'text' },
  { key: 'beliefX', label: 'マトリクスX座標', type: 'number' },
  { key: 'beliefY', label: 'マトリクスY座標', type: 'number' },
  { key: 'freeNote', label: '自由記述', type: 'textarea' },
  { key: 'color', label: 'キャラ色', type: 'color' },
];

// ===== 全作品共通デフォルトカスタム項目リスト（ユーザー設定可） =====
function getDefaultCustomFields() {
  const saved = localStorage.getItem("defaultCustomFields");
  return saved ? JSON.parse(saved) : [];
}
function setDefaultCustomFields(fields) {
  localStorage.setItem("defaultCustomFields", JSON.stringify(fields));
}

// ===== 作品ごとのカスタム項目リスト（主義の上・並び順保存） =====
function getCustomFields(project) {
  const saved = localStorage.getItem(project + "_customFields");
  if (saved) return JSON.parse(saved);
  // 新規作品は全作品共通デフォルトカスタム項目をコピー
  return getDefaultCustomFields();
}
function setCustomFields(project, fields) {
  localStorage.setItem(project + "_customFields", JSON.stringify(fields));
}

// ===== 必須＋カスタム項目の合成（主義の上にカスタム項目を挿入） =====
function getAllFields(project) {
  const customFields = getCustomFields(project);
  // 主義のindexを探す
  const idx = REQUIRED_FIELDS.findIndex(f => f.key === "belief");
  // 主義の上にカスタム項目を挿入
  const fields = [
    ...REQUIRED_FIELDS.slice(0, idx),
    ...customFields,
    ...REQUIRED_FIELDS.slice(idx)
  ];
  return fields;
}

// ===== 項目編集UIの描画・追加・削除 =====
const fieldEditContainer = document.getElementById("fieldEditContainer");
const addFieldButton = document.getElementById("addFieldButton");
const newFieldName = document.getElementById("newFieldName");
const newFieldType = document.getElementById("newFieldType");
const setDefaultFieldsButton = document.getElementById("setDefaultFieldsButton");

let fieldSortableInstance = null;

function renderFieldEditUI() {
  if (!fieldEditContainer) return;
  const customFields = getCustomFields(currentProject);
  fieldEditContainer.innerHTML = "";
  if (customFields.length === 0) {
    fieldEditContainer.innerHTML = '<div style="padding:8px;">カスタム項目はありません</div>';
    return;
  }
  customFields.forEach((f, i) => {
    const row = document.createElement("div");
    row.className = "flex items-center gap-2 mb-1 field-edit-row";
    row.setAttribute("data-idx", i);
    row.innerHTML = `
      <span class="flex-1">${f.label} <span style=\"color:#aaa;font-size:0.9em;\">(${f.type})</span></span>
      <button class="button btn-delete btn-sm" data-idx="${i}" title="削除"><i class="fas fa-trash"></i></button>
      <span class="drag-handle" style="cursor:grab;padding:0 0.5em;">☰</span>
    `;
    // 削除ボタン
    row.querySelector(".btn-delete").onclick = () => {
      const fields = getCustomFields(currentProject);
      fields.splice(i, 1);
      setCustomFields(currentProject, fields);
      renderFieldEditUI();
    };
    fieldEditContainer.appendChild(row);
  });
  // 並び替え（Sortable.js）
  if (fieldSortableInstance) fieldSortableInstance.destroy();
  fieldSortableInstance = new Sortable(fieldEditContainer, {
    animation: 150,
    handle: ".drag-handle",
    onEnd: function () {
      const newOrder = Array.from(fieldEditContainer.children).map(row => {
        const idx = parseInt(row.getAttribute("data-idx"), 10);
        return getCustomFields(currentProject)[idx];
      });
      setCustomFields(currentProject, newOrder);
      renderFieldEditUI();
    }
  });
}

if (addFieldButton && newFieldName && newFieldType) {
  addFieldButton.onclick = () => {
    const name = newFieldName.value.trim();
    const type = newFieldType.value;
    if (!name) return;
    const fields = getCustomFields(currentProject);
    // 重複チェック
    if (fields.some(f => f.label === name)) {
      alert("同じ名前の項目が既に存在します");
      return;
    }
    fields.push({ key: "custom_" + Date.now(), label: name, type });
    setCustomFields(currentProject, fields);
    newFieldName.value = "";
    renderFieldEditUI();
  };
}

if (setDefaultFieldsButton) {
  setDefaultFieldsButton.onclick = () => {
    const fields = getCustomFields(currentProject);
    setDefaultCustomFields(fields);
    alert("この項目構成を全作品のデフォルトに設定しました");
  };
}

// 初期描画
renderFieldEditUI();

const characterForm = document.querySelector('.character-form');

function renderCharacterForm() {
  if (!characterForm) return;
  // form-titleとsaveButton以外を一旦クリア
  const title = characterForm.querySelector('.form-title');
  const saveBtn = characterForm.querySelector('#saveButton');
  // 既存のform-groupとsuggestionAreaを削除
  Array.from(characterForm.querySelectorAll('.form-group, #suggestionArea, #groupSuggestArea')).forEach(e => e.remove());
  // フィールドを取得
  const fields = getAllFields(currentProject);
  // 各フィールドを生成
  fields.forEach(field => {
    // 必須項目はkeyで分岐
    let group = document.createElement('div');
    group.className = 'form-group';
    let label = document.createElement('label');
    label.textContent = field.label;
    group.appendChild(label);
    let input;
    if (field.type === 'textarea') {
      input = document.createElement('textarea');
      input.className = 'input';
      input.rows = 3;
      input.id = field.key + 'Input';
      input.placeholder = field.label + 'を入力';
      input.setAttribute('aria-label', field.label + '入力欄');
    } else if (field.type === 'color') {
      input = document.createElement('input');
      input.type = 'color';
      input.className = 'input';
      input.id = field.key + 'Input';
      input.value = '#b5ead7';
      input.setAttribute('aria-label', field.label + '選択欄');
      // カラープレビュー
      const preview = document.createElement('span');
      preview.className = 'color-preview';
      preview.style.background = '#b5ead7';
      preview.id = field.key + 'InputPreview';
      input.addEventListener('input', () => {
        preview.style.background = input.value;
      });
      const wrap = document.createElement('div');
      wrap.style.display = 'flex';
      wrap.style.alignItems = 'center';
      wrap.style.gap = '8px';
      wrap.appendChild(input);
      wrap.appendChild(preview);
      group.appendChild(wrap);
      characterForm.insertBefore(group, saveBtn);
      return;
    } else {
      input = document.createElement('input');
      input.type = field.type === 'number' ? 'number' : 'text';
      input.className = 'input';
      input.id = field.key + 'Input';
      input.placeholder = field.label + 'を入力';
      input.setAttribute('aria-label', field.label + '入力欄');
    }
    group.appendChild(input);
    // サジェスト欄やグループサジェスト欄の挿入
    if (field.key === 'group') {
      const suggest = document.createElement('div');
      suggest.id = 'groupSuggestArea';
      suggest.className = 'suggestion-area';
      group.appendChild(suggest);
    }
    if (field.key === 'belief') {
      const suggest = document.createElement('div');
      suggest.id = 'suggestionArea';
      suggest.className = 'suggestion-area';
      group.appendChild(suggest);
    }
    characterForm.insertBefore(group, saveBtn);
  });
}

// カスタム項目編集時にもフォームを再描画
if (fieldEditContainer) {
  const origRender = renderFieldEditUI;
  renderFieldEditUI = function() {
    origRender.apply(this, arguments);
    renderCharacterForm();
  };
}
// 初期描画
renderCharacterForm();

function renderEditModalFields(char = {}) {
  const modalFields = document.querySelector('.modal-fields');
  const modalNotes = document.querySelector('.modal-notes');
  if (!modalFields || !modalNotes) return;
  // 既存のmb-3をクリア
  Array.from(modalFields.querySelectorAll('.mb-3')).forEach(e => e.remove());
  Array.from(modalNotes.querySelectorAll('.mb-3')).forEach(e => e.remove());
  // フィールドを取得
  const fields = getAllFields(currentProject);
  fields.forEach(field => {
    let group = document.createElement('div');
    group.className = 'mb-3';
    let label = document.createElement('label');
    label.textContent = field.label;
    group.appendChild(label);
    let input;
    if (field.type === 'textarea') {
      input = document.createElement('textarea');
      input.className = 'input';
      input.rows = 3;
      input.id = 'modal' + capitalize(field.key);
      input.placeholder = field.label + 'を入力';
      input.setAttribute('aria-label', field.label + '編集欄');
      input.value = char[field.key] || '';
    } else if (field.type === 'color') {
      input = document.createElement('input');
      input.type = 'color';
      input.className = 'input';
      input.id = 'modal' + capitalize(field.key);
      input.value = char[field.key] || '#b5ead7';
      input.setAttribute('aria-label', field.label + '編集欄');
      // カラープレビュー
      const preview = document.createElement('span');
      preview.className = 'color-preview';
      preview.style.background = input.value;
      preview.id = 'modal' + capitalize(field.key) + 'Preview';
      input.addEventListener('input', () => {
        preview.style.background = input.value;
      });
      const wrap = document.createElement('div');
      wrap.style.display = 'flex';
      wrap.style.alignItems = 'center';
      wrap.style.gap = '8px';
      wrap.appendChild(input);
      wrap.appendChild(preview);
      group.appendChild(wrap);
      modalFields.appendChild(group);
      return;
    } else {
      input = document.createElement('input');
      input.type = field.type === 'number' ? 'number' : 'text';
      input.className = 'input';
      input.id = 'modal' + capitalize(field.key);
      input.placeholder = field.label + 'を入力';
      input.setAttribute('aria-label', field.label + '編集欄');
      input.value = char[field.key] || '';
    }
    group.appendChild(input);
    // サジェスト欄やグループサジェスト欄の挿入
    if (field.key === 'group') {
      const suggest = document.createElement('div');
      suggest.id = 'modalGroupSuggestArea';
      suggest.className = 'suggestion-area';
      group.appendChild(suggest);
    }
    modalFields.appendChild(group);
    if (field.key === 'freeNote') {
      modalNotes.appendChild(group);
    }
  });
}
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
// モーダルオープン時に自動生成
const origOpenEditModal = openEditModal;
openEditModal = function(index) {
  const char = characters[index];
  renderEditModalFields(char);
  origOpenEditModal.apply(this, arguments);
};
// カスタム項目編集時にも再描画
if (fieldEditContainer) {
  const origRender = renderFieldEditUI;
  renderFieldEditUI = function() {
    origRender.apply(this, arguments);
    renderCharacterForm();
    renderEditModalFields();
  };
}
// 初期描画
renderEditModalFields();

// カスタム項目追加・並べ替え時にキャラカードも即再描画
if (fieldEditContainer) {
  const origRender = renderFieldEditUI;
  renderFieldEditUI = function() {
    origRender.apply(this, arguments);
    renderCharacterForm();
    renderEditModalFields();
    renderCharacters();
  };
}

// ページ読み込み時に直近の作品を自動選択
window.addEventListener('DOMContentLoaded', () => {
  const last = localStorage.getItem('lastOpenedProject');
  if (last && Array.from(projectSelect.options).some(opt => opt.value === last)) {
    projectSelect.value = last;
    currentProject = last;
    characters = getCharacters(currentProject);
    groupList = getGroupList(currentProject);
    renderCharacters();
    renderMatrix();
    renderGroupList();
    renderFieldEditUI();
  }
});
