// dragMatrix.js

function enableMatrixDrag() {
  const matrixContainer = document.getElementById("matrix-container");
  if (!matrixContainer) return;

  matrixContainer.querySelectorAll(".matrix-char").forEach((dot, index) => {
    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    dot.addEventListener("mousedown", (e) => {
      isDragging = true;
      offsetX = e.offsetX;
      offsetY = e.offsetY;
      dot.style.zIndex = 1000;
    });

    document.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      const rect = matrixContainer.getBoundingClientRect();
      const x = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
      const y = Math.min(Math.max((e.clientY - rect.top) / rect.height, 0), 1);

      dot.style.left = `${x * 100}%`;
      dot.style.top = `${y * 100}%`;
      dot.style.transform = "translate(-50%, -50%)";

      // リアルタイムで座標を保存
      characters[index].beliefX = x;
      characters[index].beliefY = y;
      localStorage.setItem(currentProject, JSON.stringify(characters));
    });

    document.addEventListener("mouseup", () => {
      if (isDragging) {
        isDragging = false;
        dot.style.zIndex = "";
      }
    });
  });
}
