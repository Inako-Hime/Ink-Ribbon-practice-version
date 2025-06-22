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
      <p><strong class="text-indigo-600">主義：</strong>${char.belief}</p>
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

// 保存ボタン処理
saveButton.addEventListener("click", () => {
  const name = nameInput.value;
  const belief = beliefInput.value;
  if (!name || !belief) return;

  const newChar = { name, belief };
  characters.push(newChar);
  localStorage.setItem(currentProject, JSON.stringify(characters));
  renderCharacters();
  nameInput.value = "";
  beliefInput.value = "";
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



