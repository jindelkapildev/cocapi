export default async function handler(req, res) {
    const { tag } = req.query;
    const apiKey = req.headers.authorization;

    if (!tag) {
        return res.status(400).json({ error: "Missing clan tag" });
    }

    try {
        const response = await fetch(`https://cocproxy.royaleapi.dev/v1/clans/${encodeURIComponent(tag)}`, {
            headers: {
                'Authorization': apiKey,
                'Accept': 'application/json'
            }
        });
        
        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch clan data" });
    }
}
