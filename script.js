const nameInput = document.querySelector(".input:nth-of-type(1)");
const beliefInput = document.querySelector(".input:nth-of-type(2)");
const saveButton = document.querySelector(".button");
const characterList = document.getElementById("character-list");
const projectSelect = document.getElementById("projectSelect");

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

// 初期表示
renderCharacters();
