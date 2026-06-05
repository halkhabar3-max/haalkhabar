fetch("/api/news")
  .then(res => res.json())
  .then(data => {
    const grid = document.getElementById("newsGrid");

    data.forEach(news => {
      const div = document.createElement("div");
      div.className = "card";

      div.innerHTML = `
        <img src="/uploads/${news.image}" />
        <h3>${news.title}</h3>
      `;

      grid.appendChild(div);
    });
  });