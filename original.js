(async () => {
  const APP_ID = "936619743392459"; // Instagram web app id, required header
  const userId = document.cookie.match(/ds_user_id=(\d+)/)?.[1];
  if (!userId) {
    console.error("No ds_user_id cookie - run this on instagram.com while logged in.");
    return;
  }
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  async function fetchAll(kind) {
    const users = new Map();
    let maxId = "";
    let page = 0;
    do {
      const url = `/api/v1/friendships/${userId}/${kind}/?count=50${maxId ? `&max_id=${maxId}` : ""}`;
      const res = await fetch(url, {
        headers: { "X-IG-App-ID": APP_ID },
        credentials: "include",
      });
      if (res.status === 429) {
        console.warn("Rate limited, waiting 60s...");
        await sleep(60000);
        continue;
      }
      if (!res.ok) throw new Error(`${kind}: HTTP ${res.status}`);
      const data = await res.json();
      for (const u of data.users ?? []) users.set(String(u.pk ?? u.pk_id ?? u.id), u);
      maxId = data.next_max_id ?? "";
      console.log(`${kind}: ${users.size} loaded`);
      await sleep(++page % 6 === 0 ? 10000 : 1000 + Math.random() * 500);
    } while (maxId);
    return users;
  }

  try {
    const following = await fetchAll("following");
    const followers = await fetchAll("followers");

    const notFollowingBack = [...following.entries()]
      .filter(([id]) => !followers.has(id))
      .map(([, u]) => ({ username: u.username, full_name: u.full_name, id: String(u.pk ?? u.id) }));

    console.log(`Following: ${following.size} | Followers: ${followers.size} | Not following back: ${notFollowingBack.length}`);
    console.table(notFollowingBack);

    const blob = new Blob([JSON.stringify(notFollowingBack, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "usersNotFollowingBack.json";
    a.click();
  } catch (e) {
    console.error("Failed:", e);
  }
})();
