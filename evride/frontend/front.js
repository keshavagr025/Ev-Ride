function startRiding() {
  const hero = document.querySelector(".hero");
  hero.style.transition = "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)";
  hero.style.transform = "scale(1.1)";
  hero.style.opacity = "0";

  setTimeout(() => {
    window.location.href = "index.html";
  }, 800);
}

// Parallax effect on mouse move
document.addEventListener("mousemove", (e) => {
  const shapes = document.querySelectorAll(".floating-shape");
  const mouseX = e.clientX / window.innerWidth;
  const mouseY = e.clientY / window.innerHeight;

  shapes.forEach((shape, index) => {
    const speed = (index + 1) * 20;
    const x = (mouseX - 0.5) * speed;
    const y = (mouseY - 0.5) * speed;
    shape.style.transform = `translate(${x}px, ${y}px)`;
  });
});
