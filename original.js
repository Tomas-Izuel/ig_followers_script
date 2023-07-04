// explica que hace el script y cada parte del codigo
// 1. Explicar que hace el script
// 2. Explicar cada parte del codigo
// 3. Explicar que hace el script

// 1. Explicar que hace el script
// Este script recorre todos los usuarios a los que sigues y crea un json con todos los usuarios que no te siguen de vuelta

// 2. Explicar cada parte del codigo
// 2.1 Funcion getCookie
// Esta funcion obtiene una cookie especifica del sitio web

// 2.2 Funcion sleep
// Esta funcion crea una promesa que se resuelve despues de un tiempo especifico

// 2.3 Funcion afterUrlGenerator
// Esta funcion crea una url para obtener los usuarios a los que sigue el usuario actual

// 2.4 Funcion unfollowUserUrlGenerator
// Esta funcion crea una url para dejar de seguir a un usuario

// 2.5 Variables
// followedPeople: Cantidad de personas a las que sigues
// csrftoken: Token para hacer peticiones
// ds_user_id: Id del usuario
// initialURL: Url de la peticion
// doNext: Variable para saber si hay que seguir haciendo peticiones
// filteredList: Lista de usuarios que no te siguen de vuelta
// getUnfollowCounter: Cantidad de usuarios que no te siguen de vuelta
// scrollCicle: Variable para saber cada cuanto tiempo hay que esperar para no ser baneado

// 2.6 Funcion startScript
// Esta funcion recorre todos los usuarios a los que sigues y crea un json con todos los usuarios que no te siguen de vuelta

// 3. Explicar que hace el script
// Este script recorre todos los usuarios a los que sigues y crea un json con todos los usuarios que no te siguen de vuelta
function getCookie(b) {
  let c = `; ${document.cookie}`,
    a = c.split(`; ${b}=`);
  if (2 === a.length) return a.pop().split(";").shift();
}
function sleep(a) {
  return new Promise((b) => {
    setTimeout(b, a);
  });
}
function afterUrlGenerator(a) {
  return `https://www.instagram.com/graphql/query/?query_hash=3dec7e2c57367ef3da3d987d89f9dbc8&variables={"id":"${ds_user_id}","include_reel":"true","fetch_mutual":"false","first":"24","after":"${a}"}`;
}
function unfollowUserUrlGenerator(a) {
  return `https://www.instagram.com/web/friendships/${a}/unfollow/`;
}
let followedPeople,
  csrftoken = getCookie("csrftoken"),
  ds_user_id = getCookie("ds_user_id"),
  initialURL = `https://www.instagram.com/graphql/query/?query_hash=3dec7e2c57367ef3da3d987d89f9dbc8&variables={"id":"${ds_user_id}","include_reel":"true","fetch_mutual":"false","first":"24"}`,
  doNext = !0,
  filteredList = [],
  getUnfollowCounter = 0,
  scrollCicle = 0;
async function startScript() {
  for (var c, d, e, b, f, g = Math.floor; doNext; ) {
    let a;
    try {
      a = await fetch(initialURL).then((a) => a.json());
    } catch (h) {
      continue;
    }
    followedPeople || (followedPeople = a.data.user.edge_follow.count),
      (doNext = a.data.user.edge_follow.page_info.has_next_page),
      (initialURL = afterUrlGenerator(
        a.data.user.edge_follow.page_info.end_cursor
      )),
      (getUnfollowCounter += a.data.user.edge_follow.edges.length),
      a.data.user.edge_follow.edges.forEach((a) => {
        a.node.follows_viewer || filteredList.push(a.node);
      }),
      console.clear(),
      console.log(
        `%c Progress ${getUnfollowCounter}/${followedPeople} (${parseInt(
          100 * (getUnfollowCounter / followedPeople)
        )}%)`,
        "background: #222; color: #bada55;font-size: 35px;"
      ),
      console.log(
        "%c This users don't follow you (Still in progress)",
        "background: #222; color: #FC4119;font-size: 13px;"
      ),
      filteredList.forEach((a) => {
        console.log(a.username);
      }),
      await sleep(g(400 * Math.random()) + 1e3),
      scrollCicle++,
      6 < scrollCicle &&
        ((scrollCicle = 0),
        console.log(
          "%c Sleeping 10 secs to prevent getting temp blocked",
          "background: #222; color: ##FF0000;font-size: 35px;"
        ),
        await sleep(1e4));
  }
  (c = JSON.stringify(filteredList)),
    (d = "usersNotFollowingBack.json"),
    (e = "application/json"),
    (b = document.createElement("a")),
    (f = new Blob([c], { type: e })),
    (b.href = URL.createObjectURL(f)),
    (b.download = d),
    b.click(),
    console.log(
      "%c All DONE!",
      "background: #222; color: #bada55;font-size: 25px;"
    );
}
startScript();
