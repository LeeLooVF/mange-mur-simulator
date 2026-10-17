export async function onRequest(context) {
  const { request, env } = context;

  // On prépare les en-têtes pour autoriser le jeu à lire les données
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  };

  // SI LE JEU DEMANDE LE CLASSEMENT (GET)
  if (request.method === 'GET') {
    let scores = await env.TOP10_SCORES.get('leaderboard', 'json');
    if (!scores) scores = []; // Si la base est vide, on renvoie un tableau vide
    return new Response(JSON.stringify(scores), { headers });
  }

  // SI LE JEU ENVOIE UN NOUVEAU SCORE (POST)
  if (request.method === 'POST') {
    try {
      const newScore = await request.json(); // On lit le score envoyé
      
      // On récupère l'ancien classement
      let scores = await env.TOP10_SCORES.get('leaderboard', 'json');
      if (!scores) scores = [];

      // On ajoute le nouveau score
      scores.push(newScore);
      
      // On trie du plus grand au plus petit
      scores.sort((a, b) => b.score - a.score);
      
      // On garde uniquement les 10 premiers !
      scores = scores.slice(0, 10);

      // On sauvegarde le nouveau classement dans la base de données
      await env.TOP10_SCORES.put('leaderboard', JSON.stringify(scores));
      
      return new Response(JSON.stringify(scores), { headers });
    } catch (e) {
      return new Response("Erreur serveur", { status: 500, headers });
    }
  }

  return new Response("Méthode non autorisée", { status: 405, headers });
}
