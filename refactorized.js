const getCookie = (cookie_name) => {
  const cookies = `; ${document.cookie}`; //Obtengo todas las cookies
  const needed_cookie = cookies.split(`; ${cookie_name}=`); // Separo las cookies por el nombre de la cookie que necesito
  if (2 === needed_cookie.length) return needed_cookie.pop().split(";").shift(); // Si la cookie existe, la devuelvo
};

const sleep = (time) => {
  // Esta funcion crea una promesa que se resuelve despues de un tiempo especifico
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
};

const afterUrlGenerator = (after) => {
  // Esta funcion crea una url para obtener los usuarios a los que sigue el usuario actual
  return `https://www.instagram.com/graphql/query/?query_hash=3dec7e2c57367ef3da3d987d89f9dbc8&variables={"id":"${ds_user_id}","include_reel":"true","fetch_mutual":"false","first":"24","after":"${after}"}`;
};

const unfollowUserUrlGenerator = (user_id) => {
  // Esta funcion crea una url para dejar de seguir a un usuario
  return `https://www.instagram.com/web/friendships/${user_id}/unfollow/`;
};

let totalFollowedPeople;
let csrftoken = getCookie("csrftoken");
let dsUserId = getCookie("ds_user_id");
let apiUrl = `https://www.instagram.com/graphql/query/?query_hash=3dec7e2c57367ef3da3d987d89f9dbc8&variables={"id":"${dsUserId}","include_reel":"true","fetch_mutual":"false","first":"24"}`;
let shouldContinue = true;
let unfollowedUsers = [];
let unfollowCounter = 0;
let scrollCycle = 0;

async function startScript() {
  for (;;) {
    let response;
    try {
      response = await fetch(apiUrl).then((res) => res.json());
    } catch (error) {
      continue;
    }

    if (!totalFollowedPeople) {
      totalFollowedPeople = response.data.user.edge_follow.count;
    }

    shouldContinue = response.data.user.edge_follow.page_info.has_next_page;
    apiUrl = generateAfterUrl(
      response.data.user.edge_follow.page_info.end_cursor
    );
    unfollowCounter += response.data.user.edge_follow.edges.length;

    response.data.user.edge_follow.edges.forEach((edge) => {
      if (!edge.node.follows_viewer) {
        unfollowedUsers.push(edge.node);
      }
    });

    console.clear();
    console.log(
      `%c Progress ${unfollowCounter}/${totalFollowedPeople} (${parseInt(
        100 * (unfollowCounter / totalFollowedPeople)
      )}%)`,
      "background: #222; color: #bada55;font-size: 35px;"
    );

    console.log(
      "%c Users who don't follow you back (Still in progress)",
      "background: #222; color: #FC4119;font-size: 13px;"
    );

    unfollowedUsers.forEach((user) => {
      console.log(user.username);
    });

    await sleep(Math.floor(400 * Math.random()) + 1000);
    scrollCycle++;

    if (scrollCycle > 6) {
      scrollCycle = 0;
      console.log(
        "%c Sleeping for 10 seconds to prevent temporary blocking",
        "background: #222; color: ##FF0000;font-size: 35px;"
      );
      await sleep(10000);
    }

    if (!shouldContinue) {
      const jsonContent = JSON.stringify(unfollowedUsers);
      const fileName = "usersNotFollowingBack.json";
      const contentType = "application/json";
      const downloadLink = document.createElement("a");
      const blob = new Blob([jsonContent], { type: contentType });
      downloadLink.href = URL.createObjectURL(blob);
      downloadLink.download = fileName;
      downloadLink.click();

      console.log(
        "%c All DONE!",
        "background: #222; color: #bada55;font-size: 25px;"
      );

      break;
    }
  }
}

startScript();
