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
      "bg-white p-4 rounded-xl shadow-md text-gray-800 border border-gray-200 flex justify-between items-start gap-4";

    const content = document.createElement("div");
    content.innerHTML = `
  　　<h3 class="text-lg font-bold mb-1">${char.name}</h3>
  　　<p><strong class="text-indigo-600">主義：</strong>${
   　　 char.belief || "（未設定）"
  　　}</p>
  　　<p><strong>性格ギャップ：</strong>${char.gapPersonality || "（なし）"}</p>
  　　<p><strong>能力ギャップ：</strong>${char.gapAbility || "（なし）"}</p>
  　　<p><strong>生い立ちギャップ：</strong>${char.gapBackground || "（なし）"}</p>
`;


    const deleteButton = document.createElement("button");
    deleteButton.textContent = "削除";
    deleteButton.className =
      "text-white bg-red-500 px-3 py-1 rounded hover:bg-red-600 text-sm";

    deleteButton.addEventListener("click", () => {
      characters.splice(index, 1);
      localStorage.setItem(currentProject, JSON.stringify(characters));
      renderCharacters();
    });

    charItem.appendChild(content);
    charItem.appendChild(deleteButton);
    characterList.appendChild(charItem);
  });
}

// 入力に応じた候補表示処理
beliefInput.addEventListener("input", () => {
  const belief = beliefInput.value.trim();
  const suggestions = suggestionData[belief];

  suggestionArea.innerHTML = ""; // 一旦リセット

  if (suggestions) {
    // 各タイプごとに候補を表示
    for (const type in suggestions) {
      const group = document.createElement("div");
      group.innerHTML = `<strong class="block mb-1">${type}のギャップ候補：</strong>`;

      suggestions[type].slice(0, 3).forEach((gap) => {
        const btn = document.createElement("button");
        btn.textContent = gap;
        btn.className =
          "bg-gray-200 px-2 py-1 mr-2 mb-1 rounded hover:bg-gray-300";

        // クリックで各入力欄に自動入力
        btn.addEventListener("click", () => {
          if (type === "personality") gapPersonalityInput.value = gap;
          if (type === "ability") gapAbilityInput.value = gap;
          if (type === "background") gapBackgroundInput.value = gap;
        });

        group.appendChild(btn);
      });

      suggestionArea.appendChild(group);
    }
  }
});


// 保存ボタン処理
saveButton.addEventListener("click", () => {
  const name = nameInput.value.trim();
  const belief = beliefInput.value.trim();
  const gapPersonality = gapPersonalityInput.value.trim();
  const gapAbility = gapAbilityInput.value.trim();
  const gapBackground = gapBackgroundInput.value.trim();

  if (!name) return; // キャラ名だけは必須、それ以外は空でもOK

  const newChar = {
    name,
    belief,
    gapPersonality,
    gapAbility,
    gapBackground,
  };

  characters.push(newChar);
  localStorage.setItem(currentProject, JSON.stringify(characters));
  renderCharacters();

  // 入力欄をすべてクリア
  nameInput.value = "";
  beliefInput.value = "";
  gapPersonalityInput.value = "";
  gapAbilityInput.value = "";
  gapBackgroundInput.value = "";
});


// 🔁 プロジェクト（作品）を切り替えたとき
projectSelect.addEventListener("change", () => {
  currentProject = projectSelect.value;
  characters = getCharacters(currentProject);
  renderCharacters();
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



