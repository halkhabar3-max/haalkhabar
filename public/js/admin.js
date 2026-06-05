document.getElementById("newsForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = document.getElementById("title").value;
  const image = document.getElementById("image").files[0];

  const formData = new FormData();
  formData.append("title", title);
  formData.append("image", image);

  const res = await fetch("/api/news", {
    method: "POST",
    body: formData
  });

  const data = await res.json();
  alert(data.message);

  location.reload();
});
