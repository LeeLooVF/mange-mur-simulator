export async function onRequest(context) {
  const { request, env } = context;

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  };

  if (request.method === 'GET') {
    let scores = await env.TOP10_SCORES.get('leaderboard', 'json');
    if (!scores) scores = [];
    return new Response(JSON.stringify(scores), { headers });
  }

  if (request.method === 'POST') {
    try {
      const newScore = await request.json();
      let scores = await env.TOP10_SCORES.get('leaderboard', 'json');
      if (!scores) scores = [];

      scores.push(newScore);
      scores.sort((a, b) => b.score - a.score);
      scores = scores.slice(0, 10);

      await env.TOP10_SCORES.put('leaderboard', JSON.stringify(scores));
      return new Response(JSON.stringify(scores), { headers });
    } catch (e) {
      return new Response("Erreur serveur", { status: 500, headers });
    }
  }

  return new Response("Méthode non autorisée", { status: 405, headers });
}
