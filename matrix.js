// matrix.js

function renderMatrix() {
  const matrixContainer = document.getElementById("matrix-container");
  if (!matrixContainer) return;

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
}
  